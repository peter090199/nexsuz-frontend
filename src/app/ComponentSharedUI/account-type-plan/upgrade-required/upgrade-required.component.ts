// import { Component } from '@angular/core';
// import { MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
// import { NotificationsService } from 'src/app/services/Global/notifications.service';
// import { finalize } from 'rxjs/operators';

// @Component({
//   selector: 'app-upgrade-required',
//   templateUrl: './upgrade-required.component.html',
//   styleUrls: ['./upgrade-required.component.css']
// })
// export class UpgradeRequiredComponent {

//   loading = false;

//   constructor(
//     private router: Router,
//     private userPlanService: UserPlanService,
//     private notification: NotificationsService,
//     private dialogRef: MatDialogRef<UpgradeRequiredComponent>
//   ) {}

//   activateFreePlan(): void {
//     if (this.loading) {
//       return;
//     }
//     this.loading = true;
//     this.userPlanService.activateFreePlan()
//       .pipe(
//         finalize(() => this.loading = false)
//       )
//       .subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             this.notification.toastrSuccess(res.message);
//             this.dialogRef.close(true);
//           } else {
//             this.notification.toastrError(res.message);
//           }
//         },
//         error: (err) => {
//           this.notification.toastrError(
//             err.error?.message || 'Unable to activate free plan.'
//           );
//         }
//       });

//   }

//   viewPlans(): void {
//     this.dialogRef.close();
//     this.router.navigate(['DEF-USERS/settings']);

//   }

// }


import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private userPlanService: UserPlanService,
    private notification: NotificationsService,
    @Optional() private dialogRef: MatDialogRef<UpgradeRequiredComponent>
  ) {  }


  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 2000);

  }

  activateFreePlan(): void {

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.userPlanService.activateFreePlan()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res: any) => {

          if (!res.success) {
            this.notification.toastrError(
              res.message || 'Unable to activate free plan.'
            );
            return;
          }
          this.notification.toastrSuccess(
            res.message || 'Free plan activated successfully.'
          );
          this.dialogRef?.close(true);
          if (res.redirect_url) {
            this.router.navigateByUrl(res.redirect_url);
          }
        },
        error: (err) => {
          this.notification.toastrError(
            err?.error?.message || 'Unable to activate free plan.'
          );

        }
      });

  }

  viewPlans(): void {
    this.dialogRef?.close();
    this.router.navigate(['/DEF-USERS/settings']);
  }

}