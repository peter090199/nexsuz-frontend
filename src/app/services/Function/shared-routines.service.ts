import { Injectable } from '@angular/core';
import { PostUploadImagesService } from '../post-upload-images.service';
import { NotificationsService } from '../Global/notifications.service';
import { CommentService } from '../comment/comment.service';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReactionPostComponent } from 'src/app/ComponentSharedUI/ReactionEmoji/reaction-post/reaction-post.component';
import { FeatureService } from '../AccountPlan/feature.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedRoutinesService {
  currentUserCode: any;

  constructor(
    private postDataservices: PostUploadImagesService, private location: Location,
    private alert: NotificationsService, private router: Router,
    private comment: CommentService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private dialog: MatDialog, public feature: FeatureService
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUserCode = this.authService.getAuthCode();

  }
  // =========================
  // STATE
  // =========================
  usercode: string | null = null;
  isLoading = false;
  posts: any[] = [];
  post_uuidOrUind: string[] = [];
  comments: any[] = [];

  error: any;

  onNewPostsDetected?: (count: number) => void;

  // reactions
  postReactions: {
    [postId: number]: { reactions: any[]; totalCount: number }
  } = {};

  // hover state
  hoverVisible = false;
  hoveredPostId: number | null = null;
  hoveredReactions2: any[] = [];
  hoverPosition = { x: 0, y: 0 };

  // =========================
  // INIT FLOW
  // =========================
  getCode(): void {
    this.authService.getProfilecode().subscribe({
      next: (res) => {
        if (res?.success && res?.message?.length > 0) {
          this.usercode = res.message[0].code;
          this.loadUserPost();
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      }
    });
  }

  // =========================
  // LOAD POSTS
  // =========================
  loadUserPost(): void {
    if (!this.usercode) {
      this.alert.popupWarning('Usercode is undefined', 'Cannot load posts.');
      return;
    }

    this.isLoading = true;

    this.postDataservices.getDataPostAddFollow().subscribe({
      next: (data: any[]) => {

        const newPostCount = data.length - this.posts.length;

        this.posts = (data || []).map(post => ({
          ...post,
          activeHours: this.getActiveHours(post.lastActive),
          followers: post.followers || 0,
          currentIndex: 0,
          images: post.images || [],
          visibleComments: 8,
          comments: []
        }));

        // notify new posts
        if (this.onNewPostsDetected && newPostCount > 0) {
          this.onNewPostsDetected(newPostCount);
        }

        // load comments per post
        this.post_uuidOrUind = data.map(p => p.posts_uuid);

        this.post_uuidOrUind.forEach(uuid => {
          const post = this.posts.find(p => p.posts_uuid === uuid);
          if (post) this.getComment(uuid, post);
        });

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error fetching posts:', error);
        this.isLoading = false;
      }
    });
  }

  // =========================
  // COMMENTS
  // =========================
  getComment(post_uuid: string, post: any): void {
    this.comment.getComment(post_uuid).subscribe({
      next: (res) => {
        post.comments = res || [];
      },
      error: (err) => {
        this.error = err.message || 'Error fetching comments';
      }
    });
  }

  // =========================
  // TIME FORMAT
  // =========================
  getActiveHours(lastActive: string): string {
    if (!lastActive) return 'unknown';

    const diffInHours =
      Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  }

  // =========================
  // HOVER REACTIONS
  // =========================
  showHoverNames(postId: number, event: MouseEvent): void {
    this.hoveredPostId = postId;
    this.hoverVisible = true;

    this.hoveredReactions2 =
      this.postReactions[postId]?.reactions || [];

    this.hoverPosition = {
      x: event.clientX - 50,
      y: event.clientY - 100
    };
  }

  hideHoverNames(): void {
    this.hoverVisible = false;
    this.hoveredPostId = null;
  }

  // =========================
  // OPEN REACTIONS MODAL
  // =========================
  openReactionsModal(postId: number): void {
    this.dialog.open(ReactionPostComponent, {
      data: postId,
      width: '100%',
      maxWidth: '600px',
      panelClass: 'centered-modal'
    });
  }

  getRole(): string {
    return sessionStorage.getItem('role') || 'user';
  }

  getProfileRouteAll(user: any): any[] {
    const role = this.getRole();
    if (
      user.role === 'DEF-CLIENT' ||
      user.role === 'DEF-ADMIN' ||
      user.role === 'DEF-MASTERADMIN'
    ) {
      return [`/${role}/client_profile`, user.code];
    }

    return [`/${role}/profile`, user.code];
  }

  getisMasterAdmin(): boolean {
    return sessionStorage.getItem('role') === 'DEF-MASTERADMIN';
  }

  //users
  getProfileRoute(code: string): any[] {
    const role = this.getRole();
    return [`/${role}/profile`, code];
  }

  getClientProfileRoute(code: string): any[] {
    const role = this.getRole();
    return [`/${role}/profile`, code];
  }


  getsettingsRoute(): any[] {
    const role = this.getRole();
    return [`/${role}/settings`];
  }


  isApplyDisabled(job: any): boolean {
    if (!this.feature.can('APPLY_JOBS')) return true;
    // already applied
    if (job?.applied) return true;

    // optional: pending status
    if (job?.status === 'pending') return true;

    return false;
  }
  getApplyButtonStyle(job: any) {

    if (!this.feature.can('APPLY_JOBS')) {
      return {
        'background-color': '#9e9e9e',
        'color': '#fff'
      };
    }

    if (job?.applied) {
      return {
        'background-color': '#4caf50',
        'color': '#fff'
      };
    }

    return {
      'background-color': this.getStatusColor(this.getButtonStatus(job)),
      'color': '#fff'
    };
  }

  goBack(): void {
    this.location.back();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'applied_active':
        return '#f4895e';

      case 'review':
        return '#ffb300';

      case 'interview':
        return '#6a5acd'; // purple (interview)

      case 'approved':
        return '#388e3c';

      case 'reject':
        return '#d32f2f';

      default:
        return '#3071e0';
    }
  }

  getButtonStatus(job: any): string {
    if (!job) return 'default';

    if (job.code === this.currentUserCode) {
      return 'applied_active';
    }
    return job.applied_status || 'default';
  }


  getApplyText(job: any): string {

    if (job?.applied) {
      return 'Applied';
    }

    if (job?.status === 'pending') {
      return 'Pending';
    }

    return this.getStatusText(this.getButtonStatus(job));
  }
  openUpgradeModal() {
    this.notificationsService.toastrWarning('Please upgrade your plan.');
  }

  onApplyClick(): void {
    if (!this.feature.can('APPLY_JOBS')) {
      this.openUpgradeModal();
      return;
    }
  }

  // openUpgradeModalx1Sx() {
  //   console.log('Apply feature is not enabled for this user.');
  //   // const dialogRef = this.dialog.open(UpgradePlanComponent, {
  //   //   width: '400px',
  //   //   data: {
  //   //     message: 'Upgrade your plan to apply for jobs'
  //   //   }
  //   // });

  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   if (result === 'upgrade') {
  //   //     this.router.navigate(['/plans']);
  //   //   }
  //   // });
  // }

  getStatusText(status: string): string {
    switch (status) {
      case 'applied_active':
        return 'Applied';

      case 'review':
        return 'Under Review';

      case 'interview':
        return 'Interview Scheduled';

      case 'approved':
        return 'Hired';

      case 'reject':
        return 'Rejected';

      default:
        return 'Apply Now';
    }
  }


  getApplyIcon(job: any): string {

    if (!this.feature.can('APPLY_JOBS')) {
      return 'lock';
    }

    if (job?.applied) {
      return 'check_circle';
    }
    return this.getStatusIcon(this.getButtonStatus(job));
  }


  getStatusIcon(status: string): string {
    switch (status) {
      case 'applied_active':
        return 'hourglass_top';

      case 'review':
        return 'search';

      case 'interview':
        return 'event';

      case 'approved':
        return 'check_circle';

      case 'reject':
        return 'cancel';

      default:
        return 'send';
    }
  }


  goToCheckoutByDEF_USERS(plan: any): void {
    this.router.navigate(['/DEF-USERS/checkout', plan.planId]);
  }

  public goToSubscription(): void {
    const role = this.getRole();

    if (
      role === 'DEF-ADMIN' ||
      role === 'DEF-MASTERADMIN' ||
      role === 'DEF-CLIENT'
    ) {
      return;
    }

    const route = `/${role}/subscription`;

    if (this.router.url !== route) {
      this.router.navigate([route]);
    }
  }

}