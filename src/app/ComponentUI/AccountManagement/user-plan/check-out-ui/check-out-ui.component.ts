import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take } from 'rxjs/operators';

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
  isSubmitting = false;

  selectedPayment: 'gcash' | 'paypal' | 'card' = 'gcash';

  constructor(
    private route: ActivatedRoute,
    private userPlanService: UserPlanService,
    private notification: NotificationsService,
    public sharedService: SharedRoutinesService
  ) { }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('planId');

    if (!this.planId) {
      this.notification.toastrError('Invalid plan.');
      return;
    }

    this.loadPlan(this.planId);
  }

  get price(): number {
    return Number(this.plan?.price ?? 0);
  }

  get vat(): number {
    return +(this.price * 0.12).toFixed(2);
  }

  get total(): number {
    return +(this.price + this.vat).toFixed(2);
  }

  subscribe(): void {

    if (this.isSubmitting) {
      return;
    }

    if (!this.plan) {
      this.notification.toastrError('Plan not found.');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      planId: this.plan.planId,
      payment_method: this.getPaymentMethod()
    };

    this.userPlanService.upgradePlan(payload)
      .pipe(
        take(1),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.notification.toastrSuccess(
              res.message || 'Subscription upgraded successfully.'
            );

            // Optional: Navigate back after success
            this.sharedService.goBack();

          } else {

            this.notification.toastrError(
              res.message || 'Unable to upgrade plan.'
            );

          }

        },
        error: (err) => {

          this.notification.toastrError(
            err?.error?.message || 'Something went wrong. Please try again.'
          );

        }
      });

  }

  private getPaymentMethod(): string {

    const paymentMap: Record<string, string> = {
      gcash: 'GCash',
      paypal: 'PayPal',
      card: 'Credit Card'
    };

    return paymentMap[this.selectedPayment] || 'GCash';

  }

  private loadPlan(planId: string): void {

    this.isLoading = true;

    this.userPlanService.getById(planId)
      .pipe(
        take(1),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res: any) => {

          if (res.success) {
            this.plan = res.data;
          } else {
            this.notification.toastrError(
              res.message || 'Plan not found.'
            );
          }

        },
        error: (err) => {

          this.notification.toastrError(
            err?.error?.message || 'Unable to load plan.'
          );

        }
      });

  }

}