import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-check-out-ui',
  templateUrl: './check-out-ui.component.html',
  styleUrls: ['./check-out-ui.component.css']
})
export class CheckOutUIComponent implements OnInit {

  plan: any = null;
  planId: string | null = null;

  isLoading = false;
  selectedPayment = 'gcash';

  constructor(
    private route: ActivatedRoute,
    private userPlanService: UserPlanService,
    private notification: NotificationsService,
    public sharedService: SharedRoutinesService
  ) { }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('planId');

    if (this.planId) {
      this.loadPlan(this.planId);
    } else {
      this.notification.toastrError('Invalid plan.');
    }
  }

  get vat(): number {
    return (Number(this.plan?.price) || 0) * 0.12;
  }

  get total(): number {
    const price = Number(this.plan?.price) || 0;
    return price + this.vat;
  }

  subscribe(): void {

    if (!this.plan) {
      this.notification.toastrError('Plan not found.');
      return;
    }

    console.log({
      planId: this.plan.planId,
      payment: this.selectedPayment
    });

    // TODO:
    // Call your subscription/payment API here.
  }

  private loadPlan(planId: string): void {

    this.isLoading = true;

    this.userPlanService.getById(planId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res: any) => {

          if (res.success) {
            this.plan = res.data;
          } else {
            this.notification.toastrError(res.message);
          }

        },
        error: () => {
          this.notification.toastrError('Unable to load plan.');
        }
      });

  }

}