import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfessionalService } from 'src/app/services/SharedServices/professional.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { DatePipe } from '@angular/common';
import { inject } from '@angular/core/testing';

@Component({
  selector: 'app-add-employment-ui',
  templateUrl: './add-employment-ui.component.html',
  styleUrls: ['./add-employment-ui.component.css']
})
export class AddEmploymentUiComponent implements OnInit {
  dataList: any[] = [];
  employmentForm!: FormGroup;
  btnSave: string = "Save";
  loading: boolean = false;
  workList: any[] = [];

  constructor(private fb: FormBuilder, private dataService: ProfessionalService,
    private alert: NotificationsService, public dialogRef: MatDialogRef<AddEmploymentUiComponent>,
    private cvDataServices: CurriculumVitaeService, private datePipe: DatePipe, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.employmentForm = this.fb.group({
      employment: this.fb.array([
        this.createEmployment() // Initializes the first FormGroup
      ])
    });

    if (this.data?.id) {
      this.btnSave = 'Update';
      this.patchFormData(this.data);
    }
  }

  patchFormData(data: any) {
    const group = this.employmentArray.at(0) as FormGroup;
    group.patchValue({
      company_name: data.company_name,
      position: data.position,
      job_description: data.job_description,
      date_completed: data.date_completed ? new Date(data.date_completed) : ''
    });
  }


  get employmentArray(): FormArray {
    return this.employmentForm.get('employment') as FormArray;
  }

  addEmployment(): void {
    this.employmentArray.push(this.createEmployment());
  }

  //employment
  createEmployment(): FormGroup {
    return this.fb.group({
      company_name: ['', Validators.required],
      position: ['', Validators.required],
      job_description: ['', Validators.required],
      date_completed: ['', Validators.required],
    });
  }

  //employment
  removeItemFromArray5(arrayName: 'employment', index: number) {
    const formArray = this.employmentForm.get(
      `${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }

  submitForm(): void {
    if (this.employmentForm.invalid) {
      this.employmentForm.markAllAsTouched();
      return;
    }
    let payload = this.employmentForm.get('employment')?.value || [];
    payload = payload.map((item: { date_completed: string | number | Date; }) => ({
      ...item,
      date_completed: this.datePipe.transform(item.date_completed, 'yyyy-MM-dd')
    }));

    console.log('🚀 Sending payload:', payload);

    this.loading = true;

    if (this.btnSave === 'Save') {
      this.cvDataServices.saveEmployment(payload).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.alert.toastrSuccess(res.message);
            this.dialogRef.close(true);
          } else {
            this.alert.toastrWarning(res.message);
          }
        },
        error: (err) => {
          this.loading = false;
         if (err.status === 422 && err.error?.message) {
            this.alert.toastrWarning(err.error.message);
          } else {
            this.alert.toastrError('Failed to save seminar');
          }
        }
      });

    } else {
      // UPDATE MODE → send only one seminar object
      const data = payload[0]; // only the first one
      this.cvDataServices.updateWorkExperience(this.data.id, data).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.alert.toastrSuccess(res.message);
            this.dialogRef.close(true);
          } else {
            this.alert.toastrWarning(res.message);
          }
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 422 && err.error?.message) {
            this.alert.toastrWarning(err.error.message);
          } else {
            this.alert.toastrError('Failed to save seminar');
          }
        }
      });
    }
  }

  submitFormxx(): void {
    if (this.employmentForm.invalid) {
      this.employmentForm.markAllAsTouched();
      return;
    }
    let payload = this.employmentForm.get('employment')?.value || [];
    payload = payload.map((item: { date_completed: string | number | Date; }) => ({
      ...item,
      date_completed: this.datePipe.transform(item.date_completed, 'yyyy-MM-dd')
    }));
    this.cvDataServices.saveEmployment(payload).subscribe({
      next: (res) => {
        if (res.success === true) {
          this.alert.toastrSuccess(res.message);
          this.dialogRef.close(true);
          this.resetForm();
        } else {
          this.alert.toastrWarning(res.message);
        }
      },
      error: (error) => {
        console.error('❌ Failed to save training records:', error);
      }
    });
  }


  resetForm(): void {
    while (this.employmentArray.length !== 0) {
      this.employmentArray.removeAt(0);
    }
    this.employmentArray.push(this.createEmployment()); // Reset with one blank group
    this.employmentForm.reset();
  }

}
