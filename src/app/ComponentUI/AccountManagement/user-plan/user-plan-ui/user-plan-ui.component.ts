import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

@Component({
  selector: 'app-user-plan-ui',
  templateUrl: './user-plan-ui.component.html',
  styleUrls: ['./user-plan-ui.component.css']
})
export class UserPlanUIComponent implements OnInit {

  planForm!: FormGroup;
  btnSave = 'Save';
  statusList = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  constructor(
    private fb: FormBuilder, private planService: UserPlanService,
    public dialogRef: MatDialogRef<UserPlanUIComponent>, private alert: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.createForm();

    if (this.data) {
      this.btnSave = 'Update';
      this.planForm.patchValue({
        button_name: this.data.button_name,
        sort_number: this.data.sort_number,
        plan_name: this.data.plan_name,
        price: this.data.price,
        tag: this.data.tag,
        tagmonthYear: this.data.tagmonthYear,
        button_color: this.data.button_color,
        description: this.data.description,
        recordStatus: this.data.recordStatus
      });
    }
  }

  createForm(): void {
    this.planForm = this.fb.group({
      plan_name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      tag: ['STARTER', Validators.required],
      tagmonthYear: ['Monthly', Validators.required],
      button_color: ['basic', Validators.required],
      description: ['', Validators.required],
      button_name: ['', Validators.required],
      sort_number: [0, [Validators.required, Validators.min(1)]],
      recordStatus: ['active', Validators.required],
    });


  }

  get features(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  addFeature(): void {
    this.features.push(
      this.fb.control('', Validators.required)
    );
  }

  removeFeature(index: number): void {

    if (this.features.length > 1) {
      this.features.removeAt(index);
    }

  }


  isloading: boolean = false;
  save(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const payload = this.planForm.getRawValue();

    // =========================
    // EDIT MODE
    // =========================
    if (this.data?.id) {
      this.planService.update(this.data.id, payload)
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alert.toastrSuccess('Plan updated successfully');
              this.dialogRef.close(true);
            } else {
              this.alert.toastrError(res.message);
            }
          },
          error: () => {
            this.alert.toastrError('Update failed');
          }
        });

      return;
    }

    // =========================
    // CREATE MODE
    // =========================
    this.planService.save(payload)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alert.toastrSuccess(res.message);
            this.dialogRef.close(true);
          }
        },
        error: (res: any) => {
          this.alert.toastrWarning(res.message || 'Creation failed');
        }
      });
  }


  savexx(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.isloading = true;
    const payload = this.planForm.getRawValue();
    this.planService.save(payload).subscribe({
      next: (res) => {
        this.alert.toastrSuccess(res.message);
        this.isloading = false;
        this.dialogRef.close();
      },
      error: (err) => {
        this.isloading = false;
        this.alert.toastrError('Error saving plan');
      }
    });
  }


  onClose(): void {
    this.dialogRef.close();
  }

  resetForm(): void {

    // this.planForm.reset({
    //   plan_name: '',
    //   price: 0,
    //   tag: 'STARTER',
    //   description: '',
    //   button_color: 'Basic'
    // });

  }

}