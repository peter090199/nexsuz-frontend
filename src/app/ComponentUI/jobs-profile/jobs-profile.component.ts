import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { JobListService } from 'src/app/services/Jobs/job-list.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppliedStatusDialogComponent } from '../jobs/applied-status-dialog/applied-status-dialog.component';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { SharedService } from 'src/app/services/SharedServices/shared.service';

@Component({
  selector: 'app-jobs-profile',
  templateUrl: './jobs-profile.component.html',
  styleUrls: ['./jobs-profile.component.css']
})
export class JobsProfileComponent implements OnInit {

  jobs: any[] = [];
  savedJobs: any[] = [];
  selectedJob: any = null;

  isLoading = false;
  success = false;
  saved = false;

  currentUserCode: string | null = null;

  recentSearch = {
    term: 'software engineer',
    count: 139,
    location: 'Calgary, Alberta, Canada'
  };

  skeletonRows = Array.from({ length: 5 });

  constructor(
    private jobListServices: JobListService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog, private alert: NotificationsService,
    private sharedService:SharedService
  ) { }

  /* ==============================
     INIT
  ============================== */
  async ngOnInit(): Promise<void> {
    this.currentUserCode = this.authService.getAuthCode();

    // Load jobs first
    await this.getJobPosting();

    // Auto-load transNo whenever route changes
    this.route.paramMap.subscribe(async params => {
      const transNo = params.get('transNo');

      if (transNo) {
        this.selectedJob =
          this.jobs.find(job => String(job.transNo) === String(transNo)) || null;

        if (this.selectedJob) {
          await this.loadAppliedStatus(this.selectedJob);
        }
      }
    });
  }

  // async ngOnInit(): Promise<void> {
  //   this.currentUserCode = this.authService.getAuthCode();

  //   await this.getJobPosting();

  //   const transNo = this.route.snapshot.paramMap.get('transNo');
  //   if (transNo) {
  //     this.selectedJob = this.jobs.find(job => job.transNo == transNo) || null;
  //     await this.loadAppliedStatus(this.selectedJob);
  //   }
  // }

  /* ==============================
     JOB FETCHING
  ============================== */
  async getJobPosting(): Promise<void> {
    try {
      this.isLoading = true;

      const res = await firstValueFrom(this.jobListServices.getActiveJobs());

      if (res?.success) {
        this.jobs = res.data.map((job: any) => ({
          ...job,
          applied_status: 'default',
          job_image: this.sharedService.cleanImageUrl(job.job_image)
        }));
      }

    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      this.isLoading = false;
    }
  }


  async loadAppliedStatus(job: any): Promise<void> {
    if (!job?.transNo) return;

    try {
      const res = await firstValueFrom(
        this.jobListServices.getAppliedStatus(job.transNo)
      );

      if (res?.success === true && Array.isArray(res.data) && res.data.length) {
        job.applied_status = res.data[0].applied_status || 'default';
      } else {
        job.applied_status = 'default';
      }

      this.selectedJob = { ...job };

    } catch (error) {
      console.error('Applied status error:', error);
      job.applied_status = 'default';
    }
  }



  /* ==============================
     BUTTON STATUS HELPERS
  ============================== */
  getButtonStatus(job: any): string {
    if (!job) return 'default';
    if (job.code === this.currentUserCode) return 'applied_active';
    return job.applied_status;
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'applied_active':
      case 'review':
        return 'hourglass_top';
      case 'approved':
        return 'check_circle';
      case 'reject':
        return 'close';
      default:
        return 'send';
    }
  }

  getStatusText(status?: string): string {
    switch (status) {
      case 'applied_active': return 'View Status';
      case 'review': return 'View Status';
      case 'approved': return 'View Status';
      case 'reject': return 'View Status';
      default: return 'Apply Now';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'applied_active': return '#f4895eff';
      case 'review': return '#ffb300';
      case 'approved': return '#388e3c';
      case 'reject': return '#d32f2f';
      default: return '#3071e0';
    }
  }

  isButtonDisabled(status: string): boolean {
    return status === 'review' || status === 'approved' || status === 'reject';
  }

  /* ==============================
     APPLY BUTTON ACTION
  ============================== */
  onApplyClick(job: any): void {
    console.log(job)
    // const status = this.getButtonStatus(job);
    if (job.applied_status == 'default') {
      this.router.navigate(['/apply-job', job.transNo]);
      return;
    }
    this.openAppliedStatusDialog(job);
  }


  openAppliedStatusDialog(job: any): void {
    const dialogRef = this.dialog.open(AppliedStatusDialogComponent, {
      width: '460px',
      data: job
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getJobPosting();
    });
  }

  /* ==============================
     JOB SELECTION & NAV
  ============================== */
  async selectJob(job: any): Promise<void> {
    this.selectedJob = job;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/recommended-jobs', job.transNo]);
    await this.loadAppliedStatus(job);
  }

  goToJob(job: any): void {
    this.router.navigate(['/recommended-jobs', job.transNo]);
    this.selectedJob = job;
  }

  closeSidebar(): void {
    this.selectedJob = null;
  }

  /* ==============================
     SAVE JOBS
  ============================== */
  toggleSaveJob(job: any): void {
    if (!job) return;

    const index = this.savedJobs.findIndex(j => j.transNo === job.transNo);

    if (index === -1) {
      this.savedJobs.push(job);
      this.selectedJob = job;
    } else {
      this.savedJobs.splice(index, 1);
      if (this.selectedJob?.transNo === job.transNo) {
        this.selectedJob = null;
      }
    }
  }

  toggleHeart(): void {
    this.saved = !this.saved;
  }

  clearSearches(): void {
    this.recentSearch = { term: '', count: 0, location: '' };
  }

  removeJob(job: any): void {
    this.jobs = this.jobs.filter(j => j.transNo !== job.transNo);
    if (this.selectedJob?.transNo === job.transNo) {
      this.selectedJob = null;
    }
  }
}
