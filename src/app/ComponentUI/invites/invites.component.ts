import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { ClientsService } from 'src/app/services/Networking/clients.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.css']
})
export class InvitesComponent implements OnInit {

  peopleInvites: any[] = [];
  isLoading: boolean = false;
  hasMoreData: boolean = true;
  currentUserCode: string = '';

  // Skeleton rows for loading animation
  skeletonRows = Array.from({ length: 5 }); // Create 5 unique skeleton rows

  constructor(
    private clientsService: ClientsService,
    private authService: AuthService,
    private alert: NotificationsService,
    private profile: ProfileService,
    public sharedRoutines:SharedRoutinesService
  ) { }

  ngOnInit(): void {
    this.currentUserCode = this.authService.getAuthCode();
    this.getPendingFollowRequests();
  }

  // Load more data on scroll
  onScroll(event: any): void {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !this.isLoading && this.hasMoreData) {
      this.getPendingFollowRequests();
    }
  }

  // Fetch pending follow requests
  getPendingFollowRequests(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.clientsService.getPendingFollowRequests().subscribe({
      next: (res) => {
        if (res.data.length === 0) this.hasMoreData = false;
        this.peopleInvites = [...this.peopleInvites, ...res.data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pending follow requests:', err);
        this.isLoading = false;
      }
    });
  }

  // Accept follow request
  ConnectInvites(code: any, fullName: string): void {
    if (!code) {
      this.alert.toastrWarning('⚠️ No user code provided.');
      return;
    }

    const confirmMessage = `Accept follow request from ${fullName}?`;

    this.alert.popupWarning(fullName, confirmMessage).then(result => {
      if (result.value) {
        this.clientsService.acceptFollowRequest(code).subscribe({
          next: () => {
            this.alert.toastrSuccess(`You are now connected with ${fullName}.`);
            this.peopleInvites = this.peopleInvites.filter(p => p.follower_code !== code);
          },
          error: (err) => {
            console.error(err);
            this.alert.toastrError('❌ Failed to accept follow request.');
          }
        });
      }
    });
  }
}
