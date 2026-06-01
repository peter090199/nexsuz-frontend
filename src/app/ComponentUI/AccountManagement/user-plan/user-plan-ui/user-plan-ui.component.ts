import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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

  constructor(
    private fb: FormBuilder, private planService: UserPlanService,
    public dialogRef: MatDialogRef<UserPlanUIComponent>,private alert:NotificationsService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.planForm = this.fb.group({
      plan_name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      tag: ['STARTER', Validators.required],
      tagmonthYear: ['Monthly', Validators.required],
      button_color: ['basic', Validators.required],
      description: ['', Validators.required],
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


  isloading:boolean = false;
  save(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.isloading = true;
    const payload = this.planForm.getRawValue();
    this.planService.submitData(payload).subscribe({
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