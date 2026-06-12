// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-features-plan-list-ui',
//   templateUrl: './features-plan-list-ui.component.html',
//   styleUrls: ['./features-plan-list-ui.component.css']
// })
// export class FeaturesPlanListUIComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-features-plan-list-ui',
  templateUrl: './features-plan-list-ui.component.html',
  styleUrls: ['./features-plan-list-ui.component.css']
})
export class FeaturesPlanListUIComponent implements OnInit {

  featureForm!: FormGroup;

  displayedColumns: string[] = [
    'fid',
    'feature_name',
    'recordStatus',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  selectedFeature: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private userPlanService: UserPlanService,
    private notificationsService: NotificationsService,
    private dialogRef: MatDialogRef<FeaturesPlanListUIComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sharedRoutinesService: SharedRoutinesService
  ) { }

  ngOnInit(): void {

    this.featureForm = this.fb.group({
      feature_name: ['', Validators.required]
    });

    this.loadFeatures();
  }

  toggleAll(isChecked: boolean): void {
    this.dataSource.data.forEach((row: any) => {
      row.selected = isChecked;
    });

  }

  availableFeatures: any[] = [];
  assignedFeatures: any[] = [];

  assignFeatures(selected: any[]) {

    const items = selected.map(x => x.value);

    items.forEach(feature => {

      if (!this.assignedFeatures.find(f => f.fid === feature.fid)) {

        this.assignedFeatures.push(feature);

        this.availableFeatures =
          this.availableFeatures.filter(
            f => f.fid !== feature.fid
          );
      }
    });
  }

  removeFeatures(selected: any[]) {

    const items = selected.map(x => x.value);

    items.forEach(feature => {

      this.availableFeatures.push(feature);

      this.assignedFeatures =
        this.assignedFeatures.filter(
          f => f.fid !== feature.fid
        );
    });
  }

  saveAssignments() {

    const payload = {
      planId: this.data.plan_id,
      featureIds: this.assignedFeatures.map(x => x.fid)
    };

    // this.planService.assignFeatures(payload)
    //   .subscribe({
    //     next: () => {
    //       this.snackBar.open(
    //         'Features assigned successfully',
    //         'Close',
    //         { duration: 3000 }
    //       );
    //     }
    //   });
  }

  loadFeatures(): void {

    this.isLoading = true;

    this.userPlanService.getFeatures(this.data.planId)
      .subscribe({
        next: (res: any) => {

          if (res.success) {
            this.dataSource.data = res.data;
            this.dataSource.paginator = this.paginator;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationsService.toastrError('Failed to load features');
        }
      });
  }

  save(): void {

    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    const payload = {
      planId: this.data.planId,
      plan_name: this.data.plan_name,
      feature_name: this.featureForm.value.feature_name
    };

    console.log('Saving feature with payload:', payload);
    this.userPlanService.saveFeature(payload)
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.notificationsService.toastrSuccess(res.message);

            this.featureForm.reset();

            this.loadFeatures();
          }
        },
        error: () => {
          this.notificationsService.toastrError('Failed to save feature');
        }
      });
  }

  edit(row: any): void {

    this.selectedFeature = row;

    this.featureForm.patchValue({
      feature_name: row.feature_name
    });
  }

  update(): void {

    if (!this.selectedFeature) {
      return;
    }

    this.userPlanService.updateFeature(
      this.selectedFeature.id,
      {
        feature_name: this.featureForm.value.feature_name,
        recordStatus: this.selectedFeature.recordStatus
      }
    ).subscribe({
      next: (res: any) => {

        if (res.success) {

          this.notificationsService.toastrSuccess(res.message);

          this.featureForm.reset();

          this.selectedFeature = null;

          this.loadFeatures();
        }
      }
    });
  }

  delete(row: any): void {

    this.notificationsService
      .popupWarning(
        row.feature_name,
        'Delete this feature?'
      )
      .then(result => {

        if (result.value) {

          this.userPlanService.deleteFeature(row.id)
            .subscribe({
              next: (res: any) => {

                if (res.success) {

                  this.notificationsService.toastrSuccess(
                    res.message
                  );

                  this.loadFeatures();
                }
              }
            });
        }
      });
  }

  clear(): void {
    this.featureForm.reset();
    this.selectedFeature = null;
  }

  close(): void {
    this.dialogRef.close(true);
  }


  availableColumns = ['select', 'feature_name'];
  assignedColumns = ['select', 'feature_name'];
  assignSelected() {
    const selected = this.dataSource.data.filter(x => x.selected);

    this.assignedFeatures.push(...selected);

    this.dataSource.data = this.dataSource.data.filter(x => !x.selected);

    this.dataSource._updateChangeSubscription();
  }

  removeSelected() {
    const selected = this.assignedFeatures.filter(x => x.selected);

    this.dataSource.data = [
      ...this.dataSource.data,
      ...selected
    ];

    this.assignedFeatures = this.assignedFeatures.filter(x => !x.selected);

    this.dataSource._updateChangeSubscription();
  }

  toggleAllAvailable(checked: boolean) {
    this.dataSource.data.forEach(x => x.selected = checked);
  }

  toggleAllAssigned(checked: boolean) {
    this.assignedFeatures.forEach(x => x.selected = checked);
  }

}