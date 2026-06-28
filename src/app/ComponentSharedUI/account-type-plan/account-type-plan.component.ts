import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-account-type-plan',
  templateUrl: './account-type-plan.component.html',
  styleUrls: ['./account-type-plan.component.css']
})
export class AccountTypePlanComponent implements OnInit {

  plans: any[] = [];
  planFeatures: any = [];
  isLoading = false;

  constructor(
    private router: Router, public sharedService: SharedRoutinesService,
    private userPlanService: UserPlanService
  ) { }

  ngOnInit(): void {
    this.loadPlans();
  }

  getBadgeClass(color: string): string {
    return color || 'primary';
  }

  goToCheckout(plan: any): void {
    if (plan.tag === 'STARTER') {
      this.sharedService.goToSubscription();
      return;
    }
    this.sharedService.goToCheckoutByDEF_USERS(plan);
  }

  loadPlans(): void {

    this.isLoading = true;

    this.userPlanService.getAll().subscribe({
      next: (res: any) => {

        if (!res.success) {
          this.isLoading = false;
          return;
        }

        this.plans = res.data || [];

        if (!this.plans.length) {
          this.isLoading = false;
          return;
        }

        let loaded = 0;

        this.plans.forEach(plan => {

          this.userPlanService.getFeatures(plan.planId).subscribe({
            next: (featureRes: any) => {
              this.planFeatures[plan.planId] = featureRes.success
                ? featureRes.data
                : [];
            },
            error: () => {
              this.planFeatures[plan.planId] = [];
            },
            complete: () => {
              loaded++;

              if (loaded === this.plans.length) {
                this.isLoading = false;
              }
            }
          });

        });

      },
      error: () => {
        this.isLoading = false;
      }
    });

  }

  /* =====================================
     Disable Right Click
  ===================================== */

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    event.preventDefault();
  }

  /* =====================================
     Disable Common Developer Shortcuts
  ===================================== */

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    const key = event.key.toUpperCase();

    if (
      key === 'F12' ||
      (event.ctrlKey && key === 'U') ||
      (event.ctrlKey && event.shiftKey &&
        ['I', 'J', 'C', 'K'].includes(key))
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

  }

}