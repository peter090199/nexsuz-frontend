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
    private followServices: ProfileService,
    private postDataservices: PostUploadImagesService,
    private comment: CommentService,
    private alert: NotificationsService,
    private clientServices: ClientsService,
    private authGuard: AuthGuard,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog, public feature: FeatureService, public sharedRoutines: SharedRoutinesService
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
    this.followServices.getProfileByUserOnly().subscribe({
      next: (res) => this.users = res?.message?.[0],
      error: (err) => this.error = err.message
    });
  }

  loadProfileCV(): void {
    this.followServices.getProfileByUser(this.code!).subscribe({
      next: (res) => this.profiles = res?.message,
      error: (err) => this.error = err.message
    });
  }

  loadProfileCoverPhoto(): void {
    this.followServices.getCompanyProfile(this.code!).subscribe({
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

  // AddFollowxx(code: any, status: string, first: string, last: string): void {
  //   if (!code) {
  //     return;
  //   }
  //   const fullname = `${first} ${last}`;
  //   let confirmMessage = '';
  //   switch (status) {
  //     case 'none':
  //       confirmMessage = 'Send follow request?';
  //       break;

  //     case 'pending':
  //       confirmMessage = 'Cancel follow request?';
  //       break;

  //     case 'accepted':
  //       confirmMessage = 'Unfollow user?';
  //       break;

  //     default:
  //       confirmMessage = 'Continue?';
  //       break;
  //   }

  //   this.alert.popupWarning(fullname, confirmMessage).then(result => {
  //     if (!result.value) {
  //       return;
  //     }
  //     const request$ =
  //       status === 'accepted'
  //         ? this.profile.Unfollow(code)
  //         : this.profile.AddFollow(code);

  //     request$.subscribe({
  //       next: (res: any) => {
  //         console.log('API Response:', res);
  //         return;
  //         // No response returned
  //         if (!res) {
  //           this.alert.toastrError('Empty response from server.');
  //           return;
  //         }

  //         // Connection limit or other warning
  //         if (res.status === false) {
  //           this.alert.toastrWarning(
  //             res.message || 'Unable to follow this user.'
  //           );
  //           return;
  //         }

  //         // Success
  //         this.followStatus = res.follow_status ?? this.followStatus;

  //         this.alert.toastrSuccess(
  //           res.message || 'Success'
  //         );
  //       },

  //       error: (err) => {

  //         console.error(err);

  //         if (err.status === 403 || err.status === 404) {
  //           this.alert.toastrWarning(
  //             err.error?.message || 'Connection limit reached.'
  //           );
  //           return;
  //         }

  //         this.alert.toastrError(
  //           err.error?.message || 'Something went wrong.'
  //         );
  //       }

  //     });

  //   });

  // }

  // AddFollow(code: any, data: any, followStatus: string): void {
  //   if (!code) {
  //     return;
  //   }
  //   const fullname = data.fname + ' ' + data.lname;
  //   console.log('Follow Status:', followStatus);
  //   let confirmMessage = '';
  //   switch (followStatus) {
  //     case 'none':
  //       confirmMessage = 'Send follow request?';
  //       break;

  //     case 'pending':
  //       confirmMessage = 'Cancel follow request?';
  //       break;

  //     case 'accepted':
  //       confirmMessage = 'Unfollow user?';
  //       break;

  //     default:
  //       confirmMessage = 'Continue?';
  //       break;
  //   }

  //   this.alert.popupWarning(fullname, confirmMessage).then((result) => {
  //     if (!result.value) {
  //       return;
  //     }
  //    // this.isloading = true;
  //     this.followServices.AddFollow(code).subscribe({
  //       next: (res: any) => {
  //         console.log('Follow response:', res);
  //         return;

  //         this.isloading = false;
  //         if (!res) {
  //           this.alert.toastrError('No response from server.');
  //           return;
  //         }
  //         // Warning (e.g. connection limit)
  //         if (!res.status) {
  //           this.alert.toastrWarning(res.message);
  //           return;
  //         }
  //         // Success
  //         this.alert.toastrSuccess(res.message);
  //         // Update follow status
  //         data.follow_status = res.follow_status;
  //         // Reload list if needed
  //         // this.get();
  //       },

  //       error: (error: any) => {
  //       //  this.isloading = false;
  //         this.alert.toastrError(
  //           error.error?.message || 'Something went wrong.'
  //         );

  //       }
  //     });
  //   });

  // }


  AddFollow(code: any, data: any, followStatus: string): void {
    if (!code) {
      return;
    }
    const fullname = `${data.fname} ${data.lname}`;
    let confirmMessage = '';
    switch (followStatus) {
      case 'none':
        confirmMessage = 'Send follow request?';
        break;

      case 'pending':
        confirmMessage = 'Cancel follow request?';
        break;

      case 'accepted':
        confirmMessage = `Unfollow ${fullname}?`;
        break;

      default:
        confirmMessage = 'Continue?';
    }
    this.alert.popupWarning(fullname, confirmMessage).then(result => {
      if (!result.value) {
        return;
      }
      this.followServices.AddFollow(code).subscribe({
        next: (res: any) => {
          this.isloading = false;
          if (!res) {
            this.alert.toastrError('No response from server.');
            return;
          }
          if (!res.status) {
            this.alert.toastrWarning(res.message);
            return;
          }
          this.alert.toastrSuccess(res.message);
          // Update UI immediately
          data.follow_status = res.follow_status;
        },

        error: (err: any) => {
          if (err.error.status == false) {
            this.alert.toastrWarning(err.error?.message || 'Connection limit reached.');
            return;
          }
          this.alert.toastrError(err.error?.message || 'Something went wrong.');
        },
      });

    });

  }


  AddFollowxx(code: any, profiles: any, followStatus: any): void {
    if (!code) {
      return;
    }
    const fullname = `${profiles.fname} ${profiles.lname}`;
    let confirmMessage = '';
    switch (followStatus) {
      case 'none':
        confirmMessage = 'Send follow request?';
        break;

      case 'pending':
        confirmMessage = 'Cancel follow request?';
        break;

      case 'accepted':
        confirmMessage = `Unfollow ${fullname}?`;
        break;

      default:
        confirmMessage = 'Continue?';
        break;
    }


    this.alert.popupWarning(code, " " + "Are you sure to delete this role?").then((result) => {
      if (result.value) {
        this.followServices.AddFollow(code).subscribe({
          next: (res) => {

            if (res.success === true) {
              this.alert.toastrSuccess(res.message);
              this.isloading = false;
            }
            else {
              this.alert.toastrError(res.message);
              this.isloading = false;
            }
            // this.get();
          },
          error: (error) => {
            this.alert.toastrError(error.error);
            this.isloading = false;
          }

        });
      }


    });

  }

  AddFollowxxx1(code: any, first: string, last: string): void {
    if (!code) {
      return;
    }
    const fullname = `${first} ${last}`;
    this.alert.popupWarning(fullname, 'Send follow request?').then(result => {
      if (!result.value) {
        return;
      }
      this.followServices.AddFollow(code).subscribe({
        next: (res: any) => {
          console.log('Follow response:', res);
          return;
          if (!res) {
            this.alert.toastrError('No response from server.');
            return;
          }

          // Warning from API (e.g. connection limit)
          if (res.status === false) {
            this.alert.toastrWarning(res.message);
            return;
          }

          // Success
          this.followStatus = res.follow_status ?? 'pending';
          this.alert.toastrSuccess(res.message ?? 'Follow request sent.');
        },

        error: (err: any) => {

          if (err.error?.message) {
            this.alert.toastrWarning(err.error.message);
          } else {
            this.alert.toastrError('Something went wrong.');
          }

        }

      });
    });
  }

  AddFollowxxxx(code: any, status: string, first: string, last: string): void {
    if (!code) return;

    const fullname = `${first} ${last}`;

    let confirmMessage = '';

    if (status === 'none') confirmMessage = 'Send follow request?';
    if (status === 'pending') confirmMessage = `Cancel follow request to ${fullname}?`;
    if (status === 'accepted') confirmMessage = `Unfollow ${fullname}?`;

    this.alert.popupWarning(fullname, confirmMessage).then(result => {
      if (!result.value) return;

      const request$ =
        status === 'accepted'
          ? this.followServices.Unfollow(this.followId)
          : this.followServices.AddFollow(code);

      request$.subscribe({
        next: (res: any) => {
          // console.log('Follow/Unfollow response:', res);
          // return;
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