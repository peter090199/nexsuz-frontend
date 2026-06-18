// import { Component, Input, OnInit } from '@angular/core';
// import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ProfileService } from 'src/app/services/Profile/profile.service';
// import { UploadProfileComponent } from '../../Individual/upload-profile/upload-profile.component';
// import { ImageModalComponent } from 'src/app/ComponentUI/Modal/image-modal/image-modal.component';
// import { PostUploadImagesService } from 'src/app/services/post-upload-images.service';
// import { CommentService } from 'src/app/services/comment/comment.service';
// import { NotificationsService } from 'src/app/services/Global/notifications.service';
// import { AuthGuard } from 'src/app/AuthGuard/auth.guard';
// import { AuthService } from 'src/app/services/auth.service';
// import { ClientsService } from 'src/app/services/Networking/clients.service';
// import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
// import { ReactionModalComponent } from '../../ReactEmoji/reaction-modal/reaction-modal.component';
// import { PostReactionByIdService } from 'src/app/services/Reaction/post-reaction-by-id.service';
// import { ReactionEmojiService } from 'src/app/services/Reaction/reaction-emoji.service';

// interface Reaction {
//   emoji: string;
//   label: string;
// }

// @Component({
//   selector: 'app-company-profile-ui',
//   templateUrl: './company-profile-ui.component.html',
//   styleUrls: ['./company-profile-ui.component.css']
// })


// export class CompanyProfileUIComponent implements OnInit {


//   users: any;
//   profiles: any;
//   userprofiles: any;
//   posts: any = [];
//   followers: any;

//   companyId!: string;
//   currentUserCode: any;
//   followId: number = 0;

//   isloading = false;
//   btnCurriculum = false;
//   modalOpen = false;
//   currentPage = 0;
//   pageSize = 6;
//   currentIndex = 0;
//   skeletonPosts: any[] = [];
//   showScrollTop = false;

//   postReactions: {
//     [postId: number]: { reactions: any[], totalCount: number }
//   } = {};

//   trackByPostId(index: number, post: any) {
//     return post.id;
//   }
//   onScroll(event: Event) {
//     const element = event.target as HTMLElement;
//     this.showScrollTop = element.scrollTop > 200;
//   }


//   hoverVisible = false;
//   hoveredPostId: number | null = null;
//   hoveredReactions2: any[] = [];
//   hoverPosition = { x: 0, y: 0 };
//   showHoverNames(postId: number, event: MouseEvent) {
//     this.hoveredPostId = postId;
//     this.hoverVisible = true;
//     this.hoveredReactions2 = this.postReactions[postId]?.reactions || [];
//     this.hoverPosition = {
//       x: event.clientX - 50,
//       y: event.clientY - 100
//     };
//   }

//   openReactionsModal(postId: number): void {
//     this.dialog.open(ReactionModalComponent, {
//       data: postId,
//       width: '100%',
//       maxWidth: '600px',
//       panelClass: 'centered-modal',
//     });
//   }

//   hideReaction(postId: number) {
//     this.isPopupVisible[postId] = false;
//     this.hoveredReactions[postId] = null;
//   }

//   getReactionEmoji(postId: number): string {
//     return this.hoveredReactions[postId]?.emoji
//       || this.userReactions[postId]?.emoji
//       || 'thumb_up';
//   }
//   getReactionLabel(postId: number): string {
//     return this.hoveredReactions[postId]?.label
//       || this.userReactions[postId]?.label
//       || 'Like';
//   }

//   reaction = [
//     { emoji: '👍', label: 'Like' },
//     { emoji: '❤️', label: 'Love' },
//     { emoji: '😂', label: 'Haha' },
//     { emoji: '😮', label: 'Wow' },
//     { emoji: '😢', label: 'Sad' },
//     { emoji: '😡', label: 'Angry' }
//   ];
//   totalReactionsCount: number = 0;
//   isPopupVisible: { [postId: number]: boolean } = {};
//   hoveredReactions: { [postId: number]: Reaction | null } = {};
//   userReactions: { [postId: number]: Reaction | null } = {};
//   @Input() postId!: number;
//   react: any = [];
//   reactionEmojiMap2: any = {
//     Like: '👍',
//     Love: '❤️',
//     Care: '🤗',
//     Haha: '😂',
//     Wow: '😮',
//     Sad: '😢',
//     Angry: '😡'
//   };

//   showReaction(postId: number) {
//     this.isPopupVisible[postId] = true;
//   }

//   async selectReactions(postId: number, react: Reaction) {
//     this.userReactions[postId] = react;
//     this.isPopupVisible[postId] = false;
//     console.log(`Selected reaction for post ${postId}:`, react.label);

//     try {
//       const res: any = await this.postReactionByIdService.saveReaction(postId, react.label).toPromise();
//       if (res && res.success) {
//         console.log('Reaction saved successfully');
//       } else {
//         console.error('Failed to save reaction:', res?.message || 'Unknown error');
//       }
//     } catch (err) {
//       console.error('API error:', err);
//     }
//    // this.loadReactions(postId);
//   }
//   hideHoverNames() {
//     this.hoverVisible = false;
//     this.hoveredPostId = null;
//   }

//   // load reactions by reactionService (per-post)
//   loadReactions(postId: number): void {
//     if (!postId) return;

//     this.reactionService.getReactionByPostId(postId).subscribe({
//       next: (res: any) => {
//         if (res && res.react && Array.isArray(res.react)) {
//           const mappedReactions = res.react.map((r: any) => ({
//             ...r,
//             emoji: this.reactionEmojiMap2[r.reaction] || 'thumb'
//           }));

//           const total = mappedReactions.reduce((sum: number, r: any) => sum + (r.count || 0), 0);

//           this.postReactions[postId] = {
//             reactions: mappedReactions,
//             totalCount: total
//           };
//           this.totalReactionsCount = total;
//         } else {
//           this.postReactions[postId] = { reactions: [], totalCount: 0 };
//           this.totalReactionsCount = 0;
//         }
//       },
//       error: (err) => {
//         console.error(`Error fetching reactions for post ${postId}:`, err);
//         this.postReactions[postId] = { reactions: [], totalCount: 0 };
//         this.totalReactionsCount = 0;
//       }
//     });
//   }


//   readonly maxImages = 3;
//   readonly coverSkeleton = Array(3);
//   readonly profileSkeleton = Array(1);

//   reactions = [
//     { name: 'Like', emoji: '👍' },
//     { name: 'Love', emoji: '❤️' },
//     { name: 'Haha', emoji: '😂' },
//     { name: 'Wow', emoji: '😮' },
//     { name: 'Sad', emoji: '😢' },
//     { name: 'Angry', emoji: '😡' }
//   ];

//   selectedReactions: { [postId: string]: any } = {};
//   hoveredReaction: any = null;

//   constructor(
//     private profile: ProfileService,
//     private dialog: MatDialog,
//     private route: ActivatedRoute,
//     private authGuard: AuthGuard,
//     private authService: AuthService,
//     private postService: PostUploadImagesService,
//     private commentService: CommentService,
//     private alert: NotificationsService,
//     private clientService: ClientsService,
//     private router: Router,
//     private cvService: CurriculumVitaeService,
//     private postReactionByIdService: PostReactionByIdService,
//     private reactionService: ReactionEmojiService,
//   ) { }

//   ownCode: any;
//   // 📍 Lifecycle
//   ngOnInit(): void {
//     this.ownCode = this.authService.getAuthCode();
//     // this.companyId = this.route.snapshot.paramMap.get('code') || '';
//     console.log(this.currentUserCode);
//     const url = window.location.href;
//     const codesplit = url.split('/').pop();
//     this.currentUserCode = codesplit;
//     this.loadProfileCV(this.currentUserCode);
//     this.loadUserData();
//     this.fetchProfilePicture();
//     this.checkFollowStatus();
//     this.loadUserPost();

//   }

//   // 🧩 Pagination
//   get pagedImages() {
//     const start = this.currentPage * this.pageSize;
//     return this.posts.slice(start, start + this.pageSize);
//   }

//   get totalPages() {
//     return Math.ceil(this.posts.length / this.pageSize);
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages - 1) this.currentPage++;
//   }

//   prevPage(): void {
//     if (this.currentPage > 0) this.currentPage--;
//   }

//   // 🖼️ Image Modal
//   openModal(image: any): void {
//     const dialogRef = this.dialog.open(ImageModalComponent, {
//       data: image,
//       minWidth: '70%',
//       maxWidth: '90%',
//       maxHeight: '90vh'
//     });
//     dialogRef.afterClosed().subscribe(result => {
//       if (result) this.loadUserPost();
//     });
//   }

//   // 🕒 Activity and Profile
//   getActiveHours(lastActive: string): string {
//     if (!lastActive) return 'unknown';
//     const diffInHours = Math.floor((Date.now() - new Date(lastActive).getTime()) / 3600000);
//     if (diffInHours < 1) return 'Just now';
//     return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
//   }

//   fetchProfilePicture(): void {
//     this.cvService.getDataCV().subscribe({
//       next: (response: any) => {
//         this.userprofiles = response?.message;
//         if (this.userprofiles?.code) sessionStorage.setItem('code', this.userprofiles.code);
//       },
//       error: (err) => console.error('Error fetching CV:', err)
//     });
//   }

//   loadProfileCV(code: string) {
//     this.profile.getCompanyProfile(code).subscribe({
//       next: (res) => {
//         if (res.success) this.profiles = res.message;
//       },
//       error: (err) => console.error('Error loading profile:', err)
//     });
//   }

//   loadUserData() {
//     this.profile.getProfileByUserOnly().subscribe({
//       next: (res) => {
//         if (res.success) this.users = res.message[0];
//       },
//       error: (err) => console.error('Error fetching user:', err)
//     });
//   }

//   // 🧍 Follow System
//   checkFollowStatus() {
//     this.clientService.getPendingFollowStatus(this.currentUserCode).subscribe((res: any) => {
//       this.followStatus = res.follow_status || 'none';
//       this.followId = res.data?.[0]?.id || 0;
//     });
//   }


//   followStatus: 'none' | 'pending' | 'accepted' | 'cancelled' = 'none';
//   AddFollow(code: any, status: string, profilename: any, lname: any): void {
//     if (!code) {
//       this.alert.toastrWarning('⚠️ No user code provided.');
//       return;
//     }

//     const fullname = profilename + " " + lname;

//     let confirmMessage = '';
//     let successAction = '';

//     if (status === 'none') {
//       confirmMessage = 'Send a follow request to this user?';
//       successAction = 'Follow request sent.';
//     } else if (status === 'pending') {
//       confirmMessage = 'Cancel your pending follow request?';
//       successAction = 'Follow request canceled.';
//     } else if (status === 'accepted') {
//       confirmMessage = 'Unfollow this user?';
//       successAction = 'Unfollowed successfully.';
//     }
//     console.log(this.followId)
//     this.alert.popupWarning(fullname, confirmMessage).then((result) => {
//       if (result.value) {
//         const request$ =
//           status === 'accepted'
//             ? this.profile.Unfollow(this.followId) // 👈 call different API for unfollow
//             : this.profile.AddFollow(code); // 👈 default follow/cancel

//         request$.subscribe({
//           next: (res: any) => {
//             if (res.success === true || res.status === true) {
//               this.alert.toastrSuccess(res.message || successAction);
//               this.followStatus = res.follow_status || 'none';
//               //  this.checkFollowStatus();
//             } else {
//               this.alert.toastrError(res.message || 'Action failed.');
//             }
//           },
//           error: (error: any) => {
//             this.alert.toastrError(error.error?.message || 'Something went wrong.');
//             console.error('❌ Follow error:', error);
//           }
//         });
//       }
//     });
//   }

//   // 💬 Posts & Comments
//   // loadUserPost(): void {
//   //   this.isloading = true;

//   //   this.postService.getDataPost(this.currentUserCode).subscribe({
//   //     next: (res) => {
//   //       if (res?.success && Array.isArray(res.data)) {
//   //         const baseUrl = 'https://lightgreen-pigeon-122992.hostingersite.com/';
//   //         this.posts = res.data.map((post: any) => {
//   //           const formattedPost = {
//   //             ...post,
//   //             fullname: post.fullname || "Unknown User",
//   //             profile_pic: post.profile_pic
//   //               ? post.profile_pic.replace(/\\/g, '')
//   //               : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`,
//   //             images: (post.images || []).map((img: any) => ({
//   //               ...img,
//   //               path_url: baseUrl + img.path_url.replace(/\\/g, '')
//   //             })),
//   //             videos: (post.videos || []).map((vid: any) => ({
//   //               ...vid,
//   //               path_url: baseUrl + vid.path_url.replace(/\\/g, '')
//   //             })),
//   //             comments: (post.comments || []).map((c: any) => ({
//   //               ...c,
//   //               profile_pic: c.profile_pic
//   //                 ? c.profile_pic.replace(/\\/g, '')
//   //                 : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`,
//   //               replies: (c.replies || []).map((r: any) => ({
//   //                 ...r,
//   //                 profile_pic: r.profile_pic
//   //                   ? r.profile_pic.replace(/\\/g, '')
//   //                   : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`
//   //               }))
//   //             })),
//   //             activeHours: this.getActiveHours(post.lastActive),
//   //             followers: post.followers || 0,
//   //             visibleComments: 3
//   //           };

//   //           // Load reactions per post ID
//   //           this.loadReactions(post.id);

//   //           return formattedPost;
//   //         });
//   //       }

//   //       this.isloading = false;
//   //     },
//   //     error: (err) => {
//   //       console.error('Error loading posts:', err);
//   //       this.isloading = false;
//   //     }
//   //   });
//   // }

//   append: boolean = false
//   loadUserPost(): void {
//     this.isloading = true;

//     this.postService.getDataPost(this.currentUserCode).subscribe({
//       next: (res: any) => {
//         if (res?.success && Array.isArray(res.data)) {
//           const normalizeUrl = (path: string) =>
//             `https://lightgreen-pigeon-122992.hostingersite.com/${(path || '').replace(/\\/g, '')}`;
//           const formattedPosts = res.data.map((post: any) => {
//             const images = Array.isArray(post.images)
//               ? post.images.map((img: any) => ({
//                 ...img,
//                 path_url: normalizeUrl(img.path_url),
//               }))
//               : [];

//             const videos = Array.isArray(post.videos)
//               ? post.videos.map((vid: any) => ({
//                 ...vid,
//                 path_url: normalizeUrl(vid.path_url),
//               }))
//               : [];

//             return {
//               ...post,
//               expanded: false,
//               images,
//               videos,
//             };
//           });

//           if (this.append) {
//             // Infinite scroll → add at bottom
//             this.posts = [...this.posts, ...formattedPosts];
//           } else {
//             // Normal load or refresh → replace/merge top
//             this.posts = formattedPosts;
//           }

//           // Load reactions for each post
//           this.posts.forEach((post: { id: number; }) => this.loadReactions(post.id));
//         } else {
//           console.warn('Unexpected response format:', res);
//           if (!this.append) this.posts = [];
//         }

//         this.isloading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching posts:', err);
//         this.isloading = false;
//       },
//     });
//   }

//   loadUserPostxx(): void {
//     this.isloading = true;
//     this.postService.getDataPost(this.currentUserCode).subscribe({
//       next: (res) => {
//         if (res?.success && Array.isArray(res.data)) {
//           const baseUrl = 'https://lightgreen-pigeon-122992.hostingersite.com/';
//           this.posts = res.data.map((post: any) => ({
//             ...post,
//             fullname: post.fullname || post.fullname || "Unknown User",
//             profile_pic: post.profile_pic
//               ? post.profile_pic.replace(/\\/g, '')
//               : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`,
//             images: (post.images || []).map((img: any) => ({
//               ...img, path_url: baseUrl + img.path_url.replace(/\\/g, '')
//             })),
//             videos: (post.videos || []).map((vid: any) => ({
//               ...vid, path_url: baseUrl + vid.path_url.replace(/\\/g, '')
//             })),
//             comments: (post.comments || []).map((c: any) => ({
//               ...c,
//               profile_pic: c.profile_pic
//                 ? c.profile_pic.replace(/\\/g, '')
//                 : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`,
//               replies: (c.replies || []).map((r: any) => ({
//                 ...r,
//                 profile_pic: r.profile_pic
//                   ? r.profile_pic.replace(/\\/g, '')
//                   : `${baseUrl}storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png`
//               }))
//             })),
//             activeHours: this.getActiveHours(post.lastActive),
//             followers: post.followers || 0,
//             visibleComments: 3

//           }));

//           this.loadReactions(this.postId);
//         }
//         this.isloading = false;
//       },
//       error: (err) => {
//         console.error('Error loading posts:', err);
//         this.isloading = false;
//       }
//     });
//   }

//   addComment(post: any): void {
//     const commentText = post.newComment?.trim();
//     if (!commentText) return;
//     post.isSubmitting = true;

//     this.commentService.postComment(post.posts_uuid, { comment: commentText }).subscribe({
//       next: () => {
//         post.comments.push({
//           user: 'Current User', comment: commentText, profile_pic: '', likes: 0, replies: []
//         });
//         post.newComment = '';
//         post.isSubmitting = false;
//       },
//       error: () => {
//         post.isSubmitting = false;
//         this.alert.toastPopUpError("Comment failed");
//       }
//     });
//   }

//   addReply(comment: any): void {
//     const replyText = comment.newReply?.trim();
//     if (!replyText) return;
//     comment.isSubmitting = true;

//     this.commentService.postCommentByReply(comment.comment_uuid, { comment: replyText }).subscribe({
//       next: () => {
//         comment.replies.push({
//           user: 'Current User', comment: replyText, profile_pic: '', likes: 0, replies: []
//         });
//         comment.newReply = '';
//         comment.isSubmitting = false;
//       },
//       error: () => {
//         comment.isSubmitting = false;
//         this.alert.toastPopUpError("Reply failed");
//       }
//     });
//   }

//   toggleComments(post: any): void {
//     post.showComments = !post.showComments;
//   }

//   loadMoreComments(post: any): void {
//     post.visibleComments += 3;
//   }

//   // 👍 Likes
//   likePost(post: any): void {
//     post.liked = !post.liked;
//     post.likes = post.liked ? (post.likes || 0) + 1 : Math.max((post.likes || 1) - 1, 0);
//     this.postService.likePost(post.id, post.liked).subscribe({
//       next: (res) => console.log('Like updated:', res),
//       error: (err) => console.error('Error liking post:', err)
//     });
//   }

//   // 😊 Emoji Reactions
//   onReactionHover(post: any, reaction: any) {
//     this.hoveredReaction = reaction;
//     this.selectedReactions[post.id] = reaction;
//     console.log(`✅ Reaction '${reaction.name}' sent for post ID: ${post.id}`);
//     setTimeout(() => this.hoveredReaction = null, 300);
//   }

//   // 🧾 Others
//   getCaption(index: number): string {
//     const caption = this.posts[index]?.caption || '';
//     const words = caption.split(' ');
//     return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
//   }

//   uploadPic(): void {
//     const dialogConfig = new MatDialogConfig();
//     dialogConfig.disableClose = true;
//     dialogConfig.autoFocus = true;
//     dialogConfig.width = '400px';
//     this.dialog.open(UploadProfileComponent, dialogConfig).afterClosed().subscribe();
//   }

//   onCoverSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const file = input.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => this.profiles.coverPhoto = reader.result as string;
//     reader.readAsDataURL(file);

//     const formData = new FormData();
//     formData.append('cover_photo', file);
//     formData.append('user_code', this.currentUserCode);

//     this.isloading = true;
//   }

//   UserCV(): void {
//     this.router.navigateByUrl("/user-cv");
//   }
// }


import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { UploadProfileComponent } from '../../Individual/upload-profile/upload-profile.component';
import { ImageModalComponent } from 'src/app/ComponentUI/Modal/image-modal/image-modal.component';
import { PostUploadImagesService } from 'src/app/services/post-upload-images.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { AuthGuard } from 'src/app/AuthGuard/auth.guard';
import { AuthService } from 'src/app/services/auth.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { ReactionModalComponent } from '../../ReactEmoji/reaction-modal/reaction-modal.component';
import { PostReactionByIdService } from 'src/app/services/Reaction/post-reaction-by-id.service';
import { ReactionEmojiService } from 'src/app/services/Reaction/reaction-emoji.service';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

interface Reaction {
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-company-profile-ui',
  templateUrl: './company-profile-ui.component.html',
  styleUrls: ['./company-profile-ui.component.css']
})

export class CompanyProfileUIComponent implements OnInit {

  @Input() postId!: number;
  posts: any[] = [];
  profiles: any;
  users: any;
  userprofiles: any;
  followers: any;

  currentUserCode!: string;
  ownCode: any;
  followId: number = 0;
  followStatus: 'none' | 'pending' | 'accepted' | 'cancelled' = 'none';

  isloading = false;
  append = false;

  // Reaction-related data
  postReactions: { [postId: number]: { reactions: any[], totalCount: number } } = {};
  userReactions: { [postId: number]: Reaction | null } = {};
  isPopupVisible: { [postId: number]: boolean } = {};
  hoveredReactions: { [postId: number]: Reaction | null } = {};

  reactionEmojiMap: Record<string, string> = {
    Like: '👍', Love: '❤️', Care: '🤗', Haha: '😂', Wow: '😮', Sad: '😢', Angry: '😡'
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private profile: ProfileService,
    private authGuard: AuthGuard,
    private authService: AuthService,
    private postService: PostUploadImagesService,
    private commentService: CommentService,
    private alert: NotificationsService,
    private clientService: ClientsService,
    private cvService: CurriculumVitaeService,
    private postReactionByIdService: PostReactionByIdService,
    private reactionService: ReactionEmojiService,
    public feature:FeatureService,
    public sharedRoutines:SharedRoutinesService
  ) {}
 skeletonPosts: any[] = [];
  // ===========================
  // 🌟 LIFECYCLE
  // ===========================
  ngOnInit(): void {
    this.skeletonPosts = Array.from({ length: 5 });

    this.ownCode = this.authService.getAuthCode();
    this.currentUserCode = this.route.snapshot.paramMap.get('code') || window.location.href.split('/').pop() || '';

    this.loadProfileCV(this.currentUserCode);
    this.loadUserData();
    this.checkFollowStatus();
    this.loadUserPost();
  }

  // ===========================
  // 🧠 HELPERS
  // ===========================
  private normalizeUrl(path: string): string {
    return `https://exploredition.com/${(path || '').replace(/\\/g, '')}`;
  }

  private defaultProfile(): string {
    return this.normalizeUrl('storage/app/public/uploads/DEFAULTPROFILE/DEFAULTPROFILE.png');
  }

  private buildActiveHours(lastActive: string): string {
    if (!lastActive) return 'unknown';
    const hours = Math.floor((Date.now() - new Date(lastActive).getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  // ===========================
  // 🏢 PROFILE + FOLLOW
  // ===========================
  loadProfileCV(code: string): void {
    this.profile.getCompanyProfile(code).subscribe({
      next: res => { if (res.success) this.profiles = res.message; },
      error: err => console.error('Error loading profile:', err)
    });
  }

  loadUserData(): void {
    this.profile.getProfileByUserOnly().subscribe({
      next: res => { if (res.success) this.users = res.message[0]; },
      error: err => console.error('Error fetching user:', err)
    });
  }


  // fetchProfilePicture(): void {
  //   this.cvService.getDataCV().subscribe({
  //     next: (res: any) => {
  //       this.userprofiles = res?.message;
  //       if (this.userprofiles?.code) sessionStorage.setItem('code', this.userprofiles.code);
  //     },
  //     error: err => console.error('Error fetching CV:', err)
  //   });
  // }

  checkFollowStatus(): void {
    this.clientService.getPendingFollowStatus(this.currentUserCode).subscribe((res: any) => {
      this.followStatus = res.follow_status || 'none';
      this.followId = res.data?.[0]?.id || 0;
    });
  }

  AddFollow(code: any, status: string, fname: any, lname: any): void {
    if (!code) return this.alert.toastrWarning('⚠️ No user code provided.');

    const fullname = `${fname} ${lname}`;
    const messages = {
      none: ['Send a follow request?', 'Follow request sent.'],
      pending: ['Cancel your pending follow request?', 'Follow request canceled.'],
      accepted: ['Unfollow this user?', 'Unfollowed successfully.']
    }[status] || ['Are you sure?', 'Action done.'];

    this.alert.popupWarning(fullname, messages[0]).then((result) => {
      if (result.value) {
        const request$ = status === 'accepted' ? this.profile.Unfollow(this.followId) : this.profile.AddFollow(code);
        request$.subscribe({
          next: (res: any) => {
            if (res.success || res.status) {
              this.alert.toastrSuccess(res.message || messages[1]);
              this.followStatus = res.follow_status || 'none';
            } else this.alert.toastrError(res.message || 'Action failed.');
          },
          error: err => {
            console.error('❌ Follow error:', err);
            this.alert.toastrError(err.error?.message || 'Something went wrong.');
          }
        });
      }
    });
  }

  // ===========================
  // 🧾 POSTS
  // ===========================
  loadUserPost(): void {
    this.isloading = true;

    this.postService.getDataPost(this.currentUserCode).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          const formattedPosts = res.data.map((post: any) => ({
            ...post,
            fullname: post.fullname || 'Unknown User',
            profile_pic: post.profile_pic ? this.normalizeUrl(post.profile_pic) : this.defaultProfile(),
            images: (post.images || []).map((i: any) => ({ ...i, path_url: this.normalizeUrl(i.path_url) })),
            videos: (post.videos || []).map((v: any) => ({ ...v, path_url: this.normalizeUrl(v.path_url) })),
            comments: (post.comments || []).map((c: any) => ({
              ...c,
              profile_pic: c.profile_pic ? this.normalizeUrl(c.profile_pic) : this.defaultProfile(),
              replies: (c.replies || []).map((r: any) => ({
                ...r,
                profile_pic: r.profile_pic ? this.normalizeUrl(r.profile_pic) : this.defaultProfile()
              }))
            })),
            activeHours: this.buildActiveHours(post.lastActive),
            followers: post.followers || 0,
            visibleComments: 3
          }));

          this.posts = this.append ? [...this.posts, ...formattedPosts] : formattedPosts;

          // ⚡ Load reactions in parallel (non-blocking)
          this.posts.forEach(p => setTimeout(() => this.loadReactions(p.id), 0));
        } else {
          this.posts = [];
        }

        this.isloading = false;
      },
      error: err => {
        console.error('Error fetching posts:', err);
        this.isloading = false;
      }
    });
  }

  // ===========================
  // 💬 COMMENTS
  // ===========================
  addComment(post: any): void {
    const commentText = post.newComment?.trim();
    if (!commentText) return;
    post.isSubmitting = true;

    this.commentService.postComment(post.posts_uuid, { comment: commentText }).subscribe({
      next: () => {
        post.comments.push({ user: 'You', comment: commentText, profile_pic: '', replies: [] });
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
    const replyText = comment.newReply?.trim();
    if (!replyText) return;
    comment.isSubmitting = true;

    this.commentService.postCommentByReply(comment.comment_uuid, { comment: replyText }).subscribe({
      next: () => {
        comment.replies.push({ user: 'You', comment: replyText, profile_pic: '', replies: [] });
        comment.newReply = '';
        comment.isSubmitting = false;
      },
      error: () => {
        comment.isSubmitting = false;
        this.alert.toastPopUpError('Reply failed');
      }
    });
  }

  // ===========================
  // 😊 REACTIONS
  // ===========================
  loadReactions(postId: number): void {
    if (!postId) return;

    this.reactionService.getReactionByPostId(postId).subscribe({
      next: (res: any) => {
        if (res?.react?.length) {
          const mapped = res.react.map((r: any) => ({
            ...r,
            emoji: this.reactionEmojiMap[r.reaction] || '👍'
          }));
          const total = mapped.reduce((s: any, r: { count: any; }) => s + (r.count || 0), 0);
          this.postReactions[postId] = { reactions: mapped, totalCount: total };
        } else {
          this.postReactions[postId] = { reactions: [], totalCount: 0 };
        }
      },
      error: err => {
        console.error(`Error fetching reactions for post ${postId}:`, err);
        this.postReactions[postId] = { reactions: [], totalCount: 0 };
      }
    });
  }

  async selectReactions(postId: number, react: Reaction): Promise<void> {
    this.userReactions[postId] = react;
    this.isPopupVisible[postId] = false;
    try {
      const res: any = await this.postReactionByIdService.saveReaction(postId, react.label).toPromise();
      if (res?.success) this.loadReactions(postId);
    } catch (err) {
      console.error('API error:', err);
    }
  }

  // ===========================
  // 📸 IMAGE & COVER
  // ===========================
  openModal(image: any): void {
    this.dialog.open(ImageModalComponent, {
      data: image,
      minWidth: '70%',
      maxWidth: '90%',
      maxHeight: '90vh'
    }).afterClosed().subscribe(result => {
      if (result) this.loadUserPost();
    });
  }

  uploadPic(): void {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true;
    config.width = '400px';
    this.dialog.open(UploadProfileComponent, config);
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.profiles.coverPhoto = reader.result as string;
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('cover_photo', file);
    formData.append('user_code', this.currentUserCode);
    this.isloading = true;
  }

  UserCV(): void {
    this.router.navigateByUrl('/user-cv');
  }
}
