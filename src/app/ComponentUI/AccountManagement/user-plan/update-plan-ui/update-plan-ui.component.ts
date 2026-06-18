import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-update-plan-ui',
  templateUrl: './update-plan-ui.component.html',
  styleUrls: ['./update-plan-ui.component.css']
})
export class UpdatePlanUIComponent implements OnInit {

  featureForm!: FormGroup;
  selectedFeature: any = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userPlanService: UserPlanService,
    private notificationsService: NotificationsService,
    private dialogRef: MatDialogRef<UpdatePlanUIComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.featureForm = this.fb.group({
      feature_name: ['', Validators.required],
      feature_code: ['', Validators.required],
      feature_value: ['', Validators.required]
    });

    if (this.data?.fid) {

      this.selectedFeature = this.data;

      this.featureForm.patchValue({
        feature_name: this.data.feature_name,
        feature_code: this.data.feature_code,
        feature_value: this.data.feature_value
      });
    }
  }

  save(): void {

    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    const payload = {
      plan_id: this.data.planId,
      plan_name: this.data.plan_name,
      feature_name: this.featureForm.value.feature_name,
      feature_code: this.featureForm.value.feature_code,
      feature_value: this.featureForm.value.feature_value
    };

    console.log('Saving feature with payload:', payload);
    this.userPlanService.saveFeature(payload)
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.notificationsService.toastrSuccess(res.message);
            this.featureForm.reset();
            // this.loadFeatures();
          }
        },
        error: () => {
          this.notificationsService.toastrError('Failed to save feature');
        }
      });
  }

  update(): void {

    if (!this.selectedFeature?.fid) {

      this.notificationsService.toastrError('Feature ID not found');
      return;
    }

    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    const payload = {
      fid: this.selectedFeature.fid,
      feature_name: this.featureForm.get('feature_name')?.value,
      feature_code: this.featureForm.get('feature_code')?.value,
      feature_value: this.featureForm.get('feature_value')?.value,
      recordStatus: this.selectedFeature.recordStatus
    };

    this.isLoading = true;
    this.userPlanService.updateFeature(
      this.selectedFeature.fid,
      payload
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {

          this.notificationsService.toastrSuccess(res.message);

          this.dialogRef.close(true);
        }
      },
      error: (err) => {

        this.isLoading = false;

        console.error(err);

        this.notificationsService.toastrError(
          err?.error?.message || 'Failed to update feature'
        );
      }
    });
  }
  clear(): void {

    if (this.selectedFeature) {

      this.featureForm.patchValue({
        feature_name: this.selectedFeature.feature_name,
        feature_code: this.selectedFeature.feature_code,
        feature_value: this.selectedFeature.feature_value
      });

    } else {

      this.featureForm.reset();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}