import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-account-type-plan',
  templateUrl: './account-type-plan.component.html',
  styleUrls: ['./account-type-plan.component.css']
})
export class AccountTypePlanComponent implements OnInit {

  constructor(private authService: AuthService,
    private alert: NotificationsService,
    public sharedRoutinesService: SharedRoutinesService
  
  ) { }

  ngOnInit(): void {
  }

  isLoading: boolean = false;
  users: any = [];
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

  selectPlan(plan: string) {
    console.log('Selected Plan:', plan);

    // call API here
    // this.userService.updatePlan(plan).subscribe(res => {
    //   this.users.account_type = plan;
    // });
  }

}
