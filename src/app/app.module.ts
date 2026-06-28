import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from 'src/Material/Material.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';

// Translate module imports
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
// Component declarations
import { FooterComponent } from './footer/footer.component';
import { SignInUIComponent } from './SignIn/sign-in-ui/sign-in-ui.component';
import { SignUpUIComponent } from './SignUp/sign-up-ui/sign-up-ui.component';
import { PageNotFoundComponentComponent } from './PageError/page-not-found-component/page-not-found-component.component';
import { TopNavigationComponent } from './Navigation/top-navigation/top-navigation.component';
import { TermsModalComponent } from './TermsModal/terms-modal/terms-modal.component';
import { PrivacyComponent } from './TermsModal/privacy/privacy.component';
import { SecurityRolesComponent } from './ComponentUI/system/security-roles/security-roles.component';
import { UsersComponent } from './ComponentUI/system/users/users.component';
import { ChatUIComponent } from './chat-ui/chat-ui.component';
import { RoleComponent } from './ComponentUI/system/role/role.component';
import { HomeUIComponent } from './ComponentUI/home/home-ui/home-ui.component';
import { SecurityRolesUIComponent } from './ComponentSharedUI/system/security-roles-ui/security-roles-ui.component';
import { MenuUIComponent } from './ComponentSharedUI/system/menu-ui/menu-ui.component';
import { RoleUIComponent } from './ComponentSharedUI/system/role-ui/role-ui.component';
import { MenuComponent } from './ComponentUI/system/menu/menu.component';
import { MessagesComponent } from './ComponentUI/messages/messages.component';
import { MessagesUIComponent } from './ComponentSharedUI/messages-ui/messages-ui.component';
import { DashboardUIComponent } from './ComponentSharedUI/dashboard-ui/dashboard-ui.component';
import { DashboardComponent } from './ComponentUI/dashboard/dashboard.component';
import { ForgotPasswordUIComponent } from './ComponentSharedUI/forgot-password-ui/forgot-password-ui.component';
import { ResetPasswordUIComponent } from './ComponentSharedUI/reset-password-ui/reset-password-ui.component';
import { ExpiredLinkDialogComponent } from './ComponentSharedUI/expired-link-dialog/expired-link-dialog.component';
import { ClientUIComponent } from './SignUp/client-ui/client-ui.component';

import { UserhomepageComponent } from './Users/userhomepage/userhomepage.component';
import { TranslateComponent } from './translate/translate.component';
import { CookiesUIComponent } from './cookies/cookies-ui/cookies-ui.component';
import { ActivationUIComponent } from './ComponentSharedUI/Activation/activation-ui/activation-ui.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FeedComponent } from './layout/feed/feed.component';
import { ProfileComponent } from './layout/profile/profile.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { CurriculumVitaeUIComponent } from './ComponentSharedUI/Individual/curriculum-vitae-ui/curriculum-vitae-ui.component';
import { ProfileUIComponent } from './ComponentSharedUI/Profile/profile-ui/profile-ui.component';
import { UserCVComponent } from './ComponentSharedUI/Individual/user-cv/user-cv.component';
import { DatePipe } from '@angular/common';
import { UploadProfileComponent } from './ComponentSharedUI/Individual/upload-profile/upload-profile.component';
import { AddLanguageUIComponent } from './ComponentSharedUI/Individual/Languange/add-language-ui/add-language-ui.component';
import { AddSkillsUIComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-skills-ui/add-skills-ui.component';
import { AddEducationUIComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-education-ui/add-education-ui.component';
import { AddTrainingsUiComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-trainings-ui/add-trainings-ui.component';
import { AddSeminarUiComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-seminar-ui/add-seminar-ui.component';
import { AddEmploymentUiComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-employment-ui/add-employment-ui.component';
import { AddCertificateUiComponent } from './ComponentSharedUI/Individual/ProfessionalDev/add-certificate-ui/add-certificate-ui.component';
import { PrintCVComponent } from './ComponentSharedUI/Individual/print-cv/print-cv.component';
import { AddEditEducationDialogComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-education-dialog/add-edit-education-dialog.component';
import { AddEditSeminarComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-seminar/add-edit-seminar.component';
import { AddEditTrainingComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-training/add-edit-training.component';
import { AddEditCertificateComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-certificate/add-edit-certificate.component';
import { AddEditWorkExprienceComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-work-exprience/add-edit-work-exprience.component';
import { AddEditSkillsComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-skills/add-edit-skills.component';
import { AddEditLanguageComponent } from './ComponentSharedUI/Individual/ProfessionalDev/Edit/add-edit-language/add-edit-language.component';
import { ViewLanguageUIComponent } from './ComponentSharedUI/Individual/Languange/view-language-ui/view-language-ui.component';
import { UserProfileUiComponent } from './ComponentSharedUI/Individual/user-profile-ui/user-profile-ui.component';
import { PostUIComponent } from './ComponentSharedUI/Public/post-ui/post-ui.component';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { SearchComponent } from './ComponentUI/search/search.component';
import { UserListComponent } from './ComponentUI/search/user-list/user-list.component';
import { SearchModalComponent } from './ComponentUI/search/search-modal/search-modal.component';
import { NetworkingComponent } from './ComponentUI/networking/networking.component';
import { NotificationComponent } from './ComponentUI/notification/notification.component';
import { MessengerChatComponent } from './messenger-chat/messenger-chat.component';
import { ChatPopupComponent } from './ComponentUI/messages/chat-popup/chat-popup.component';
import { ChatWebsitePopUPComponent } from './ComponentUI/messages/chat-website-pop-up/chat-website-pop-up.component';
import { PostUploadImageComponent } from './ComponentSharedUI/Public/post-upload-image/post-upload-image.component';
import { ImageModalComponent } from './ComponentUI/Modal/image-modal/image-modal.component';
import { SettingsComponent } from './ComponentUI/profile/settings/settings.component';
import { ChangePasswordComponent } from './ComponentSharedUI/forgot-password-ui/ChangePassword/change-password.component';
import { ReactionModalComponent } from './ComponentSharedUI/ReactEmoji/reaction-modal/reaction-modal.component';
import { AllSuggestionsModalComponent } from './ComponentUI/networking/all-suggestions-modal/all-suggestions-modal.component';
import { PeopleandCompanyComponent } from './ComponentUI/networking/peopleand-company/peopleand-company.component';
import { FollowingandFollowersComponent } from './ComponentUI/networking/followingand-followers/followingand-followers.component';
import { PendingFollowingComponent } from './ComponentUI/networking/pending-following/pending-following.component';
import { JobPostingComponent } from './ComponentUI/job-posting/job-posting.component';
import { JobPostingUIComponent } from './ComponentSharedUI/job-posting-ui/job-posting-ui.component';
import { JobsComponent } from './ComponentUI/jobs/jobs.component';
import { JobsProfileComponent } from './ComponentUI/jobs-profile/jobs-profile.component';
import { PostingJobComponent } from './ComponentSharedUI/posting-job/posting-job.component';
import { CompanyProfileUIComponent } from './ComponentSharedUI/Jobs/company-profile-ui/company-profile-ui.component';
import { PostFeedsComponent } from './ComponentUI/Feeds/post-feeds/post-feeds.component';
import { ApplyJobComponent } from './ComponentSharedUI/Jobs/apply-job/apply-job.component';
import { ListAppliedJobsComponent } from './ComponentUI/jobs/list-applied-jobs/list-applied-jobs.component';
import { SubmenuComponent } from './ComponentUI/system/submenu/submenu.component';
import { SubmenuUIComponent } from './ComponentUI/system/submenu-ui/submenu-ui.component';
import { EditsubmenuUIComponent } from './ComponentUI/system/editsubmenu-ui/editsubmenu-ui.component';
import { UsersUIComponent } from './ComponentSharedUI/system/users-ui/users-ui.component';
import { TopheaderComponent } from './Users/userhomepage/topheader/topheader.component';
import { ReactionPostComponent } from './ComponentSharedUI/ReactionEmoji/reaction-post/reaction-post.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PrivatePostComponent } from './ComponentUI/Feeds/private-post/private-post.component';
import { CommentModalUIComponent } from './ComponentUI/Modal/comment-modal-ui/comment-modal-ui.component';
import { SaveJobsComponent } from './ComponentUI/jobs/save-jobs/save-jobs.component';
import { ImagesAndVideosComponent } from './ComponentUI/Client/images-and-videos/images-and-videos.component';
import { JobsClientComponent } from './ComponentUI/Client/jobs-client/jobs-client.component';
import { PeopleComponent } from './ComponentUI/Client/people/people.component';
import { ImagesComponent } from './ComponentUI/Client/images/images.component';
import { UserAndRecruiterComponent } from './ComponentUI/user-and-recruiter/user-and-recruiter.component';
import { BaseOnRecenActivityComponent } from './ComponentUI/base-on-recen-activity/base-on-recen-activity.component';
import { InvitesComponent } from './ComponentUI/invites/invites.component';
import { RecruitersComponent } from './ComponentUI/recruiters/recruiters.component';
import { PostUploadVideosComponent } from './ComponentSharedUI/Public/post-upload-videos/post-upload-videos.component';
import { JobViewDetailsComponent } from './ComponentUI/job-posting/job-view-details/job-view-details.component';
import { UserResumeUIComponent } from './ComponentSharedUI/Resume/user-resume-ui/user-resume-ui.component';
import { AppliedStatusDialogComponent } from './ComponentUI/jobs/applied-status-dialog/applied-status-dialog.component';
import { ClientDashboardComponent } from './ComponentUI/dashboard/client-dashboard/client-dashboard.component';
import { AdminDashboardComponent } from './ComponentUI/dashboard/admin-dashboard/admin-dashboard.component';
import { SideBarPanelComponent } from './Navigation/Client/side-bar-panel/side-bar-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { CandidatesComponent } from './ComponentUI/Client/candidates/candidates.component';
import { MatDialogModule } from '@angular/material/dialog';
import { InterviewsComponent } from './ComponentUI/Client/interviews/interviews.component';
import { PublicPostComponent } from './ComponentUI/Feeds/public-post/public-post.component';
import { AccountTypePlanComponent } from './ComponentSharedUI/account-type-plan/account-type-plan.component';
import { AppLogoComponent } from './ComponentSharedUI/app-logo/app-logo.component';
import { AccountManagementComponent } from './ComponentUI/account-management/account-management.component';
import { UserPlanComponent } from './ComponentUI/AccountManagement/user-plan/user-plan.component';
import { ClientPlanComponent } from './ComponentUI/AccountManagement/client-plan/client-plan.component';
import { CategoryPlanComponent } from './ComponentUI/AccountManagement/category-plan/category-plan.component';
import { UserPlanUIComponent } from './ComponentUI/AccountManagement/user-plan/user-plan-ui/user-plan-ui.component';
import { FeaturesPlanUIComponent } from './ComponentUI/AccountManagement/user-plan/features-plan-ui/features-plan-ui.component';
import { FeaturesPlanListComponent } from './ComponentUI/AccountManagement/features-plan-list/features-plan-list.component';
import { FeaturesPlanListUIComponent } from './ComponentUI/AccountManagement/features-plan-list-ui/features-plan-list-ui.component';
import { UpdatePlanUIComponent } from './ComponentUI/AccountManagement/user-plan/update-plan-ui/update-plan-ui.component';
import { FeaturesPlanUI2Component } from './ComponentUI/AccountManagement/user-plan/features-plan-ui2/features-plan-ui2.component';
import { CheckOutUIComponent } from './ComponentUI/AccountManagement/user-plan/check-out-ui/check-out-ui.component';
import { UpgradeRequiredComponent } from './ComponentSharedUI/account-type-plan/upgrade-required/upgrade-required.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
// export function preloadNavigationData(navService: TNavigationService) {
//   return () => navService.getData().toPromise().then(() => true);
// }

@NgModule({
  declarations: [
    AppComponent,
    UserhomepageComponent,
    FooterComponent,
    SignInUIComponent,
    SignUpUIComponent,
    PageNotFoundComponentComponent,
    TopNavigationComponent,
    TermsModalComponent,
    PrivacyComponent,
    SecurityRolesComponent,
    UsersComponent,
    ChatUIComponent,
    RoleComponent,
    HomeUIComponent,
    SecurityRolesUIComponent,
    MenuUIComponent,
    RoleUIComponent,
    MenuComponent,
    MessagesComponent,
    MessagesUIComponent,
    DashboardUIComponent,
    DashboardComponent,
    ForgotPasswordUIComponent,
    ResetPasswordUIComponent,
    ExpiredLinkDialogComponent,
    ClientUIComponent,
    TranslateComponent,
    CookiesUIComponent,
    ActivationUIComponent,
    LayoutComponent,
    SidebarComponent,
    FeedComponent,
    ProfileComponent,
    TopbarComponent,
    CurriculumVitaeUIComponent,
    ProfileUIComponent,
    UserCVComponent,
    UploadProfileComponent,
    AddLanguageUIComponent,
    AddSkillsUIComponent,
    AddEducationUIComponent,
    AddTrainingsUiComponent,
    AddSeminarUiComponent,
    AddEmploymentUiComponent,
    AddCertificateUiComponent,
    PrintCVComponent,
    AddEditEducationDialogComponent,
    AddEditSeminarComponent,
    AddEditTrainingComponent,
    AddEditCertificateComponent,
    AddEditWorkExprienceComponent,
    AddEditSkillsComponent,
    AddEditLanguageComponent,
    ViewLanguageUIComponent,
    UserProfileUiComponent,
    PostUIComponent,
    PrintLayoutComponent,
    SearchComponent,
    UserListComponent,
    SearchModalComponent,
    NetworkingComponent,
    NotificationComponent,
    MessengerChatComponent,
    ChatPopupComponent,
    ChatWebsitePopUPComponent,
    PostUploadImageComponent,
    ImageModalComponent,
    SettingsComponent,
    ChangePasswordComponent,
    ReactionModalComponent,
    AllSuggestionsModalComponent,
    PeopleandCompanyComponent,
    FollowingandFollowersComponent,
    PendingFollowingComponent,
    JobPostingComponent,
    JobPostingUIComponent,
    JobsComponent,
    JobsProfileComponent,
    PostingJobComponent,
    CompanyProfileUIComponent,
    PostFeedsComponent,
    ApplyJobComponent,
    ListAppliedJobsComponent,
    SubmenuComponent,
    SubmenuUIComponent,
    EditsubmenuUIComponent,
    UsersUIComponent,
    TopheaderComponent,
    ReactionPostComponent,
    PrivatePostComponent,
    CommentModalUIComponent,
    SaveJobsComponent,
    ImagesAndVideosComponent,
    JobsClientComponent,
    PeopleComponent,
    ImagesComponent,
    UserAndRecruiterComponent,
    BaseOnRecenActivityComponent,
    InvitesComponent,
    RecruitersComponent,
    PostUploadVideosComponent,
    JobViewDetailsComponent,
    UserResumeUIComponent,
    AppliedStatusDialogComponent,
    ClientDashboardComponent,
    AdminDashboardComponent,
    SideBarPanelComponent,
    CandidatesComponent,
    InterviewsComponent,
    PublicPostComponent,
    AccountTypePlanComponent,
    AppLogoComponent,
    AccountManagementComponent,
    UserPlanComponent,
    ClientPlanComponent,
    CategoryPlanComponent,
    UserPlanUIComponent,
    FeaturesPlanUIComponent,
    FeaturesPlanListComponent,
    FeaturesPlanListUIComponent,
    UpdatePlanUIComponent,
    FeaturesPlanUI2Component,
    CheckOutUIComponent,
    UpgradeRequiredComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSidenavModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    ToastrModule.forRoot(), // Correctly placed ToastrModule
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
     }),
  ],
  providers: [
  CookieService,
  DatePipe,
  // {
  //   // provide: APP_INITIALIZER,
  //   // // useFactory: preloadNavigationData,
  //   // deps: [TNavigationService],
  //   // multi: true
  // }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
