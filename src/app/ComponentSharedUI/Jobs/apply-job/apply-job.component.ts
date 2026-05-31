// import { Component, Inject, OnInit, OnDestroy, Optional, ViewChild } from '@angular/core';
// import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatStepper } from '@angular/material/stepper';
// import { Router, ActivatedRoute } from '@angular/router';
// import { Observable, Subject } from 'rxjs';
// import { map, startWith } from 'rxjs/operators';

// import { CountryCodesService } from 'src/app/services/country-codes.service';
// import { NotificationsService } from 'src/app/services/Global/notifications.service';
// import { JobPostingService } from 'src/app/services/Jobs/job-posting.service';
// import { ProfileService } from 'src/app/services/Profile/profile.service';
// import { AppliedQuestionsService } from 'src/app/services/Jobs/applied-questions.service';

// @Component({
//   selector: 'app-apply-job',
//   templateUrl: './apply-job.component.html',
//   styleUrls: ['./apply-job.component.css']
// })
// export class ApplyJobComponent implements OnInit, OnDestroy {
//   @ViewChild('stepper') stepper!: MatStepper;

//   profiles: any;
//   imageForm!: FormGroup;
//   personalForm!: FormGroup;
//   companyForm!: FormGroup; // ⚠️ Not used in HTML, you may remove if not needed

//   btnSave = "Save All";
//   loading = false;
//   fileError: string | null = null;

//   selectedFile: File | null = null;
//   resumeName: string | null = null;

//   progressValue: number = 0;

//   countryCodes: { label: string; value: string }[] = [];
//   countryControl: FormControl = new FormControl('');
//   filteredCountryCodes!: Observable<{ label: string; value: string }[]>;

//   private _onDestroy = new Subject<void>();

//   job: any = null;
//   questions: any[] = [];
//   transNo: any;
//   responseMessage: string = "";
//   isPhoneValid: boolean = false;

//   constructor(
//     private fb: FormBuilder,
//     @Inject(MAT_DIALOG_DATA) @Optional() public data: any,
//     private notificationService: NotificationsService,
//     private jobServices: JobPostingService,
//     private router: Router,
//     private profileService: ProfileService,
//     private appliedService: AppliedQuestionsService,
//     private countrycodeServices: CountryCodesService,
//     private route: ActivatedRoute
//   ) {

//   }

//   ngOnInit(): void {
//     this.transNo = this.route.snapshot.paramMap.get('transNo');
//     if (this.transNo) {
//       this.fetchJobPosting(this.transNo);
//     }

//     this.imageForm = this.fb.group({
//       resume: [null, Validators.required]
//     });

//     this.personalForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       country_code: ['', Validators.required],
//       phone_number: [''],
//       answers: this.fb.array(this.questions.map(() => this.fb.control('', Validators.required)))
//     });
//     this.loadCountryCodes();
//     this.loadProfile();

//     this.progressValue = this.getProgressValue(0);

//     if (this.data?.id) {
//       this.btnSave = "Update";
//       this.fillFormData();
//     }

//     this.filteredCountryCodes = this.countryControl.valueChanges.pipe(
//       startWith(''),
//       map(value => this._filter(value || ''))
//     );
//   }

//   fetchJobPosting(transNo: string): void {
//     this.loading = true;
//     this.appliedService.getJobPostingByTransNo(transNo).subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.job = res.job;
//           this.questions = (res.questions || []).map((q: any) => ({ ...q, answer: '' }));
//         }
//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//       }
//     });
//   }


//   areAllQuestionsAnswered(): boolean {
//     return this.questions.every((q: any) => {
//       return q.answer !== null && q.answer !== undefined && q.answer !== '';
//     });
//   }

//   loadProfile(): void {
//     this.profileService.getProfileByUserOnly().subscribe({
//       next: (res) => {
//         if (res?.success) {
//           const profile = res.message;
//           this.profiles = profile;
//           this.personalForm.patchValue({
//             email: profile.email || '',
//             phone_number: profile.contact_no || ''
//           });
//         }
//       }
//     });
//   }

//   loadCountryCodes(): void {
//     this.countrycodeServices.loadCountryCodes().subscribe({
//       next: (res) => {
//         if (res?.phones) {
//           this.countryCodes = Object.entries(res.phones).map(([code, dial]: any) => ({
//             label: `${code} (+${dial})`,
//             value: `+${dial}`
//           }));
//         }
//       },
//       error: () => {
//         this.countryCodes = [];
//       }
//     });
//   }

//   private _filter(value: string): { label: string; value: string }[] {
//     const filterValue = value.toLowerCase().trim();
//     return this.countryCodes.filter(c =>
//       c.label.toLowerCase().includes(filterValue) || c.value.includes(filterValue)
//     );
//   }

//   onUploadResume(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (!input.files?.length) return;

//     const file = input.files[0];
//     if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
//       this.fileError = 'Only PDF files are allowed.';
//       this.resumeName = null;
//       this.selectedFile = null;
//       this.imageForm.reset();
//       return;
//     }

//     this.fileError = null;
//     this.resumeName = file.name;
//     this.selectedFile = file;
//     this.imageForm.patchValue({ resume: file });
//   }

//   fillFormData(): void {
//     if (this.data) {
//       this.personalForm.patchValue({
//         email: this.data.email || '',
//         country_code: this.data.country_code || '',
//         phone_number: this.data.phone_number || ''
//       });
//     }
//   }

//   getProgressValue(stepIndex: number): number {
//     const totalSteps = 3;
//     return ((stepIndex + 1) / totalSteps) * 100;
//   }

//   nextStep(stepper?: MatStepper): void { (stepper || this.stepper).next(); }
//   previousStep(stepper?: MatStepper): void { (stepper || this.stepper).previous(); }

//   onStepChange(event: any): void {
//     this.progressValue = this.getProgressValue(event.selectedIndex ?? 0);
//   }

//   onCheckCountryCode(): void {
//     this.responseMessage = '';

//     if (this.personalForm.invalid) {
//       this.responseMessage = '⚠️ Please fill out all fields correctly';
//       this.showPopup(this.responseMessage);
//       return;
//     }

//     const { country_code, phone_number } = this.personalForm.value;
//     console.log('Country Code:', country_code, 'Phone Number:', phone_number);
//     return;

//     this.countrycodeServices.validatePhone(country_code, phone_number).subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.responseMessage = '';
//           this.nextStep(this.stepper);
//         } else {
//           this.responseMessage = res.message;

//           // Optionally map field-specific errors
//           if (res.errors?.phone_number) {
//             this.personalForm.get('phone_number')?.setErrors({ invalidPhone: true });
//           }

//           this.showPopup(this.responseMessage);
//         }
//       },
//       error: (err) => {
//         if (err.status === 404) {
//           this.responseMessage = 'Invalid country code or phone number';
//         } else {
//           this.responseMessage = 'Server error, try again later';
//         }
//         this.showPopup(this.responseMessage);
//       }
//     });
//   }

//   proceedToNext(stepper: any): void {
//     if (this.isPhoneValid) {
//       this.nextStep(stepper);
//     } else {
//       this.showPopup('⚠️ Please validate your phone number first.');
//     }
//   }

//   showPopup(message: string): void {
//     if (message) this.notificationService.toastrWarning(message);
//   }

//   countryPatterns: { [key: string]: RegExp } = {
//     '+63': /^[9]\d{9}$/,            // Philippines (10 digits starting with 9)
//     '+1': /^[2-9]\d{9}$/,           // USA/Canada (10 digits)
//     '+91': /^[6-9]\d{9}$/,          // India (10 digits starting 6–9)
//     '+44': /^\d{10}$/,              // UK (10 digits, simplify for demo)
//   };


//   /** When user selects an autocomplete option, set the form value (bind in template) */
//   onCountrySelected(selectedLabel: string): void {
//     const found = this.countryCodes.find(
//       c => c.label === selectedLabel || c.value === selectedLabel
//     );
//     if (found) {
//       // Remove the + from the value
//       const numericCode = found.value.replace('+', '');
//       this.personalForm.patchValue({ country_code: numericCode });

//       // dynamically update phone_number validator based on selected country
//       const pattern = this.countryPatterns[found.value] || /^[0-9]{7,15}$/;
//       this.personalForm.get('phone_number')?.setValidators([
//         Validators.required,
//         Validators.pattern(pattern)
//       ]);
//       this.personalForm.get('phone_number')?.updateValueAndValidity();
//     }
//   }

//   onSubmit(): void {
//     if (this.personalForm.invalid) {
//       this.notificationService.toastrError("Please complete all required personal fields.");
//       return;
//     }
//     if (!this.selectedFile) {
//       this.notificationService.toastrError("Please upload your resume (PDF).");
//       return;
//     }
//     if (!this.areAllQuestionsAnswered()) {
//       this.notificationService.toastrError("Please answer all questions.");
//       return;
//     }

//     this.loading = true;

//     const formData = new FormData();
//     formData.append('resume_pdf', this.selectedFile as File);
//     formData.append('job_name', this.job?.job_name || '');
//     formData.append('email', this.personalForm.value.email);
//     formData.append('country_code', this.personalForm.value.country_code);
//     formData.append('phone_number', this.personalForm.value.phone_number);
//     formData.append('transNo', this.job?.transNo || `TR-${Date.now()}`);

//     // ✅ Append answers properly
//     this.questions.forEach((q, index) => {
//       formData.append(`answers[${index}][question_id]`, String(q.question_id));
//       formData.append(`answers[${index}][answer_text]`, q.answer || '');
//     });


//     // Debug check
//     for (let pair of (formData as any).entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     this.appliedService.saveAppliedJob(formData).subscribe({
//       next: (res: any) => {
//         this.notificationService.toastrSuccess(res.message || "Application submitted");
//         this.loading = false;
//         this.router.navigate(['/recommended-jobs', res.transNo]);
//       },
//       error: (err: any) => {
//         this.notificationService.toastrError(err.error?.message || "Error saving application");
//         this.loading = false;
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     this._onDestroy.next();
//     this._onDestroy.complete();
//   }
// }


import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  Optional,
  ViewChild,
  HostListener
} from '@angular/core';

import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl
} from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CountryCodesService } from 'src/app/services/country-codes.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { JobPostingService } from 'src/app/services/Jobs/job-posting.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { AppliedQuestionsService } from 'src/app/services/Jobs/applied-questions.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css']
})
export class ApplyJobComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  profiles: any;

  imageForm!: FormGroup;
  personalForm!: FormGroup;

  btnSave = "Submit Application";
  loading = false;
  fileError: string | null = null;

  selectedFile: File | null = null;
  resumeName: string | null = null;

  progressValue: number = 0;

  countryCodes: { label: string; value: string }[] = [];
  countryControl: FormControl = new FormControl('');
  filteredCountryCodes!: Observable<{ label: string; value: string }[]>;

  private _onDestroy = new Subject<void>();

  job: any = null;
  questions: any[] = [];
  transNo: any;

  isMobile = false;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) @Optional() public data: any,
    private notificationService: NotificationsService,
    private jobServices: JobPostingService,
    private router: Router,
    private profileService: ProfileService,
    private appliedService: AppliedQuestionsService,
    private countrycodeServices: CountryCodesService,
    private route: ActivatedRoute,public sharedRoutines: SharedRoutinesService
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.checkScreen();

    this.transNo = this.route.snapshot.paramMap.get('transNo');

    this.initForms();

    this.loadCountryCodes();
    this.loadProfile();

    if (this.transNo) {
      this.fetchJobPosting(this.transNo);
    }

    this.progressValue = this.getProgressValue(0);

    this.filteredCountryCodes = this.countryControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  initForms(): void {
    this.imageForm = this.fb.group({
      resume: [null, Validators.required]
    });

    this.personalForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      country_code: ['', Validators.required],
      phone_number: ['', Validators.required]
    });
  }

  // =========================
  // RESPONSIVE
  // =========================
  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth < 768;
  }

  // =========================
  // FETCH JOB + QUESTIONS
  // =========================
  fetchJobPosting(transNo: string): void {
    this.loading = true;

    this.appliedService.getJobPostingByTransNo(transNo).subscribe({
      next: (res) => {
        if (res.success) {
          this.job = res.job;

          // ✅ IMPORTANT: include answer_type
          this.questions = (res.questions || []).map((q: any) => ({
            ...q,
            answer: '',
            answer_type: q.answer_type || 'general'
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // =========================
  // VALIDATION
  // =========================
  areAllQuestionsAnswered(): boolean {
    return this.questions.every(q => q.answer !== null && q.answer !== '');
  }

  // =========================
  // PROFILE
  // =========================
  loadProfile(): void {
    this.profileService.getProfileByUserOnly().subscribe({
      next: (res) => {
        if (res?.success) {
          const profile = res.message;
          this.profiles = profile;

          this.personalForm.patchValue({
            email: profile.email || '',
            phone_number: profile.contact_no || ''
          });
        }
      }
    });
  }

  // =========================
  // COUNTRY CODES
  // =========================
  loadCountryCodes(): void {
    this.countrycodeServices.loadCountryCodes().subscribe({
      next: (res) => {
        if (res?.phones) {
          this.countryCodes = Object.entries(res.phones).map(([code, dial]: any) => ({
            label: `${code} (+${dial})`,
            value: `+${dial}`
          }));
        }
      },
      error: () => {
        this.countryCodes = [];
      }
    });
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.countryCodes.filter(c =>
      c.label.toLowerCase().includes(filterValue) ||
      c.value.includes(filterValue)
    );
  }

  onCountrySelected(selectedLabel: string): void {
    const found = this.countryCodes.find(
      c => c.label === selectedLabel || c.value === selectedLabel
    );

    if (found) {
      this.personalForm.patchValue({
        country_code: found.value.replace('+', '')
      });
    }
  }

  // =========================
  // FILE UPLOAD
  // =========================
  onUploadResume(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.fileError = 'Only PDF files allowed';
      return;
    }

    this.fileError = null;
    this.selectedFile = file;
    this.resumeName = file.name;

    this.imageForm.patchValue({ resume: file });
  }

  // =========================
  // STEPPER
  // =========================
  getProgressValue(stepIndex: number): number {
    return ((stepIndex + 1) / 3) * 100;
  }

  nextStep(stepper?: MatStepper) {
    (stepper || this.stepper).next();
  }

  previousStep(stepper?: MatStepper) {
    (stepper || this.stepper).previous();
  }

  onStepChange(event: any) {
    this.progressValue = this.getProgressValue(event.selectedIndex ?? 0);
  }

  // =========================
  // SUBMIT
  // =========================
  onSubmit(): void {
    if (this.personalForm.invalid) {
      this.notificationService.toastrError("Complete personal info");
      return;
    }

    if (!this.selectedFile) {
      this.notificationService.toastrError("Upload resume");
      return;
    }

    if (!this.areAllQuestionsAnswered()) {
      this.notificationService.toastrError("Answer all questions");
      return;
    }

    this.loading = true;

    const formData = new FormData();

    formData.append('resume_pdf', this.selectedFile);
    formData.append('job_name', this.job?.job_name || '');
    formData.append('email', this.personalForm.value.email);
    formData.append('country_code', this.personalForm.value.country_code);
    formData.append('phone_number', this.personalForm.value.phone_number);
    formData.append('transNo', this.job?.transNo || '');

    // ✅ SAVE ANSWERS + TYPE
    this.questions.forEach((q, index) => {
      formData.append(`answers[${index}][question_id]`, q.question_id);
      formData.append(`answers[${index}][answer_text]`, q.answer);
      formData.append(`answers[${index}][answer_type]`, q.answer_type);
    });

    this.appliedService.saveAppliedJob(formData).subscribe({
      next: (res: any) => {
        this.notificationService.toastrSuccess(res.message);
        this.loading = false;
        this.router.navigate(['/recommended-jobs', res.transNo]);
      },
      error: () => {
        this.notificationService.toastrError("Submission failed");
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}