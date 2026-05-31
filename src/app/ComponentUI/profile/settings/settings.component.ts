import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangePasswordComponent } from 'src/app/ComponentSharedUI/forgot-password-ui/ChangePassword/change-password.component';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { firstValueFrom } from 'rxjs';
import { UploadProfileComponent } from 'src/app/ComponentSharedUI/Individual/upload-profile/upload-profile.component';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  users: any = [];
  isLoading: boolean = true;
  currentUserCode: string | null = null;
  profile_pic: any = null;
  selectedFile: File | null = null;
  uploadProgress: number = -1;
  preview: string | ArrayBuffer | null = null;
  role: any;
  @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private alert: NotificationsService,
    private dialog: MatDialog,
    private cvService: CurriculumVitaeService,
    private profileService: ProfileService, private http: HttpClient,
    public sharedRoutines: SharedRoutinesService
  ) { }

  async ngOnInit(): Promise<void> {
    this.role = this.sharedRoutines.getRole();
    this.getProfile();
    await this.getUserAccounts();
    this.currentUserCode = this.authService.getAuthCode();
  }

  /** Load user CV/profile data */
  getProfile(): void {
    this.cvService.getDataCV().subscribe({
      next: (res: any) => {
        this.profile_pic = res.message;
      },
      error: (err: any) => console.error('Error loading profile:', err)
    });
  }

  /** Load authenticated user info */
  async getUserAccounts(): Promise<void> {
    this.isLoading = true;
    try {
      const res: any = await firstValueFrom(this.authService.getProfilecode());
      this.users = { ...this.users, ...res.message };

      if (!this.users.activity || this.users.activity.length === 0) {
        this.users.activity = [
          'Logged in on ' + new Date().toLocaleDateString(),
          'Updated profile information',
          'Changed password last week'
        ];
      }
    } catch (err) {
      console.error('Error loading user:', err);
      this.alert.toastrError('Error loading user profile');
    } finally {
      this.isLoading = false;
    }
  }
  profileFields = [
    { icon: 'email', key: 'email', default: 'No email available', type: 'text' },
    { icon: 'business', key: 'company', default: 'N/A', type: 'text' },
    { icon: 'link', key: 'companywebsite', default: 'No website', type: 'link' },
    { icon: 'phone', key: 'contact_no', default: 'N/A', type: 'text' },
    { icon: 'location_on', key: 'current_location', default: 'N/A', type: 'text' },
    { icon: 'cake', key: 'date_birth', default: 'Birthday not set', type: 'text' },
  ];

  /** Open file dialog for cover photo */
  triggerCoverUpload(): void {
    this.coverInput.nativeElement.click();
  }

  /** Handle file selection */
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => (this.preview = reader.result);
    reader.readAsDataURL(file);
    this.uploadCoverPhoto(event);
  }



  async uploadCoverPhoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverphoto', file);

    try {
      const res = await firstValueFrom(
        this.http.post<any>('https://exploredition.com/public/api/uploadCoverPhoto', formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}` // if using auth
          }
        })
      );

      if (res.success == true) {
        this.alert.toastrSuccess(res.message);
        this.getUserAccounts();
      } else {
        this.alert.toastrError(res.message || 'Failed to upload cover photo');
      }
    } catch (err: any) {
      this.alert.toastrError('❌ Something went wrong while uploading cover photo.');
    }
  }


  /** Upload cover photo */
  // uploadCoverPhotoxx(): void {
  //   if (!this.selectedFile) {
  //     this.alert.toastrError('Please select a cover photo first.');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('coverphoto', this.selectedFile);

  //   this.uploadProgress = 0;

  //   this.profileService.uploadCoverPhoto(formData).subscribe({
  //     next: (event: any) => {
  //       if (event.type === HttpEventType.UploadProgress && event.total) {
  //         this.uploadProgress = Math.round((100 * event.loaded) / event.total);
  //       } else if (event.type === HttpEventType.Response) {
  //         const body = event.body;
  //         this.uploadProgress = -1;
  //         if (body.success) {
  //           this.users.coverphoto = body.coverphoto;
  //           this.alert.toastrSuccess('Cover photo uploaded successfully!');
  //         } else {
  //           this.alert.toastrInfo(body.message || 'Upload failed');
  //         }
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('Upload failed:', err);
  //       this.alert.toastrError(err.error.message || 'Upload failed');
  //       this.uploadProgress = -1;
  //     }
  //   });
  // }

  /** Edit profile */
  editProfile(): void {
    this.alert.toastrInfo('Edit Profile coming soon!');
  }

  /** Change password */
  Changepassword(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '400px';

    const dialogRef = this.dialog.open(ChangePasswordComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getUserAccounts();
    });
  }

  /** Upload avatar (profile picture) */
  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.users.profile_picture = reader.result as string;
      this.uploadAvatar(file);
    };
    reader.readAsDataURL(file);
  }

  uploadAvatar(file: File): void {
    console.log('Uploading avatar:', file);
    // TODO: call API endpoint for avatar upload
  }

  /** Open profile upload dialog */
  uploadPic(): void {
    const url = `/${this.role}/user-cv`;
    window.location.href = url;
  }

  uploadPicxx(): void {

    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // dialogConfig.width = '400px';
    // this.dialog.open(UploadProfileComponent, dialogConfig);
  }


  selectPlan(plan: string) {
    console.log('Selected Plan:', plan);

    // call API here
    // this.userService.updatePlan(plan).subscribe(res => {
    //   this.users.account_type = plan;
    // });
  }

}
