import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfileService } from 'src/app/services/Profile/profile.service';
import { PostUploadImagesService } from 'src/app/services/post-upload-images.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { AuthGuard } from 'src/app/AuthGuard/auth.guard';
import { AuthService } from 'src/app/services/auth.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';

import { UploadProfileComponent } from '../../Individual/upload-profile/upload-profile.component';
import { ImageModalComponent } from 'src/app/ComponentUI/Modal/image-modal/image-modal.component';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';

@Component({
  selector: 'app-profile-ui',
  templateUrl: './profile-ui.component.html',
  styleUrls: ['./profile-ui.component.css'],
})
export class ProfileUIComponent implements OnInit {

  // =========================
  // STATE
  // =========================
  error: any;
  profiles: any;
  users: any;
  posts: any[] = [];

  code: string | null = null;
  currentUserCode: any;

  isloading = false;

  followStatus: string = 'none';
  followId: number = 0;

  // pagination
  currentPage = 0;
  pageSize = 6;

  // reactions
  showReactions = false;
  selectedReactions: { [postId: string]: any } = {};
  hoveredReaction: any = null;

  reactions = [
    { name: 'Like', emoji: '👍' },
    { name: 'Love', emoji: '❤️' },
    { name: 'Haha', emoji: '😂' },
    { name: 'Wow', emoji: '😮' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😡' }
  ];

  constructor(
    private profile: ProfileService,
    private postDataservices: PostUploadImagesService,
    private comment: CommentService,
    private alert: NotificationsService,
    private clientServices: ClientsService,
    private authGuard: AuthGuard,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,public feature: FeatureService, public sharedRoutines: SharedRoutinesService
  ) { }

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.currentUserCode = this.authService.getAuthCode?.();

    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      const role = params.get('role');

      console.log('ROLE:', role);
      console.log('CODE:', this.code);

      if (this.code) {
        this.initData();
      }
    });
  }

  UserCV() {
    this.router.navigateByUrl("/DEF-USERS/user-cv")
  }
  // =========================
  // INIT LOAD
  // =========================
  initData(): void {
    this.loadUserPost();
    this.loadUserData();
    this.loadProfileCV();
    this.loadProfileCoverPhoto();
    this.checkFollowStatus(this.code!);
  }

  // =========================
  // POSTS
  // =========================
  loadUserPost(): void {
    this.isloading = true;

    this.postDataservices.getDataPost(this.code!).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {

          this.posts = res.data.map((post: any) => ({
            ...post,
            fullname: post.fullname || post.Fullname || 'Unknown User',
            profile_pic: this.fixUrl(post.profile_pic),
            images: (post.images || []).map((img: any) => ({
              ...img,
              path_url: this.fixUrl(img.path_url)
            })),
            videos: (post.videos || []).map((vid: any) => ({
              ...vid,
              path_url: this.fixUrl(vid.path_url)
            })),
            comments: (post.comments || []).map((c: any) => ({
              ...c,
              profile_pic: this.fixUrl(c.profile_pic),
              replies: (c.replies || []).map((r: any) => ({
                ...r,
                profile_pic: this.fixUrl(r.profile_pic)
              }))
            })),
            visibleComments: 3,
            liked: false
          }));

        }

        this.isloading = false;
      },
      error: (err) => {
        console.error(err);
        this.isloading = false;
      }
    });
  }

  // =========================
  // PROFILE DATA
  // =========================
  loadUserData(): void {
    this.profile.getProfileByUserOnly().subscribe({
      next: (res) => this.users = res?.message?.[0],
      error: (err) => this.error = err.message
    });
  }

  loadProfileCV(): void {
    this.profile.getProfileByUser(this.code!).subscribe({
      next: (res) => this.profiles = res?.message,
      error: (err) => this.error = err.message
    });
  }

  loadProfileCoverPhoto(): void {
    this.profile.getCompanyProfile(this.code!).subscribe({
      next: (res) => this.coverphoto = res?.message,
      error: (err) => this.error = err.message
    });
  }

  coverphoto: any;

  // =========================
  // FOLLOW SYSTEM
  // =========================
  checkFollowStatus(code: string): void {
    this.clientServices.getPendingFollowStatus(code).subscribe({
      next: (res: any) => {
        this.followStatus = res.follow_status || 'none';

        const record = res?.data?.[0];
        this.followId = record?.id || record?.follow_id || 0;
      }
    });
  }

  AddFollow(code: any, status: string, first: string, last: string): void {
    if (!code) return;

    const fullname = `${first} ${last}`;

    let confirmMessage = '';

    if (status === 'none') confirmMessage = 'Send follow request?';
    if (status === 'pending') confirmMessage = 'Cancel request?';
    if (status === 'accepted') confirmMessage = 'Unfollow user?';

    this.alert.popupWarning(fullname, confirmMessage).then(result => {
      if (!result.value) return;

      const request$ =
        status === 'accepted'
          ? this.profile.Unfollow(this.followId)
          : this.profile.AddFollow(code);

      request$.subscribe({
        next: (res: any) => {
          this.followStatus = res.follow_status || 'none';
          this.alert.toastrSuccess(res.message || 'Success');
        },
        error: (err) => {
          this.alert.toastrError(err.error?.message || 'Error');
        }
      });
    });
  }

  // =========================
  // COMMENTS
  // =========================
  addComment(post: any): void {
    const text = post.newComment?.trim();
    if (!text) return;

    post.isSubmitting = true;

    this.comment.postComment(post.posts_uuid, { comment: text }).subscribe({
      next: () => {
        post.comments.push({
          user: 'You',
          comment: text,
          likes: 0,
          replies: []
        });

        post.newComment = '';
        post.isSubmitting = false;
      },
      error: () => {
        post.isSubmitting = false;
        this.alert.toastPopUpError('Comment failed');
      }
    });
  }

  addReply(comment: any): void {
    const text = comment.newReply?.trim();
    if (!text) return;

    comment.isSubmitting = true;

    this.comment.postCommentByReply(comment.comment_uuid, { comment: text }).subscribe({
      next: () => {
        comment.replies.push({
          user: 'You',
          comment: text,
          likes: 0
        });

        comment.newReply = '';
        comment.isSubmitting = false;
      },
      error: () => {
        comment.isSubmitting = false;
        this.alert.toastPopUpError('Reply failed');
      }
    });
  }

  // =========================
  // LIKE POST
  // =========================
  likePost(post: any): void {
    post.liked = !post.liked;
    post.likes = (post.likes || 0) + (post.liked ? 1 : -1);

    this.postDataservices.likePost(post.posts_uuid, post.liked).subscribe();
  }

  // =========================
  // MODAL
  // =========================
  openModal(image: any): void {
    const dialogConfig: MatDialogConfig = {
      data: image,
      minWidth: '70%',
      maxWidth: '90%',
      maxHeight: '90vh'
    };

    this.dialog.open(ImageModalComponent, dialogConfig);
  }

  uploadPic(): void {
    this.dialog.open(UploadProfileComponent, {
      width: '400px',
      disableClose: true
    });
  }

  // =========================
  // HELPERS
  // =========================
  fixUrl(url: string): string {
    if (!url) return 'assets/default.png';
    return 'https://lightgreen-pigeon-122992.hostingersite.com/' + url.replace(/\\/g, '');
  }

  getActiveHours(lastActive: string): string {
    if (!lastActive) return 'unknown';

    const diff = Math.floor(
      (Date.now() - new Date(lastActive).getTime()) / 3600000
    );

    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 hour ago';
    return `${diff} hours ago`;
  }

  // =========================
  // ROUTING
  // =========================

}