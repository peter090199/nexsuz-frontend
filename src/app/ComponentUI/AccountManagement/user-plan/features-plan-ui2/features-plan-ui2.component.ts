// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-features-plan-ui2',
//   templateUrl: './features-plan-ui2.component.html',
//   styleUrls: ['./features-plan-ui2.component.css']
// })
// export class FeaturesPlanUI2Component implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { UpdatePlanUIComponent } from '../update-plan-ui/update-plan-ui.component';

@Component({
  selector: 'app-features-plan-ui2',
  templateUrl: './features-plan-ui2.component.html',
  styleUrls: ['./features-plan-ui2.component.css']
})
export class FeaturesPlanUI2Component implements OnInit {

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
    private dialogRef: MatDialogRef<FeaturesPlanUI2Component>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sharedRoutinesService: SharedRoutinesService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    this.featureForm = this.fb.group({
      feature_name: ['', Validators.required]
    });

    this.loadFeatures();
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

  new(): void {
    const dialogRef = this.dialog.open(UpdatePlanUIComponent, {
      width: '500px',
      disableClose: true,
      data: {
        planId: this.data.planId,
        plan_name: this.data.plan_name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFeatures();
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
    const dialogRef = this.dialog.open(UpdatePlanUIComponent, {
      width: '500px',
      disableClose: true,
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFeatures();
      }
    });

  }

  editx(row: any): void {

    // this.selectedFeature = row;

    // this.featureForm.patchValue({
    //   feature_name: row.feature_name
    // });
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
}