import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  Input,
  ChangeDetectorRef
} from '@angular/core';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { Subject, Subscription, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ProfileService } from 'src/app/services/Profile/profile.service';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { PostUploadImagesService } from 'src/app/services/post-upload-images.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import { ReactionEmojiService } from 'src/app/services/Reaction/reaction-emoji.service';
import { PostReactionByIdService } from 'src/app/services/Reaction/post-reaction-by-id.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';
import { EchoService } from 'src/app/services/echo.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

import { ImageModalComponent } from '../../Modal/image-modal/image-modal.component';
import { CommentModalUIComponent } from '../../Modal/comment-modal-ui/comment-modal-ui.component';
import { ReactionPostComponent } from 'src/app/ComponentSharedUI/ReactionEmoji/reaction-post/reaction-post.component';
import { PostUIComponent } from 'src/app/ComponentSharedUI/Public/post-ui/post-ui.component';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

interface Reaction {
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-public-post',
  templateUrl: './public-post.component.html',
  styleUrls: ['./public-post.component.css']
})
export class PublicPostComponent implements OnInit, AfterViewInit, OnDestroy {
  showPopup(arg0: any) {
    throw new Error('Method not implemented.');
  }
  hidePopup(arg0: any) {
    throw new Error('Method not implemented.');
  }

  @Input() posts: any[] = [];

  postReactions: any = {};
  userReactions: any = {};
  isPopupVisible: any = {};

  newPostsQueue: any[] = [];
  newPostsAvailable = false;

  private destroy$ = new Subject<void>();
  private realtimeSub?: Subscription;
  private observer?: IntersectionObserver;
  public sharedRoutinesService: SharedRoutinesService;
  reaction = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' }
  ];

  private baseUrl = 'https://api.nexsuz.com/';
  hovered: any;

  constructor(
    private postService: PostUploadImagesService,
    private reactionService: ReactionEmojiService,
    private reactionByIdService: PostReactionByIdService,
    private commentService: CommentService,
    private echoService: EchoService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private postDataservices: PostUploadImagesService,
    private alert: NotificationsService
  ) { }

  hoverVisible = false;
  hoveredPostId: number | null = null;
  hoveredReactions2: any[] = [];
  hoverPosition = { x: 0, y: 0 };


  ngOnInit(): void {
    this.loadPosts();
    this.listenRealtime();
  }

  ngAfterViewInit(): void {
    this.setupVideoObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.realtimeSub?.unsubscribe();
    this.observer?.disconnect();
  }

  // ================= LOAD POSTS =================
  loadPosts(): void {
    this.postService.getDataPostAddFollow()
      .subscribe((res: any) => {

        this.posts = (res?.data || []).map((p: any) => this.formatPost(p));

        this.posts.forEach(p => this.loadReactions(p.id));
      });
  }

  formatPost(post: any) {
    return {
      ...post,
      expanded: false,
      showComments: false,
      images: (post.images || []).map((i: any) => ({
        ...i,
        path_url: this.normalize(i.path_url)
      })),
      videos: (post.videos || []).map((v: any) => ({
        ...v,
        path_url: this.normalize(v.path_url)
      }))
    };
  }

  normalize(path: string) {
    return this.baseUrl + (path || '').replace(/\\/g, '');
  }

  // ================= REALTIME =================
  listenRealtime(): void {
    this.realtimeSub = this.echoService.newPost$
      .pipe(takeUntil(this.destroy$))
      .subscribe(post => {
        this.newPostsQueue.unshift(this.formatPost(post));
        this.newPostsAvailable = true;
      });
  }

  prependNewPosts(): void {
    this.posts = [...this.newPostsQueue, ...this.posts];
    this.newPostsQueue = [];
    this.newPostsAvailable = false;
  }

  // ================= REACTIONS =================
  loadReactions(postId: number): void {
    this.reactionService.getReactionByPostId(postId)
      .subscribe((res: any) => {

        const reactions = (res?.react || []).map((r: any) => ({
          ...r,
          emoji: this.getEmoji(r.reaction)
        }));

        const total = reactions.reduce((s: number, r: any) => s + (r.count || 0), 0);

        this.postReactions[postId] = { reactions, totalCount: total };
      });
  }

  async selectReaction(postId: number, react: any) {
    this.userReactions[postId] = react;
    this.isPopupVisible[postId] = false;

    await this.reactionByIdService.saveReaction(postId, react.label).toPromise();

    this.loadReactions(postId);
  }

  getEmoji(label: string): string {
    return {
      Like: '👍',
      Love: '❤️',
      Haha: '😂',
      Wow: '😮',
      Sad: '😢',
      Angry: '😡'
    }[label] || '👍';
  }

  // ================= COMMENTS =================
  addComment(post: any) {
    const text = post.newComment?.trim();
    if (!text) return;

    this.commentService.postComment(post.posts_uuid, { comment: text })
      .subscribe(() => post.newComment = '');
  }

  // ================= MODALS =================
  openImages(images: any[]) {
    this.dialog.open(ImageModalComponent, {
      data: images,
      width: '1200px'
    });
  }

  openComments(post: any) {
    this.dialog.open(CommentModalUIComponent, {
      width: '800px',
      data: post
    });
  }

  openReactions(postId: number) {
    this.dialog.open(ReactionPostComponent, {
      width: '600px',
      data: postId
    });
  }

  // ================= VIDEO AUTOPLAY =================
  @ViewChildren('videoEl') videoElements!: QueryList<ElementRef>;

  setupVideoObserver() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;

        if (entry.isIntersecting) video.play().catch(() => { });
        else video.pause();
      });
    }, { threshold: 0.6 });

    setTimeout(() => {
      this.videoElements.forEach(v =>
        this.observer?.observe(v.nativeElement)
      );
    }, 300);
  }


  onEditPost(post: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = post;
    const dialogRef = this.dialog.open(PostUIComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.loadPosts();
    });
  }


  isLoading: boolean = false;
  onDelete(post: any): void {
    this.alert.popupWarning("", "Are you sure you want to delete this post?").then((result: any) => {
      if (result?.value) {
        this.isLoading = true;
        this.postDataservices.deletePost(post.posts_uuid).subscribe({
          next: (res: any) => {
            if (res.success === true) {
              this.alert.toastrSuccess(res.message);
            } else {
              this.alert.toastrError(res.message);
            }
            this.loadPosts();
            this.isLoading = false;
          },
          error: (error: any) => {
            this.alert.toastrError(error.error?.message || "An error occurred while deleting the post.");
            this.isLoading = false;
          }
        });
      }
    });
  }


}