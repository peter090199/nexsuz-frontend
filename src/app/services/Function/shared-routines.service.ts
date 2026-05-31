import { Injectable } from '@angular/core';
import { PostUploadImagesService } from '../post-upload-images.service';
import { NotificationsService } from '../Global/notifications.service';
import { CommentService } from '../comment/comment.service';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ReactionPostComponent } from 'src/app/ComponentSharedUI/ReactionEmoji/reaction-post/reaction-post.component';

@Injectable({
  providedIn: 'root'
})
export class SharedRoutinesService {

  constructor(
    private postDataservices: PostUploadImagesService,
    private alert: NotificationsService,
    private comment: CommentService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private dialog: MatDialog
  ) { }

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
    console.log('User role:', user.role);
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


}