import { Component, OnInit } from '@angular/core';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';
import { AuthService } from 'src/app/services/auth.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';

@Component({
  selector: 'app-base-on-recen-activity',
  templateUrl: './base-on-recen-activity.component.html',
  styleUrls: ['./base-on-recen-activity.component.css']
})
export class BaseOnRecenActivityComponent implements OnInit {

  peopleRecentActivity: any[] = [];

  isLoading = false;
  skeletonRows: number[] = [];

  currentUserCode = '';

  page = 1;
  limit = 10;
  hasMoreData = true;

  constructor(
    private clientsService: ClientsService,
    private authService: AuthService,
    private alert: NotificationsService,
    private profile: ProfileService,
    public sharedRoutines: SharedRoutinesService,
    public feature: FeatureService
  ) {}

  ngOnInit(): void {
    this.getPeopleRecentActivity();
  }

  /* =========================
     LOAD RECENT ACTIVITY
  ========================= */
  getPeopleRecentActivity(): void {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    this.currentUserCode = this.authService.getAuthCode();
    this.skeletonRows = Array.from({ length: this.limit });

    this.clientsService.getPeopleRecentActivity().subscribe({
      next: (res) => {

        const newData = (res.data || []).map((person: any) => ({
          ...person,
          follow_status: person.follow_status || 'not_following'
        }));

        if (newData.length < this.limit) {
          this.hasMoreData = false;
        }

        this.peopleRecentActivity = [
          ...this.peopleRecentActivity,
          ...newData
        ];

        this.page++;
        this.isLoading = false;
        this.skeletonRows = [];
      },

      error: (err) => {
        console.error(err);
        this.alert.toastrError('Failed to load recent activity');
        this.isLoading = false;
        this.skeletonRows = [];
      }
    });
  }

  /* =========================
     CONNECT ACTION
  ========================= */
  AddConnect(code: string, fullName: string, status: string, id: number): void {

    if (!code) {
      this.alert.toastrWarning('No user code provided');
      return;
    }

    let confirmMessage = '';

    if (status === 'not_following') {
      confirmMessage = 'Send follow request?';
    } else if (status === 'pending') {
      confirmMessage = 'Cancel request?';
    } else {
      confirmMessage = 'Unfollow user?';
    }

    this.alert.popupWarning(fullName, confirmMessage).then(result => {

      if (!result.value) return;

      const request$ =
        status === 'accepted'
          ? this.profile.Unfollow(id)
          : this.profile.AddFollow(code);

      request$.subscribe({
        next: (res) => {

          if (!res?.success && !res?.status) {
            this.alert.toastrError(res.message || 'Failed');
            return;
          }

          this.alert.toastrSuccess(res.message);

          // ✅ update UI instantly (NO reload)
          this.peopleRecentActivity = this.peopleRecentActivity.map(p =>
            p.code === code
              ? { ...p, follow_status: res.follow_status }
              : p
          );
        },

        error: (err) => {
          console.error(err);
          this.alert.toastrError('Something went wrong');
        }
      });

    });
  }
}