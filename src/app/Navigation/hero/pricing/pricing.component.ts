// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-pricing',
//   templateUrl: './pricing.component.html',
//   styleUrls: ['./pricing.component.css']
// })
// export class PricingComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }
// a

import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

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

    this.userPlanService.getPlan().subscribe({
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

          this.userPlanService.getFeatures2(plan.planId).subscribe({
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


 
 

}