import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-update-plan-ui',
  templateUrl: './update-plan-ui.component.html',
  styleUrls: ['./update-plan-ui.component.css']
})
export class UpdatePlanUIComponent implements OnInit {

  featureForm!: FormGroup;
  selectedFeature: any;
  isLoading = false;

  featureSearchCtrl = new FormControl('');

  featureList = [
    { name: 'Create Profile', code: 'CREATE_PROFILE' },
    { name: 'Create Resume', code: 'CREATE_RESUME' },
    { name: 'Apply to Jobs', code: 'APPLY_JOBS' },
    { name: 'Join Networking Feed', code: 'NETWORK_FEED' },
    { name: 'Receive Job Alerts', code: 'JOB_ALERTS' },
    { name: '15 Connections Limit', code: 'CONNECTION_LIMIT' },
    { name: 'Restricted Search Access', code: 'RESTRICTED_SEARCH' },
    { name: 'Limited Messaging', code: 'LIMITED_MESSAGING' }
  ];

  filteredFeatures = [...this.featureList];

  constructor(
    private fb: FormBuilder,
    private userPlanService: UserPlanService,
    private notify: NotificationsService,
    public shared: SharedRoutinesService,
    private dialogRef: MatDialogRef<UpdatePlanUIComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.featureForm = this.fb.group({
      feature_name: ['', Validators.required],
      feature_code: [{ value: '', disabled: false }, Validators.required],
      feature_value: ['', Validators.required]
    });

    if (this.data?.fid) {
      this.selectedFeature = this.data;
      this.featureForm.patchValue(this.data);
    }

    this.featureSearchCtrl.valueChanges.subscribe(value => {
      const search = (value || '').toLowerCase();
      this.filteredFeatures = this.featureList.filter(x =>
        x.name.toLowerCase().includes(search)
      );
    });

    if (!this.shared.getisMasterAdmin()) {
      this.featureForm.disable();
    }
  }

  onFeatureChange(event: any): void {
    const feature = this.featureList.find(x => x.name === event.value);

    if (feature) {
      this.featureForm.patchValue({
        feature_code: feature.code
      });
    }
  }

  save(): void {
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.featureForm.getRawValue(),
      plan_id: this.data.planId,
      plan_name: this.data.plan_name
    };

    this.userPlanService.saveFeature(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notify.toastrSuccess(res.message);
          this.dialogRef.close(true);
        }
      },
      error: () => this.notify.toastrError('Failed to save feature')
    });
  }

  update(): void {

    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.featureForm.getRawValue(),
      fid: this.selectedFeature.fid,
      recordStatus: this.selectedFeature.recordStatus
    };

    this.userPlanService.updateFeature(payload.fid, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.notify.toastrSuccess(res.message);
          this.dialogRef.close(true);
        }
      },
      error: err => {
        this.isLoading = false;
        this.notify.toastrError(err?.error?.message || 'Failed to update feature');
      }
    });
  }

  clear(): void {
    this.selectedFeature
      ? this.featureForm.patchValue(this.selectedFeature)
      : this.featureForm.reset();
  }

  close(): void {
    this.dialogRef.close();
  }

}