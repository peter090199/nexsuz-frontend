import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { JobPostingUIComponent } from 'src/app/ComponentSharedUI/job-posting-ui/job-posting-ui.component';
import { AppiedListJobService } from '../../../services/Jobs/appied-list-job.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { Router } from '@angular/router';
import { AppliedStatusService } from 'src/app/services/NotificationsApp/applied-status.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserResumeUIComponent } from 'src/app/ComponentSharedUI/Resume/user-resume-ui/user-resume-ui.component';
import { SharedService } from 'src/app/services/SharedServices/shared.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';

@Component({
  selector: 'app-list-applied-jobs',
  templateUrl: './list-applied-jobs.component.html',
  styleUrls: ['./list-applied-jobs.component.css']
})
export class ListAppliedJobsComponent implements OnInit, AfterViewInit {
  searchKey = '';
  placeHolder = 'Search';

  // Loading state per table
  isLoadingApply = false;
  isLoadingOngoing = false;
  isLoadingFinished = false;
  isLoadingReject = false;
  isLoadingInterview = false;


  displayedColumns: string[] = [];
  dataSourceApply = new MatTableDataSource<any>([]);
  dataSourceOngoing = new MatTableDataSource<any>([]);
  dataSourceInterview = new MatTableDataSource<any>([]);
  dataSourceFinished = new MatTableDataSource<any>([]);
  dataSourceReject = new MatTableDataSource<any>([]);


  pageSizeOptions: number[] = [5, 10, 25, 100];
  success = false;

  @ViewChild('paginatorApply') paginatorApply!: MatPaginator;
  @ViewChild('paginatorOngoing') paginatorOngoing!: MatPaginator;
  @ViewChild('paginatorInterview') paginatorInterview!: MatPaginator;
  @ViewChild('paginatorFinished') paginatorFinished!: MatPaginator;
  @ViewChild('paginatorReject') paginatorReject!: MatPaginator;

  @ViewChild('sortApply') sortApply!: MatSort;
  @ViewChild('sortOngoing') sortOngoing!: MatSort;
  @ViewChild('sortInterview') sortInterview!: MatSort;
  @ViewChild('sortFinished') sortFinished!: MatSort;
  @ViewChild('sortReject') sortReject!: MatSort;
  applicantCode!: string;
  fullname!: string;
  resumes: any[] = [];
  previewFile: any = null;
  transNo: any;
  profile: any;



  constructor(
    private jobServices: AppiedListJobService,
    private router: Router,
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    private appliedService: AppliedStatusService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sharedService: SharedRoutinesService,
    private profileService: ProfileService,
    @Optional() private dialogRef: MatDialogRef<ListAppliedJobsComponent>
  ) {
    this.transNo = data.transNo;
    console.log(this.transNo)
  }

  columnDefs = [
    { columnDef: 'transNo', header: 'CandidateNo', cell: (job: any) => `${job.code}` },
    { columnDef: 'fullname', header: 'Fullname', cell: (job: any) => job },
    { columnDef: 'job_name', header: 'Job Name', cell: (job: any) => `${job.job_name}` },
    { columnDef: 'email', header: 'Email', cell: (job: any) => `${job.email}` },
    { columnDef: 'phone_number', header: 'Phone', cell: (job: any) => `+${job.country_code} ${job.phone_number}` },
    { columnDef: 'applied_status', header: 'Status', cell: (job: any) => `${job.applied_status}` },
    { columnDef: 'actions', header: 'Actions', cell: () => '' }
  ];

  ngOnInit(): void {
    this.displayedColumns = this.columnDefs.map(c => c.columnDef);
    this.getJobPosting();
  }

  ngAfterViewInit(): void {
    this.dataSourceApply.paginator = this.paginatorApply;
    this.dataSourceApply.sort = this.sortApply;

    this.dataSourceOngoing.paginator = this.paginatorOngoing;
    this.dataSourceOngoing.sort = this.sortOngoing;

    this.dataSourceInterview.paginator = this.paginatorInterview;
    this.dataSourceInterview.sort = this.sortInterview;

    this.dataSourceFinished.paginator = this.paginatorFinished;
    this.dataSourceFinished.sort = this.sortFinished;

    this.dataSourceReject.paginator = this.paginatorReject;
    this.dataSourceReject.sort = this.sortReject;
  }


  // getsettingsUrl(): string {
  //   return this.sharedService.getSettingsUrl(this.profile);
  // }

  // getProfileUrl(code:any): string {
  //   console.log(code)
  //   return this.sharedService.getProfileUrl(code);
  // }

  getJobProfileLink(job: any, roleCode: string): string[] {
    if (!job?.code) return ['/profile']; // fallback

    switch (roleCode) {
      case 'DEF-CLIENT':
        return ['/recruiter/profile', job.code]; // normal user profile
      case 'DEF-MASTERADMIN':
        return ['/masteradmin/profile', job.code];
      case 'DEF-USERS':
        return ['/recruiter/profile', job.code]; // recruiter profile
      default:
        return ['/profile', job.code]; // fallback
    }
  }

  async getJobPosting(): Promise<void> {
    try {
      // Start loading all three tables
      this.isLoadingApply = true;
      this.isLoadingOngoing = true;
      this.isLoadingFinished = true;
      this.isLoadingReject = true;

      const res = await firstValueFrom(this.jobServices.getAppliedJobByTransNo(this.transNo));

      if (res.success) {
        const jobs = res.data || [];
        this.dataSourceApply.data = jobs.filter((j: any) => j.applied_status === 'applied_active');
        this.dataSourceOngoing.data = jobs.filter((j: any) => j.applied_status === 'review');
        this.dataSourceInterview.data = jobs.filter((j: any) => j.applied_status.toLowerCase() === 'interview');
        this.dataSourceFinished.data = jobs.filter((j: any) => j.applied_status.toLowerCase() === 'approved');
        this.dataSourceReject.data = jobs.filter((j: any) => j.applied_status.toLowerCase() === 'reject');
      } else {
        this.dataSourceApply.data = [];
        this.dataSourceOngoing.data = [];
        this.dataSourceInterview.data = [];
        this.dataSourceFinished.data = [];
        this.dataSourceReject.data = [];
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      this.dataSourceApply.data = [];
      this.dataSourceOngoing.data = [];
      this.dataSourceInterview.data = [];
      this.dataSourceFinished.data = [];
      this.dataSourceReject.data = [];
    } finally {
      // ✅ stop loading individually
      this.isLoadingApply = false;
      this.isLoadingOngoing = false;
      this.isLoadingInterview = false;
      this.isLoadingFinished = false;
      this.isLoadingReject = false;
    }
  }

  applyFilter(): void {
    const filterValue = this.searchKey.trim().toLowerCase();

    const filterFn = (data: any, filter: string) => {
      const str = (
        data.fullname +
        data.job_name +
        data.email +
        data.phone_number +
        data.applied_status
      ).toLowerCase();
      return str.includes(filter);
    };

    this.dataSourceApply.filterPredicate = filterFn;
    this.dataSourceOngoing.filterPredicate = filterFn;
    this.dataSourceFinished.filterPredicate = filterFn;

    this.dataSourceApply.filter = filterValue;
    this.dataSourceOngoing.filter = filterValue;
    this.dataSourceFinished.filter = filterValue;
  }

  clearSearch(): void {
    this.searchKey = '';
    this.applyFilter();
  }


  deleteJob(job: any) {
    console.log(job.transNo)
  }

  // markStatus(job: any, status: string) {
  //   if (!job || !job.transNo) {
  //     this.notificationsService.toastrError("Missing transNo.!");
  //     return;
  //   }

  //   this.appliedService.updateAppliedStatus(job.transNo, status)
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res.success) {
  //           this.notificationsService.toastrInfo(res.message);
  //         } else {
  //           this.notificationsService.toastrError(res.message);
  //         }
  //         this.getJobPosting();
  //       },
  //       error: () => {
  //         this.notificationsService.toastrError("Failed to update status.");
  //       }
  //     });
  // }

  markStatus(job: any, status: string): void {
    if (!job || !job.transNo) {
      this.notificationsService.toastrError("Missing transNo!");
      return;
    }

    this.notificationsService
      .popupWarning(job.fullname, `Are you sure you want to mark this job as "${status}"?`)
      .then((result) => {
        if (result.value) {
          this.appliedService.updateAppliedStatus(job.applied_id, status).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.notificationsService.toastrInfo(res.message);
              } else {
                this.notificationsService.toastrError(res.message);
              }
              this.getJobPosting();
            },
            error: () => {
              this.notificationsService.toastrError("Failed to update status.");
            },
          });
        }
      });
  }


  markStatusInterview(job: any, status: string): void {
    if (!job || !job.transNo) {
      this.notificationsService.toastrError("Missing transNo!");
      return;
    }

    this.notificationsService
      .popupWarning(job.fullname, `Are you sure you want to schedule an "${status}" for this candidate?`)
      .then((result) => {
        if (result.value) {
          this.appliedService.updateAppliedStatus(job.applied_id, status).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.notificationsService.toastrInfo(res.message);
              } else {
                this.notificationsService.toastrError(res.message);
              }
              this.getJobPosting();
            },
            error: () => {
              this.notificationsService.toastrError("Failed to update status.");
            },
          });
        }
      });
  }

  markFinished(job: any) {
    console.log(job.transNo)
  }

  selectedJob: any = null;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('menuTrigger', { read: ElementRef }) triggerElement!: ElementRef;
  /** RIGHT CLICK ON ROW */
  onRightClick(event: MouseEvent, job: any) {
    event.preventDefault();
    this.selectedJob = job;

    // Move hidden trigger to cursor location
    const triggerEl = this.triggerElement.nativeElement;
    triggerEl.style.left = event.clientX + 'px';
    triggerEl.style.top = event.clientY + 'px';

    // Open the menu
    this.menuTrigger.openMenu();
  }

  /** VIEW RESUME FUNCTION */
  openResumeDialog(resume: any): void {
    const dialogRef = this.dialog.open(UserResumeUIComponent, {
      width: '2000px',
      data: resume
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getJobPosting();
    });
  }

}
