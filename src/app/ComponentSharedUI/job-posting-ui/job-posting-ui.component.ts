import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { JobPostingService } from 'src/app/services/Jobs/job-posting.service';

@Component({
  selector: 'app-job-posting-ui',
  templateUrl: './job-posting-ui.component.html',
  styleUrls: ['./job-posting-ui.component.css']
})
export class JobPostingUIComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  imageForm!: FormGroup;
  jobForm!: FormGroup;
  companyForm!: FormGroup;
  appliedQuestionForm!: FormGroup;

  btnSave = "Save";
  loading = false;
  fileError: string | null = null;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  worktypes: string[] = ['Onsite', 'Work From Home', 'Hybrid'];
  progressValue: number = 0;
  transNo: any;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) @Optional() public data: any,
    private notificationService: NotificationsService,
    private jobServices: JobPostingService,
    private router: Router,
    private dialogRef: MatDialogRef<JobPostingUIComponent>
  ) {
    // Save transNo for update
    this.transNo = data?.transNo ?? null;
  }

  ngOnInit(): void {
    this.initForms();

    // Patch data if editing
    if (this.data?.job_id) {
      this.btnSave = "Update";
      this.displayFormData();
    }

    this.progressValue = this.getProgressValue(0);
  }

  /** Initialize forms */
  initForms(): void {
    this.imageForm = this.fb.group({
      image: [null, Validators.required]
    });

    this.jobForm = this.fb.group({
      job_name: ['', Validators.required],
      job_position: ['', Validators.required],
      job_description: ['', Validators.required],
      job_about: ['', Validators.required],
      location: ['', Validators.required],
      benefits: ['', Validators.required],
    });

    this.companyForm = this.fb.group({
      qualification: ['', Validators.required],
      work_type: ['', Validators.required],
      comp_name: [''],
      comp_description: ['']
    });

    this.appliedQuestionForm = this.fb.group({
      questions: this.fb.array([])
    });

  }

  /** FormArray getter */
  get questions(): FormArray {
    return this.appliedQuestionForm.get('questions') as FormArray;
  }


  trackByIndex(index: number) {
    return index;
  }

  /** Display data for editing */
  displayFormData(): void {
    if (!this.data) return;

    // Image preview
    if (this.data.job_image) {
      this.previewUrl = this.data.job_image;
      this.imageForm.get('image')?.setValue('loaded'); // mark as valid
    }

    // Patch job fields
    this.jobForm.patchValue({
      job_name: this.data.job_name,
      job_position: this.data.job_position,
      job_description: this.data.job_description,
      job_about: this.data.job_about,
      location: this.data.location,
      benefits: this.data.benefits,
    });

    // Patch company fields
    this.companyForm.patchValue({
      qualification: this.data.qualification,
      work_type: this.data.work_type,
      comp_name: this.data.comp_name,
      comp_description: this.data.comp_description,
    });

    // Patch questions
    if (this.data.questions?.length > 0) {
      const questionsArray = this.fb.array(
        this.data.questions.map((q: any) =>
          this.fb.group({
            question_text: [q.question_text || '', Validators.required],
            answer_type: [q.answer_type || 'yes'],
            //  correct_answer: [q.correct_answer || ''],
            //  user_answer: [q.user_answer || '']
          })
        )
      );

      this.appliedQuestionForm.setControl('questions', questionsArray);
    }
  }

  /** Stepper helpers */
  nextStep(stepper?: MatStepper): void {
    (stepper || this.stepper).next();
  }

  previousStep(stepper?: MatStepper): void {
    (stepper || this.stepper).previous();
  }

  onStepChange(event: any) {
    const currentStep = event?.selectedIndex ?? 0;
    this.progressValue = this.getProgressValue(currentStep);
  }

  getProgressValue(stepIndex: number): number {
    const totalSteps = 4;
    return ((stepIndex + 1) / totalSteps) * 100;
  }

  /** File upload */
  onUploadPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      this.fileError = 'Please select a valid image.';
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Only image files are allowed.';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.fileError = 'Image size must be less than 2MB.';
      return;
    }

    this.selectedFile = file;
    this.imageForm.get('image')?.setValue('selected');

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);

    this.fileError = null;
  }

  /** Add dynamic question */
  addQuestion() {
    if (!this.appliedQuestionForm) return;

    this.questions.push(
      this.fb.group({
        question_text: [''],
        answer_type: ['yes'],
        correct_answer: [''],
        user_answer: ['']
      })
    );
  }

  // Optional: check all answers
  checkAnswers() {
    this.questions.controls.forEach((q: any) => {
      const user = q.get('user_answer')?.value;
      const correct = q.get('correct_answer')?.value;

      q.patchValue({
        is_correct: user === correct
      });
    });
  }


  addQuestionxx(): void {
    this.questions.push(
      this.fb.group({
        question_text: ['', Validators.required]
      })
    );
  }

  /** Remove question */
  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }
  /** Submit form */

  onSubmit(): void {

    if (this.jobForm.invalid || this.companyForm.invalid || this.appliedQuestionForm.invalid) {
      this.notificationService.toastrError("Please complete all required fields.");
      return;
    }

    this.loading = true;

    const formData = new FormData();

    // =========================
    // IMAGE
    // =========================
    if (this.selectedFile) {
      formData.append("job_image", this.selectedFile);
    }

    // =========================
    // MERGED FIELDS (SAFE)
    // =========================
    const payload = {
      ...this.jobForm.value,
      ...this.companyForm.value,
      ...this.appliedQuestionForm.value
    };

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // =========================
    // QUESTIONS (FIXED FORMAT)
    // =========================
    const questions = this.appliedQuestionForm.value.questions || [];

    questions.forEach((q: any, index: number) => {
      formData.append(`question_text[${index}]`, q.question_text);
      formData.append(`answer_type[${index}]`, q.answer_type);
    });

    // =========================
    // DEBUG (IMPORTANT)
    // =========================
    // console.log("===== FORM DATA =====");
    // for (let pair of formData.entries()) {
    //   console.log(pair[0], pair[1]);
    // }

    // =========================
    // API CALL (CREATE / UPDATE)
    // =========================
    const request$ =
      this.btnSave.toLowerCase() === "update"
        ? this.jobServices.updateJobPosting(formData, this.transNo)
        : this.jobServices.saveJobPosting(formData);

    request$.subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success) {
          this.notificationService.toastrSuccess(res.message);
          this.dialogRef.close(true);
        } else {
          this.notificationService.toastrError(res.message);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.notificationService.toastrError("Server error occurred!");
      }
    });
  }

  onSubmitxxx(): void {
    // Validate forms
    if (this.jobForm.invalid || this.companyForm.invalid || this.appliedQuestionForm.invalid) {
      this.notificationService.toastrError("Please complete all required fields.");
      return;
    }
    this.loading = true;
    const formData = new FormData();
    // Append job image if selected
    if (this.selectedFile) {
      formData.append("job_image", this.selectedFile);
    }

    // Append job & company form values
    Object.entries({ ...this.jobForm.value, ...this.companyForm.value }).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Append questions as question_text[]
    const appliedQuestionValues = this.appliedQuestionForm.value;
    if (appliedQuestionValues.questions?.length > 0) {
      appliedQuestionValues.questions.forEach((q: any, index: number) => {
        formData.append(`question_text[${index}]`, q.question_text);
      });
    }

    // ---------- DEBUG: log for verification ----------
    console.log("=== FORM DATA DEBUG ===");
    console.log("TransNo:", this.transNo);
    console.log("Job Form:", this.jobForm.value);
    console.log("Company Form:", this.companyForm.value);
    console.log("Questions:", this.appliedQuestionForm.value.questions);
    console.log("Selected File:", this.selectedFile);

    // ---------- Call API ----------
    if (this.btnSave.toLowerCase() === "update") {
      this.jobServices.updateJobPosting(formData, this.transNo).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.notificationService.toastrSuccess(res.message);
            this.dialogRef.close(true);
          } else {
            this.notificationService.toastrError(res.message);
          }
        },
        error: () => {
          this.loading = false;
          this.notificationService.toastrError("Error updating job!");
        }
      });
    } else {
      this.jobServices.saveJobPosting(formData).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.notificationService.toastrSuccess(res.message);
            this.dialogRef.close(true);
          } else {
            this.notificationService.toastrError(res.message);
          }
        },
        error: () => {
          this.loading = false;
          this.notificationService.toastrError("Error saving job!");
        }
      });
    }
  }

  /** Close dialog */
  onClose(): void {
    this.dialogRef.close();
  }
}
