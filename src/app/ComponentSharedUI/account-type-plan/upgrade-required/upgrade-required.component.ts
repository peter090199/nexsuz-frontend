import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-upgrade-required',
  templateUrl: './upgrade-required.component.html',
  styleUrls: ['./upgrade-required.component.css']
})
export class UpgradeRequiredComponent implements OnInit {

  loading = false;
  activated = false;

  constructor(
    private userPlanService: UserPlanService,
    private notification: NotificationsService,
    @Optional() private dialogRef?: MatDialogRef<UpgradeRequiredComponent>
  ) { }

  ngOnInit(): void {
    // Remove this if you don't want auto activation
    // this.activateFreePlan();
  }

  activateFreePlan(): void {
    if (this.loading || this.activated) {
      return;
    }
    this.loading = true;
    this.userPlanService.activateFreePlan()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);
          if (!res.success) {
            this.notification.toastrError(
              res.message || 'Unable to activate free plan.'
            );
            return;
          }
          this.notification.toastrSuccess(
            res.message || 'Free Plan Activated Successfully.'
          );
          this.activated = true;
        },

        error: (err) => {
          this.notification.toastrError(
            err.error?.message || 'Unable to activate free plan.'
          );

        }

      });

  }

  refreshPage(): void {

    this.dialogRef?.close(true);

    const role = sessionStorage.getItem('role');

    let url = '/';

    switch (role) {

      case 'DEF-USERS':
        url = '/DEF-USERS/home';
        break;

      case 'DEF-CLIENT':
        url = '/DEF-CLIENT/client-dashboard';
        break;

      case 'DEF-ADMIN':
        url = '/DEF-ADMIN/admin-dashboard';
        break;

      case 'DEF-MASTERADMIN':
        url = '/DEF-MASTERADMIN/admin-dashboard';
        break;

      default:
        url = '/';
    }

    window.location.href = url;

  }

  viewPlans(): void {

    this.dialogRef?.close();

    window.location.href = '/DEF-USERS/settings';

  }

}