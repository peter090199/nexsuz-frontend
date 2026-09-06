import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild, AfterViewInit, Inject, ElementRef } from '@angular/core';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { MatHorizontalStepper } from '@angular/material/stepper/stepper';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddLanguageUIComponent } from '../Languange/add-language-ui/add-language-ui.component';
import { AddEducationUIComponent } from '../ProfessionalDev/add-education-ui/add-education-ui.component';
import { AddSkillsUIComponent } from '../ProfessionalDev/add-skills-ui/add-skills-ui.component';
import { AddTrainingsUiComponent } from '../ProfessionalDev/add-trainings-ui/add-trainings-ui.component';
import { AddSeminarUiComponent } from '../ProfessionalDev/add-seminar-ui/add-seminar-ui.component';
import { AddEmploymentUiComponent } from '../ProfessionalDev/add-employment-ui/add-employment-ui.component';
import { AddCertificateUiComponent } from '../ProfessionalDev/add-certificate-ui/add-certificate-ui.component';
import { ProfessionalService } from 'src/app/services/SharedServices/professional.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { Observable } from 'rxjs';
import { AddEditEducationDialogComponent } from '../ProfessionalDev/Edit/add-edit-education-dialog/add-edit-education-dialog.component';
import { AddEditSeminarComponent } from '../ProfessionalDev/Edit/add-edit-seminar/add-edit-seminar.component';
import { AddEditTrainingComponent } from '../ProfessionalDev/Edit/add-edit-training/add-edit-training.component';
import { AddEditCertificateComponent } from '../ProfessionalDev/Edit/add-edit-certificate/add-edit-certificate.component';
import { AddEditWorkExprienceComponent } from '../ProfessionalDev/Edit/add-edit-work-exprience/add-edit-work-exprience.component';
import { AddEditSkillsComponent } from '../ProfessionalDev/Edit/add-edit-skills/add-edit-skills.component';
import { AddEditLanguageComponent } from '../ProfessionalDev/Edit/add-edit-language/add-edit-language.component';
import { ViewLanguageUIComponent } from '../Languange/view-language-ui/view-language-ui.component';
import { TranslateModule } from '@ngx-translate/core';
import { PrintCVComponent } from '../print-cv/print-cv.component';
import { AuthService } from 'src/app/services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ImagesService } from 'src/app/services/images/images.service';



/**
 * @title Basic expansion panel
 */

export interface User {
  name: string;
}

export interface User2 {
  name: string;
}

@Component({
  selector: 'app-user-cv',
  templateUrl: './user-cv.component.html',
  styleUrls: ['./user-cv.component.css']
})
export class UserCVComponent implements AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  @ViewChild('stepper') stepper!: MatHorizontalStepper;
  progressValue: number = 0;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  summaryFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  formEducation: any[] = [];
  formSeminar: any[] = [];
  formTraining: any = [];
  formCertificate: any[] = [];
  formWorkExperience: any[] = [];
  formSkills: any[] = [];


  formSkillss = [
    { skills: 'Network Configuration' },
    { skills: 'Cloud Networking' },
    { skills: 'Network Security' }
  ];

  allSkills = [
    "Network Configuration",
    "Network Protocols (TCP/IP, UDP, HTTP, DNS, etc.)",
    "Network Security",
    "Firewall Management",
    "VPN Setup and Management",
    "Wi-Fi and LAN/WAN Configuration",
    "Cloud Networking",
    "Network Troubleshooting and Diagnostics",
    "Routing and Switching",
    "Load Balancing and Failover",
    "DNS Management",
    "Network Performance Optimization",
    "Network Automation",
    "Network Monitoring and Analysis",
    "QoS (Quality of Service) Management",
    "SDN (Software-Defined Networking)",
    "VLAN Configuration",
    "Network Virtualization",
    "IP Address Management (IPAM)",
    "Packet Analysis",
    "IT Specialist",
    "Front End Developer",
    "Back End Developer",
    "Full Stack Developer"
  ];

  ngAfterViewInit() {
    this.stepper.selectionChange.subscribe(() => {
      this.updateProgress();
    });

    this.firstFormGroup.valueChanges.subscribe(() => {
      this.updateProgress();
    });
    this.secondFormGroup.valueChanges.subscribe(() => {
      this.updateProgress();
    });
    this.thirdFormGroup.valueChanges.subscribe(() => {
      this.updateProgress();
    });
    this.summaryFormGroup.valueChanges.subscribe(() => {
      this.updateProgress();
    });
    //this.loadSkills();
  }
  updateProgress() {
    const totalSteps = 4; // Total steps in your stepper
    const currentStepIndex = this.stepper.selectedIndex;
    const stepsFilled = this.calculateFilledSteps();
    this.progressValue = (stepsFilled / totalSteps) * 100;
  }

  calculateFilledSteps(): number {
    let filledSteps = 0;

    if (this.firstFormGroup.valid) filledSteps++;
    if (this.secondFormGroup.valid) filledSteps++;
    if (this.thirdFormGroup.valid) filledSteps++;
    if (this.summaryFormGroup.valid) filledSteps++;

    return filledSteps;
  }

  constructor(private formBuilder: FormBuilder, private userService: ProfileService,
    private cvService: CurriculumVitaeService,
    private notificationService: NotificationsService, private router: Router, private datePipe: DatePipe,
    private dialog: MatDialog, private passDataServices: ProfessionalService, private alert: NotificationsService,
    private profileService: ProfessionalService, private educacationServices: CurriculumVitaeService,
    private authServiceCode: AuthService,private imageService:ImagesService
  ) {
    this.countryControl1.valueChanges.subscribe(value => {
      this.filteredCountries1 = this.filterCountries(value);
    });

    this.countryControl2.valueChanges.subscribe(value => {
      this.filteredCountries2 = this.filterCountries(value);
    });
  }
  animationClass: string = '';
  profileTitle: string = 'Build Your Basic Information';
  stepLabels: string[] = [
    'Build Your Basic Information',
    'Build Your Location Details',
    'Build Your Summary',
    'Build Your Qualifications'
  ];

  onStepChange(event: StepperSelectionEvent) {
    this.profileTitle = this.stepLabels[event.selectedIndex];
  }
  onTabChange(event: MatTabChangeEvent) {
    this.profileTitle = `${this.stepLabels[3]} - ${event.tab.textLabel}`;
  }


  loadSkills() {
    this.educacationServices.getSkills().subscribe({
      next: (res) => {
        if (res.success === true) {
          this.formSkills = res.data;
        }
        if (res.success === false) {
          this.alert.toastrWarning(res.message);
        }
      },
      error: (err) => {
        //  console.error('API error:', err);
      },
    });
  }


  loadEducationData() {
    this.educacationServices.getEducationsByCode().subscribe({
      next: (res) => {
        if (res.success == true) {
          this.formEducation = res.data;
        } else {
          this.alert.toastrWarning(res.message);
        }
      },
      error: (err) => {
        //  console.error('API error:', err);
      },
    });
  }

  isLoading2: boolean = false;
  loadCertificateData() {
    this.isLoading2 = true;
    this.cvService.getCertificates().subscribe({
      next: (res) => {
        this.isLoading2 = false;
        if (res.success == true) {
          this.formCertificate = res.data; // ensure it's always an array
        } else {
          this.formCertificate = [];
          this.alert.toastrWarning(res.message);
        }
      },
      error: () => {
        this.isLoading2 = false;
        this.formCertificate = [];
      }
    });
  }

  loadTrainingData(): void {
    this.isLoading = true;


    this.cvService.getTrainings().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.formTraining = res.data;
        } else {
          this.formTraining = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load seminar data:', err);
        this.alert.toastrError('Failed to load seminar data.');
      }
    });
  }


  loadSeminarData(): void {
    this.isLoading = true;

    this.cvService.getSeminarByCode().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.formSeminar = res.data;
        } else {
          this.formSeminar = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load seminar data:', err);
        this.alert.toastrError('Failed to load seminar data.');
      }
    });
  }

  isLoading3: boolean = false;
  loadWorkExperienceData(): void {
    this.isLoading3 = true;


    this.cvService.getEmployment().subscribe({
      next: (res) => {
        this.isLoading3 = false;
        if (res.success && Array.isArray(res.data)) {
          this.formWorkExperience = res.data;
        } else {
          this.formWorkExperience = [];
        }
      },
      error: (err) => {
        this.isLoading3 = false;
        console.error('Failed to load seminar data:', err);
        this.alert.toastrError('Failed to load seminar data.');
      }
    });
  }


  loadSkillsData() {
    this.formSkills = this.profileService.getSkills();
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  editSeminar(data: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(AddSeminarUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSeminarData();
      }
    });
  }

  editEducation(educ: any): void {
    const dialogRef = this.dialog.open(AddEditEducationDialogComponent, {
      width: '500px',
      data: educ,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEducationData();
      }
    });
  }

  editTraining(data: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(AddTrainingsUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTrainingData();
      }
    });
  }


  editCertificate(data: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(AddCertificateUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCertificateData();
      }
    });
  }

  editWorkexperience(data: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(AddEmploymentUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkExperienceData();
      }
    });
  }


  // Edit a skill
  editSkills(skill: any): void {
    console.log("skill", skill)
    const dialogRef = this.dialog.open(AddEditSkillsComponent, {
      width: '500px',
      data: skill,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSkills();
      }
    });
  }


  isLoading: boolean = false;
  removeEducation(education: any): void {

    this.alert.popupWarning(education.highest_education, " " + "Are you sure to delete this education?").then((result) => {
      if (result.value) {
        this.isLoading = true;
        this.educacationServices.deleteEduc(education.id).subscribe({
          next: (res) => {
            if (res.success === true) {
              this.alert.toastrSuccess(res.message);
              this.isLoading = false;
              this.loadEducationData();
            }
            else {
              this.alert.toastrError(res.message);
              this.isLoading = false;
            }

          },
          error: (error) => {
            this.alert.toastrError(error.error);
            this.isLoading = false;
          }

        });
      }


    });

  }

  // removeSeminar(index: number) {
  //   this.alert.toastrSuccess("Successfuly Deleted!")
  //   this.formSeminar.splice(index, 1);

  // }

  removeSeminar(data: any): void {
    this.alert.popupWarning(data.seminar_title, "Are you sure to delete this seminar?")
      .then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.cvService.deleteSeminar(data.id).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res.success) {
                this.alert.toastrSuccess(res.message);
                this.loadSeminarData(); // ✅ Only reload if delete was successful
              } else {
                this.alert.toastrError(res.message);
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.alert.toastrError(error.error || 'Delete failed.');
            }
          });
        }
      });
  }


  removeTraining(data: any): void {
    this.alert.popupWarning(data.training_title, "Are you sure to delete this training?")
      .then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.cvService.deleteTraining(data.id).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res.success) {
                this.alert.toastrSuccess(res.message);
              } else {
                this.alert.toastrError(res.message);
              }
              this.loadTrainingData();
            },
            error: (error) => {
              this.isLoading = false;
              this.alert.toastrError(error.error || 'Delete failed.');
            }
          });
        }
      });
  }


  removeCertificate(data: any): void {
    this.alert.popupWarning(data.certificate_title, "Are you sure to delete this certificate?")
      .then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.cvService.deleteCertificate(data.id).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res.success) {
                this.alert.toastrSuccess(res.message);
                this.loadCertificateData();
              } else {
                this.alert.toastrError(res.message);
              }
              this.loadCertificateData();
            },
            error: (error) => {
              this.isLoading = false;
              this.alert.toastrError(error.error || 'Delete failed.');
            }
          });
        }
      });
  }

  // removeTraining(index: number) {
  //   this.alert.toastrSuccess("Successfuly Deleted!")
  //   this.formTraining.splice(index, 1);
  // }

  // removeCertificate(index: number) {
  //   this.alert.toastrSuccess("Successfuly Deleted!")
  //   this.formCertificate.splice(index, 1);

  // }
  // removeWorkExp(index: number) {
  //   this.alert.toastrSuccess("Successfuly Deleted!")
  //   this.formWorkExperience.splice(index, 1);
  // }

  removeWorkExp(data: any): void {
    this.alert.popupWarning(data.company_name, "Are you sure to delete this company_name?")
      .then((result) => {
        if (result.value) {
          this.isLoading3 = true; // ✅ Show loading indicator
          this.educacationServices.deleteEmployment(data.id).subscribe({
            next: (res) => {
              this.isLoading3 = false;
              if (res.success === true) {
                this.alert.toastrSuccess(res.message);
                this.loadWorkExperienceData(); // ✅ Load updated list only on success
              } else {
                this.alert.toastrError(res.message);
              }
            },
            error: (error) => {
              this.isLoading3 = false;
              this.alert.toastrError(error.error || 'Failed to delete skill.');
            }
          });
        }
      });
  }


  removeSkills(data: any): void {
    this.alert.popupWarning(data.skills, "Are you sure to delete this skill?")
      .then((result) => {
        if (result.value) {
          this.isLoading = true; // ✅ Show loading indicator
          this.educacationServices.deleteSkills(data.id).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res.success === true) {
                this.alert.toastrSuccess(res.message);
                this.loadSkills(); // ✅ Load updated list only on success
              } else {
                this.alert.toastrError(res.message);
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.alert.toastrError(error.error || 'Failed to delete skill.');
            }
          });
        }
      });
  }

  userData: any;
  error: any;
  familyName: string = "";
  lname: string = "";
  fname: string = "";
  email: string = "";
  contact_no: string = "";
  profession: string = "";
  progressPercentage = 0;

  isEligible: boolean = false;
  searchCtrl = new FormControl('');



  formData: any = [];

  country: any[] = [];
  selectedCountry: string='';
  selectedValue: string = '';
  countries: { name: string }[] = [
    { name: 'USA' }, { name: 'Canada' }, { name: 'Russia' }, { name: 'Kazakhstan' }, { name: 'Egypt' },
    { name: 'South Africa' }, { name: 'Greece' }, { name: 'Netherlands' }, { name: 'Belgium' },
    { name: 'France' }, { name: 'Spain' }, { name: 'Hungary' }, { name: 'Italy' }, { name: 'Romania' },
    { name: 'Switzerland' }, { name: 'Austria' }, { name: 'UK' }, { name: 'Denmark' }, { name: 'Sweden' },
    { name: 'Norway' }, { name: 'Poland' }, { name: 'Germany' }, { name: 'Mexico' }, { name: 'Argentina' },
    { name: 'Brazil' }, { name: 'Chile' }, { name: 'Colombia' }, { name: 'Venezuela' }, { name: 'Malaysia' },
    { name: 'Australia' }, { name: 'Indonesia' }, { name: 'Philippines' }, { name: 'New Zealand' },
    { name: 'Singapore' }, { name: 'Thailand' }, { name: 'Japan' }, { name: 'South Korea' },
    { name: 'Vietnam' }, { name: 'China' }, { name: 'Turkey' }, { name: 'India' }, { name: 'Pakistan' },
    { name: 'Afghanistan' }, { name: 'Sri Lanka' }, { name: 'Myanmar' }, { name: 'Iran' }, { name: 'Morocco' },
    { name: 'Algeria' }, { name: 'Tunisia' }, { name: 'Libya' }, { name: 'Gambia' }, { name: 'Senegal' },
    { name: 'Nigeria' }, { name: 'Ethiopia' }, { name: 'Kenya' }, { name: 'Tanzania' }, { name: 'Uganda' },
    { name: 'Zambia' }, { name: 'Zimbabwe' }, { name: 'Faroe Islands' }, { name: 'Portugal' },
    { name: 'Luxembourg' }, { name: 'Ireland' }, { name: 'Iceland' }, { name: 'Albania' }, { name: 'Malta' },
    { name: 'Cyprus' }, { name: 'Finland' }, { name: 'Lithuania' }, { name: 'Latvia' }, { name: 'Estonia' },
    { name: 'Ukraine' }, { name: 'Croatia' }, { name: 'Slovenia' }, { name: 'Bosnia and Herzegovina' },
    { name: 'North Macedonia' }, { name: 'Czech Republic' }, { name: 'Slovakia' }, { name: 'Liechtenstein' },
    { name: 'UAE' }, { name: 'Israel' }, { name: 'Bahrain' }, { name: 'Qatar' }, { name: 'Bhutan' },
    { name: 'Mongolia' }, { name: 'Nepal' }, { name: 'Tajikistan' }, { name: 'Turkmenistan' },
    { name: 'Azerbaijan' }, { name: 'Georgia' }, { name: 'Kyrgyzstan' }, { name: 'Uzbekistan' }
  ];

  homeFilteredOptions!: Observable<{ name: string }[]>;
  currentFilteredOptions!: Observable<{ name: string }[]>;

  countryControl1 = new FormControl();
  countryControl2 = new FormControl();

  filteredCountries1: { name: string }[] = this.countries;
  filteredCountries2: { name: string }[] = this.countries;

  isImageSelected: boolean = false;
  currentUserCode: any;
  ngOnInit(): void {
    this.currentUserCode = this.authServiceCode.getAuthCode();
    this.loadProfileCV();

    this.initializeFormGroups();

    this.firstFormGroup.get('date_birth')?.valueChanges.subscribe(() => {
      this.validateAge();
    });
    this.loadProfile1();
    this.loadProfile2();
    this.loadEducationData();
    this.loadSkills();
    this.loadSeminarData();
    this.loadTrainingData();
    this.loadCertificateData();
    this.loadWorkExperienceData();

  }

  profiles: any;
  loadProfileCV() {
    this.userService.getProfileByBasicInfo().subscribe({
      next: (response) => {
        if (response.success == true) {
          this.profiles = response.data.code;
          console.log(this.profiles)

        } else {
          this.error = 'Failed to load profile data';
        }
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching profile data';
      },
    });
  }
  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  displayFn2(user: User): string {
    return user && user.name ? user.name : '';
  }

  clickToBack() {
    this.router.navigateByUrl("/home");
  }

  filterCountries(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(filterValue)
    );
  }
  // private _filterCountries(value: any, countries: { name: string }[]): { name: string }[] {
  //   console.log('Filtering value:', value); // Debugging line
  //   if (typeof value === 'string') {
  //     const filterValue = value.toLowerCase();
  //     return countries.filter(option =>
  //       option.name.toLowerCase().includes(filterValue)
  //     );
  //   }
  //   return [];
  // }


  // Function to check if a field is valid
  isFieldValid(field: string) {
    const control = this.secondFormGroup.get(field);
    return control?.valid || control?.touched;
  }


  resetSearch(): void {
    this.selectedValue = '';  // Clear the selected value
    //this.filteredOptions = [...this.allOptions];  // Reset the filtered options to show all
  }

  validateAge(): void {
    const dateOfBirth = this.firstFormGroup.get('date_birth')?.value;

    if (!dateOfBirth) {
      this.isEligible = false;
      return;
    }

    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    this.isEligible = age >= 18;
  }



  loadProfile1(): void {
    this.userService.getProfileByUserOnly().subscribe({
      next: (res) => {
        if (res.success) {
          const profile = res.message;

          this.firstFormGroup.patchValue({
            fname: profile.fname,
            lname: profile.lname,
            profession: profile.profession,
            contact_no: profile.contact_no,
            email: profile.email,
          });
          this.previewUrl = profile.photo_pic;
          this.loadProfile2();
          this.validateAge();
        }
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      }
    });
  }

  getFilenameFromPath(path: any): string {
    return path.split('/').pop() || '';
  }

  loadProfile2(): void {
    this.userService.getProfileByBasicInfo().subscribe({
      next: (res) => {
        if (res.success) {
          this.validateAge();
          const profile = res.data;
          const rawPath = res.data.photo_pic;

          this.previewUrl = this.imageService.cleanImageUrl(rawPath);
          console.log(this.previewUrl);

          this.filename = this.getFilenameFromPath(this.previewUrl);

          this.firstFormGroup.patchValue({
            contact_visibility: profile.contact_visibility,
            email_visibility: profile.email_visibility,
            date_birth: new Date(profile.date_birth),
          });

          // HOME LOCATION
          this.countryControl1.setValue(profile.home_country);
          this.countryControl2.setValue(profile.current_location);

          this.secondFormGroup.patchValue({
            home_state: profile.home_state || '',
            current_state: profile.current_state || '',
          });
          this.summaryFormGroup.patchValue({
            summary: profile.summary || '',
          });
        }
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      }
    });
  }



  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 20;
  vertical = false;
  tickInterval = 10;

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  percentage: number = 0;
  displayPercentage: string = '0%';

  updatePercentage(): void {
    // Total fields and number of filled fields
    const fields = [this.fname, this.lname];
    const filledFields = fields.filter(field => field.trim().length > 0).length;
    // Calculate percentage
    this.percentage = (filledFields / fields.length) * 100;
    this.displayPercentage = `${this.percentage}%`;
  }



  // updateProgress(event: any) {
  //   const stepCount = event.stepper._steps.length;
  //   const currentIndex = event.selectedIndex + 1;
  //   this.progressPercentage = (currentIndex / stepCount) * 100;
  // }
  label: any;
  educationStatusOptions = [
    { value: 'graduate', label: 'Graduate' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'ongoing', label: 'Ongoing' }
  ];


  private DisplayEmail(): void {
    this.userService.getProfileByEmail().subscribe(
      (profile) => {
        // Assuming the profile contains an email property
        this.email = profile.email;
      },
      (error) => {
        console.error('Error fetching profile:', error);
      }
    );
  }

  private initializeFormGroups(): void {
    this.firstFormGroup = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      profession: ['', Validators.required],
      contact_no: ['', Validators.required],
      email: ['', Validators.required],
      contact_visibility: [false],
      email_visibility: [false],
      dob_visibility: [false],
      date_birth: ['', Validators.required],

    });
    this.secondFormGroup = this.formBuilder.group({
      // home_country: ['', Validators.required],
      // current_country: ['', Validators.required],
      home_state: ['', Validators.required],
      current_state: ['', Validators.required],
    });
    this.summaryFormGroup = this.formBuilder.group({
      summary: ['', Validators.required],

    });

    this.thirdFormGroup = this.formBuilder.group({
      skills: this.formBuilder.array([]), // Empty FormArray for skills
      education: this.formBuilder.array([]), // Empty FormArray for education
      trainings: this.formBuilder.array([]), // Empty FormArray for trainings
      seminars: this.formBuilder.array([]), // Empty FormArray for seminars
      employment: this.formBuilder.array([]), // Empty FormArray for employment
      certificates: this.formBuilder.array([]), // Empty FormArray for certificates
    });
  }


  onToggleChange(event: any, controlName: string): void {
    const toggleValue = event.checked ? 1 : 0; // 1 for Hide, 0 for Show
    this.firstFormGroup.patchValue({ [controlName]: toggleValue });
  }
  // Create a new capability FormGroup
  createCapability(): FormGroup {
    return this.formBuilder.group({
      language: ['', Validators.required],
      skills: ['', Validators.required],
    });
  }

  // Add capability to the FormArray
  addCapability(): void {
    this.capabilityArray.push(this.createCapability());
  }

  addItemToArray(arrayName: 'capability'): void {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;

    if (!formArray) {
      console.error(`FormArray "lines.${arrayName}" not found.`);
      return;
    }

    // Add a new capability item to the form array
    formArray.push(
      this.formBuilder.group({
        language: ['', Validators.required], // Adjust validators as necessary
        skills: ['', Validators.required], // Adjust validators as necessary
      })
    );
  }

  createSkills(): FormArray {
    const formData = this.passDataServices.getSkills();
    const skillsArray = this.formBuilder.array([]);

    if (Array.isArray(formData) && formData.length > 0) {
      formData.forEach((data) => {
        skillsArray.push(
          this.formBuilder.group({
            data
          })
        );
      });
    } else {
      console.warn('No skills data available from passDataServices.getData()');
      skillsArray.push(this.formBuilder.group({ skillItem: [''] }));
    }
    return skillsArray;
  }


  // Create a new education FormGroup
  createEducation(): FormArray {
    const formData = this.passDataServices.getDataEducation();
    const educationArray = this.formBuilder.array([]);

    if (Array.isArray(formData)) {
      formData.forEach((data) => {
        educationArray.push(this.formBuilder.group({
          educationItem: [data]  // For each item, create a FormControl inside a FormGroup
        }));
      });
    }
    return educationArray;
  }

  // Add education to the FormArray
  addeducation(): void {
    this.educationArray.push(this.createEducation());
  }
  addTraining(): void {
    this.trainingArray.push(this.createTraining());
  }
  addSeminar(): void {
    this.seminarArray.push(this.createSeminar());
  }
  addEmployment(): void {
    this.employmentArray.push(this.createEmployment());
  }
  addCertificate(): void {
    this.certificateArray.push(this.createCertificate());
  }

  //trainings
  createTraining(): FormGroup {
    return this.formBuilder.group({
      training_title: ['', Validators.required],
      training_provider: ['', Validators.required],
      trainingdate: ['', Validators.required],
    });
  }
  //seminar
  createSeminar(): FormGroup {
    return this.formBuilder.group({
      seminar_title: ['', Validators.required],
      seminar_provider: ['', Validators.required],
      seminardate: ['', Validators.required],
    });
  }

  //employment
  createEmployment(): FormGroup {
    return this.formBuilder.group({
      company_name: ['', Validators.required],
      position: ['', Validators.required],
      job_description: ['', Validators.required],
      date_completed: ['', Validators.required],
    });
  }
  //employment
  createCertificate(): FormGroup {
    return this.formBuilder.group({
      certificate_title: ['', Validators.required],
      certificate_provider: ['', Validators.required],
      date_completed: ['', Validators.required],
    });
  }

  // Remove capability from the FormArray
  removeItemFromArray(arrayName: 'capability', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }

  // Remove education from the FormArray
  removeItemFromArray2(arrayName: 'education', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }
  //trainings
  removeItemFromArray3(arrayName: 'training', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }
  //seminar
  removeItemFromArray4(arrayName: 'seminar', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }

  //employment
  removeItemFromArray5(arrayName: 'employment', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }
  //certificate
  removeItemFromArray6(arrayName: 'certificate', index: number) {
    const formArray = this.thirdFormGroup.get(
      `lines.${arrayName}`
    ) as FormArray;
    formArray.removeAt(index);
  }

  // Getters for the FormArrays
  get capabilityArray(): FormArray {
    return this.thirdFormGroup.get('lines.capability') as FormArray;
  }

  get educationArray(): FormArray {
    return this.thirdFormGroup.get('lines.education') as FormArray;
  }
  get trainingArray(): FormArray {
    return this.thirdFormGroup.get('lines.training') as FormArray;
  }

  get seminarArray(): FormArray {
    return this.thirdFormGroup.get('lines.seminar') as FormArray;
  }
  get employmentArray(): FormArray {
    return this.thirdFormGroup.get('lines.employment') as FormArray;
  }
  get certificateArray(): FormArray {
    return this.thirdFormGroup.get('lines.certificate') as FormArray;
  }

  fileError: string = ''; // To store validation error messages
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  filename: string = "";


  fileData: any = null;

  onUploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Please upload a valid image file (JPEG/PNG).';
        return;
      }
      this.fileError = 'Please upload a valid image file.';
      this.fileData = file.toString();
    }
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.input.files[0];
  //     this.firstFormGroup.patchValue({ photo_pic: file });
  //     this.firstFormGroup.get('photo_pic')?.updateValueAndValidity();
  //   }
  // }


  onUploadPhoto2(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.fileError = 'Please upload a valid image file.';
        return;
      }

      // Validate file size (max 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.fileError = 'File size exceeds 2MB. Please upload a smaller file.';
        return;
      }

      // Valid file
      this.selectedFile = file;
      this.filename = file.name;
      this.fileError = '';
      this.isImageSelected = true;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.validateAge();
      };
      reader.readAsDataURL(file);
    }
  }

  resetPhoto(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear file input
    }

    this.selectedFile = null;
    this.previewUrl = '';
    this.filename = '';
    this.fileError = '';
    this.isImageSelected = false;
  }

  clearPreview(): void {
    this.previewUrl = null;
    this.selectedFile = null;
  }


  loading: boolean = false;
  success: boolean = true;


  isFormArray(value: any): boolean {
    return value instanceof FormArray;
  }


  refreshHomePage() {
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }



  //basic info 

  onClickNew(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddLanguageUIComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //  this.getRoles(); // Refresh the table after dialog closure
      }
    });
  }

  viewlanguage(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(ViewLanguageUIComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //  this.getRoles(); // Refresh the table after dialog closure
      }
    });
  }
  AddSkills(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddSkillsUIComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSkills();
      }
    });
  }

  educationList: any[] = [];
  AddEducationxxx(): void {
    const dialogRef = this.dialog.open(AddEducationUIComponent, {
      width: '600px',
      data: { educationList: this.educationList }, // Pass current education list if needed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the education list with the data returned from the dialog
        this.educationList = result;
      }
    });
  }

  AddEducation(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    const dialogRef = this.dialog.open(AddEducationUIComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((formResult) => {
      if (formResult) {
        this.LoadEducationData();
      }
    });
  }

  AddTrainings(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddTrainingsUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTrainingData();
      }
    });
  }


  AddSeminar(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddSeminarUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSeminarData();
      }
    });
  }



  AddEmployment(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddEmploymentUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkExperienceData();
      }
    });
  }

  AddCertificate(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(AddCertificateUiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCertificateData();
      }
    });
  }

  lines: any = [];

  saveProfile(): void {
    if (this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      console.warn('Form is invalid:', this.firstFormGroup.value);
      return;
    }
    if (this.secondFormGroup.invalid) {
      this.secondFormGroup.markAllAsTouched();
      console.warn('Form is invalid:', this.secondFormGroup.value);
      return;
    }

    // Log the form values to console
    const formValues = this.firstFormGroup.value;
    const formValues2 = this.secondFormGroup.value;
    const formValues3 = this.summaryFormGroup.value;



    const formData = new FormData();
    formData.append('fname', formValues.fname);
    formData.append('lname', formValues.lname);
    formData.append('profession', formValues.profession);
    formData.append('contact_no', formValues.contact_no);
    formData.append('email', formValues.email);
    formData.append('contact_visibility', formValues.contact_visibility ? '1' : '0');
    formData.append('email_visibility', formValues.email_visibility ? '1' : '0');
    formData.append('dob_visibility', formValues.dob_visibility ? '1' : '0');
    const formattedDate = this.datePipe.transform(formValues.date_birth, 'MM/dd/yyyy');
    formData.append('date_birth', formattedDate || '');

    if (this.selectedFile) {
      formData.append('photo_pic', this.selectedFile);
    }

    formData.append('home_country', this.countryControl1.value);
    formData.append('home_state', formValues2.home_state);

    formData.append('current_location', this.countryControl2.value);
    formData.append('current_state', formValues2.current_state);
    formData.append('summary', formValues3.summary);

    for (const pair of (formData as any).entries()) {
      console.log(pair[0], pair[1]);
    }

    this.cvService.saveProfile(formData).subscribe({
      next: (res) => {
        console.log(res.success);
        if (res.success) {
          this.loadProfile1();
        }
        else {
          this.notificationService.toastrError(res.message);
        }
      },
      error: (err) => {
        console.error('❌ Save failed:', err);
      }
    });
  }

  previewAndFinish2() {
    this.router.navigate(['/home']);
  }

  previewAndFinish() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '900px';
    dialogConfig.height = '600px';
    const dialogRef = this.dialog.open(PrintCVComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.previewAndFinish2();
      }
    });
  }
  View() {
    this.loadSeminarData();
  }
  ViewEducationData() {
  }
  LoadEducationData(): void {
    this.loadEducationData();
  }

}