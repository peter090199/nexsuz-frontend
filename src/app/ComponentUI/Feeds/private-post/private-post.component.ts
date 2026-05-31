import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewChildren, ElementRef, QueryList, HostListener, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription, Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { PrintCVComponent } from 'src/app/ComponentSharedUI/Individual/print-cv/print-cv.component';
import { UploadProfileComponent } from 'src/app/ComponentSharedUI/Individual/upload-profile/upload-profile.component';
import { PostUIComponent } from 'src/app/ComponentSharedUI/Public/post-ui/post-ui.component';
import { ImageModalComponent } from '../../Modal/image-modal/image-modal.component';
import { ReactionPostComponent } from 'src/app/ComponentSharedUI/ReactionEmoji/reaction-post/reaction-post.component';

import { ProfileService } from 'src/app/services/Profile/profile.service';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { PostUploadImagesService } from 'src/app/services/post-upload-images.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import { ReactionEmojiService } from 'src/app/services/Reaction/reaction-emoji.service';
import { PostReactionByIdService } from 'src/app/services/Reaction/post-reaction-by-id.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';
import { EchoService } from 'src/app/services/echo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatMenuPanel } from '@angular/material/menu';
import { CommentModalUIComponent } from '../../Modal/comment-modal-ui/comment-modal-ui.component';

interface Reaction { emoji: string; label: string }

@Component({
  selector: 'app-private-post',
  templateUrl: './private-post.component.html',
  styleUrls: ['./private-post.component.css']
})
export class PrivatePostComponent implements OnInit, AfterViewInit, OnDestroy {
  error: string;
  deletePost(_t30: any) {
    throw new Error('Method not implemented.');
  }
  // Inputs & ViewChildren
  @Input() postId!: number;
  @ViewChild('feedContainer') feedContainer!: ElementRef;
  @ViewChildren('videoEl') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  // State
  posts: any[] = [];
  profiles: any;
  profile_pic: any = null;
  users: any[] = [];
  isLoading = false;

  // Pagination / infinite scroll
  page = 1;
  perPage = 5;
  allLoaded = false;

  // reactions
  postReactions: {
    [postId: number]: { reactions: any[], totalCount: number }
  } = {};

  userReactions: { [postId: number]: Reaction | null } = {};
  isPopupVisible: { [postId: number]: boolean } = {};

  // realtime
  private destroy$ = new Subject<void>();
  private echoSub?: Subscription;
  newPostsQueue: any[] = [];
  newPostsAvailable = false;

  // intersection observer for autoplay
  private observer?: IntersectionObserver;

  // constants
  private baseUrl = 'https://exploredition.com/';
  private defaultProfile = `${this.baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`;
  menu_: MatMenuPanel<any>;
  code:any; 

  hoveredReactions: { [postId: number]: Reaction | null } = {};

  reaction = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' }
  ];

  // DI
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private cvService: CurriculumVitaeService,
    private postService: PostUploadImagesService,
    private authService: AuthService,
    private alert: NotificationsService,
    private commentService: CommentService,
    private reactionService: ReactionEmojiService,
    private postReactionByIdService: PostReactionByIdService,
    private clientsService: ClientsService,
    private echoService: EchoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private postDataservices: PostUploadImagesService,
  ) {
    const url = window.location.href;
    const codesplit = url.split('/').pop();
    this.code = codesplit;
   }

  /* --------------------------- lifecycle --------------------------- */
  ngOnInit(): void {
    this.initRealtime();
    this.loadInitialData();
    this.loadProfileCV();
  }

  
  loadProfileCV() {
    this.profileService.getProfileByUser(this.code).subscribe({
      next: (response) => {
        if (response.success == true) {
          this.profiles = response.message;

        } else {
          this.error = 'Failed to load profile data';
        }
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching profile data';
      },
    });
  }


  ngAfterViewInit(): void {
    this.setupAutoPlayObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.echoSub?.unsubscribe();
    if (this.observer) this.observer.disconnect();
  }

  /* --------------------------- initial loaders --------------------------- */
  private loadInitialData(): void {
    this.isLoading = true;
    const calls = {
      profile: this.profileService.getProfileByUserOnly().pipe(catchError(() => of(null))),
      cv: this.cvService.getDataCV().pipe(catchError(() => of(null))),
      people: this.clientsService.getPeopleRecentActivity().pipe(catchError(() => of([]))),
      posts: this.postService.getDataPost(this.route.snapshot.paramMap.get('code') || window.location.href.split('/').pop())
        .pipe(catchError(() => of({ success: false, data: [] })))
    } as any;

    forkJoin(calls)
      .pipe(finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe((res: any) => {
        if (res.profile?.success) this.profiles = res.profile.message;
        if (res.cv?.message) this.profile_pic = res.cv.message;
        if (res.people?.data) this.users = res.people.data;

        if (res.posts?.success && Array.isArray(res.posts.data)) {
          this.posts = res.posts.data.map((p: any) => this.formatPost(p));
          // batch load reactions to reduce HTTP overhead
          this.loadReactionsBatch(this.posts.map(p => p.id));
        }
      }, err => {
        console.error('Initial load error', err);
      });
  }

  /* --------------------------- format helpers --------------------------- */
  private sanitizePath(path?: string): string { return (path || '').replace(/\\/g, ''); }
  private normUrl(path?: string): string { return this.baseUrl + this.sanitizePath(path); }

  private formatPost(post: any): any {
    return {
      ...post,
      fullname: post.fullname || post.Fullname || 'Unknown User',
      profile_pic: post.profile_pic ? this.normUrl(post.profile_pic) : this.defaultProfile,
      images: (post.images || []).map((i: any) => ({ ...i, path_url: this.normUrl(i.path_url) })),
      videos: (post.videos || []).map((v: any) => ({ ...v, path_url: this.normUrl(v.path_url) })),
      comments: (post.comments || []).map((c: any) => this.formatComment(c)),
      activeHours: this.getActiveHours(post.lastActive),
      visibleComments: 3,
      expanded: false
    };
  }

  private formatComment(c: any): any {
    return {
      ...c,
      profile_pic: c.profile_pic ? this.normUrl(c.profile_pic) : this.defaultProfile,
      replies: (c.replies || []).map((r: any) => this.formatComment(r))
    };
  }

  getActiveHours(lastActive: string): string {
    if (!lastActive) return 'unknown';
    const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60));
    if (diff < 1) return 'Just now';
    return diff === 1 ? '1 hour ago' : `${diff} hours ago`;
  }

  /* --------------------------- reactions --------------------------- */
  private loadReactionsBatch(postIds: number[]): void {
    if (!postIds || postIds.length === 0) return;

    // create array of observables
    const calls = postIds.map(id => this.reactionService.getReactionByPostId(id).pipe(
      catchError(err => {
        console.error('Reaction fetch error for', id, err);
        return of({ react: [] });
      })
    ));

    forkJoin(calls).pipe(takeUntil(this.destroy$)).subscribe(results => {
      results.forEach((res: any, idx: number) => {
        const id = postIds[idx];
        if (res && Array.isArray(res.react)) {
          const mapped = res.react.map((r: any) => ({ ...r, emoji: this.reactionEmojiFor(r.reaction) }));
          const total = mapped.reduce((s: number, x: any) => s + (x.count || 0), 0);
          this.postReactions[id] = { reactions: mapped, totalCount: total };
        } else {
          this.postReactions[id] = { reactions: [], totalCount: 0 };
        }
      });
    }, err => console.error('Batch reaction error', err));
  }

  react: any = [];
  reactionEmojiMap2: any = {
    Like: '👍',
    Love: '❤️',
    Care: '🤗',
    Haha: '😂',
    Wow: '😮',
    Sad: '😢',
    Angry: '😡'
  };

  // on-demand single reaction load (lazy)
  totalReactionsCount: number = 0;
  loadReactions(postId: number): void {
    if (!postId) return;

    this.reactionService.getReactionByPostId(postId).subscribe({
      next: (res: any) => {
        if (res && res.react && Array.isArray(res.react)) {
          const mappedReactions = res.react.map((r: any) => ({
            ...r,
            emoji: this.reactionEmojiMap2[r.reaction] || 'thumb'
          }));

          const total = mappedReactions.reduce((sum: number, r: any) => sum + (r.count || 0), 0);

          this.postReactions[postId] = {
            reactions: mappedReactions,
            totalCount: total
          };
          this.totalReactionsCount = total;
        } else {
          this.postReactions[postId] = { reactions: [], totalCount: 0 };
          this.totalReactionsCount = 0;
        }
      },
      error: (err) => {
        console.error(`Error fetching reactions for post ${postId}:`, err);
        this.postReactions[postId] = { reactions: [], totalCount: 0 };
        this.totalReactionsCount = 0;
      }
    });
  }


  private reactionEmojiFor(name: string): string {
    const map: any = { Like: '👍', Love: '❤️', Care: '🤗', Haha: '😂', Wow: '😮', Sad: '😢', Angry: '😡' };
    return map[name] || '👍';
  }

  // selecting reaction (saves and reloads reactions for that post)
  async selectReactions(postId: number, react: any) {
    this.userReactions[postId] = react;
    this.isPopupVisible[postId] = false;
    console.log(`Selected reaction for post ${postId}:`, react.label);

    try {
      const res: any = await this.postReactionByIdService.saveReaction(postId, react.label).toPromise();
      if (res && res.success) {
        console.log('Reaction saved successfully');
      } else {
        console.error('Failed to save reaction:', res?.message || 'Unknown error');
      }
    } catch (err) {
      console.error('API error:', err);
    }
    this.loadReactions(postId);
  }

  /* --------------------------- posts (pagination / refresh) --------------------------- */
  refreshFeed(): void {
    this.page = 1;
    this.allLoaded = false;
    this.loadMorePosts(false);
  }

  loadMorePosts(append = true): void {
    if (this.isLoading || this.allLoaded) return;
    this.isLoading = true;

    this.postService.getDataPost(this.route.snapshot.paramMap.get('code') || window.location.href.split('/').pop())
      .pipe(finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe((res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((p: any) => this.formatPost(p));
          this.posts = append ? [...this.posts, ...formatted] : formatted;
          // load reactions for newly added posts lazily
          const ids = formatted.map((p: { id: any; }) => p.id);
          this.loadReactionsBatch(ids);
        } else {
          if (!append) this.posts = [];
        }
      }, err => {
        console.error('Error loading posts', err);
      });
  }

  /* --------------------------- comments --------------------------- */
  addComment(post: any): void {
    const text = (post.newComment || '').trim();
    if (!text) return;
    post.isSubmitting = true;

    this.commentService.postComment(post.posts_uuid, { comment: text }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        post.comments = post.comments || [];
        post.comments.push({ user: 'You', comment: text, profile_pic: '', replies: [] });
        post.newComment = '';
        post.isSubmitting = false;
      },
      error: (err) => {
        post.isSubmitting = false;
        console.error('Comment error', err);
        this.alert.toastPopUpError('Comment failed');
      }
    });
  }

  addReply(comment: any): void {
    const text = (comment.newReply || '').trim();
    if (!text) return;
    comment.isSubmitting = true;

    this.commentService.postCommentByReply(comment.comment_uuid, { comment: text }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        comment.replies = comment.replies || [];
        comment.replies.push({ user: 'You', comment: text, profile_pic: '' });
        comment.newReply = '';
        comment.isSubmitting = false;
      },
      error: (err) => {
        comment.isSubmitting = false;
        console.error('Reply error', err);
        this.alert.toastPopUpError('Reply failed');
      }
    });
  }

  /* --------------------------- UI helpers / modals --------------------------- */
  openModal(images: any[]): void {
    const dialogRef = this.dialog.open(ImageModalComponent, { data: images, width: '90%', maxWidth: '1200px' });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(res => { if (res) this.refreshFeed(); });
  }

  
  showReaction(postId: number) {
    this.isPopupVisible[postId] = true;
  }
  getReactionEmoji(postId: number): string {
    return this.hoveredReactions[postId]?.emoji
      || this.userReactions[postId]?.emoji
      || 'thumb_up';
  }

  getReactionLabel(postId: number): string {
    return this.hoveredReactions[postId]?.label
      || this.userReactions[postId]?.label
      || 'Like';
  }

  openCommentModal(post: any): void {
    this.dialog.open(CommentModalUIComponent, {
      width: '800px',
      data: post,
    });
  }

  hideReaction(postId: number) {
    this.isPopupVisible[postId] = false;
    this.hoveredReactions[postId] = null;
  }
  openReactionsModal(postId: number): void {
    this.dialog.open(ReactionPostComponent, { data: postId, width: '100%', maxWidth: '600px', panelClass: 'centered-modal' });
  }

  createPost(): void {
    const dialogRef = this.dialog.open(PostUIComponent, { width: '600px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshFeed());
  }

  toggleComments(post: any): void { post.showComments = !post.showComments; }

  trackByPostId(_: number, p: any) { return p.id; }

  /* --------------------------- realtime --------------------------- */
  private initRealtime(): void {
    this.echoSub = this.echoService.newPost$.pipe(takeUntil(this.destroy$)).subscribe(post => {
      if (!post) return;
      this.newPostsQueue.unshift(this.formatPost(post));
      this.newPostsAvailable = true;
    });
  }

  prependNewPosts(): void {
    if (this.newPostsQueue.length === 0) return;
    this.posts = [...this.newPostsQueue, ...this.posts];
    this.newPostsQueue = [];
    this.newPostsAvailable = false;
  }

  /* --------------------------- video autoplay --------------------------- */
  private setupAutoPlayObserver(): void {
    try {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // pause all others
            this.videoElements.forEach(v => { try { v.nativeElement.pause(); } catch { } });
            el.play().catch(() => { });
          } else {
            el.pause();
          }
        });
      }, { threshold: [0.6] });

      // observe current videos
      setTimeout(() => this.videoElements.forEach(v => this.observer?.observe(v.nativeElement)), 200);
    } catch (err) { console.warn('Observer not available', err); }
  }

  /* --------------------------- misc --------------------------- */
  sanitizeVideoUrl(url: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(url || ''); }

  // hover tooltip state
  hoverVisible = false;
  hoveredPostId: number | null = null;
  hoveredReactions2: any[] = [];
  hoverPosition = { x: 0, y: 0 };

  showHoverNames(postId: number, event: MouseEvent) {
    this.hoveredPostId = postId;
    this.hoverVisible = true;
    this.hoveredReactions2 = this.postReactions[postId]?.reactions || [];
    this.hoverPosition = {
      x: event.clientX - 50,
      y: event.clientY - 100
    };
  }


  hideHoverNames() {
    this.hoverVisible = false;
    this.hoveredPostId = null;
  }




  onEditPost(post: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = post;
    const dialogRef = this.dialog.open(PostUIComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.loadMorePosts(post.id);
    });
  }



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
            this.loadMorePosts(post.id);
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

