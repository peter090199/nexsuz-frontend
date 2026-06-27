import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { JobListService } from 'src/app/services/Jobs/job-list.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { SharedService } from 'src/app/services/SharedServices/shared.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { AppliedStatusDialogComponent } from '../jobs/applied-status-dialog/applied-status-dialog.component';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';

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
  saved = false;

  currentUserCode: string | null = null;

  skeletonRows = Array.from({ length: 5 });

  constructor(
    private jobListServices: JobListService, public feature: FeatureService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private alert: NotificationsService,
    private sharedService: SharedService,
    public sharedRoutines: SharedRoutinesService
  ) { }

  /* =========================
     INIT
  ========================= */
  async ngOnInit(): Promise<void> {
    this.currentUserCode = this.authService.getAuthCode();

    await this.getJobPosting();

    this.route.paramMap.subscribe(async params => {
      const transNo = params.get('transNo');

      if (!transNo) return;

      this.selectedJob =
        this.jobs.find(j => String(j.transNo) === String(transNo)) || null;

      if (this.selectedJob) {
        await this.loadAppliedStatus(this.selectedJob);
      }
    });
  }

  /* =========================
     FETCH JOBS
  ========================= */
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

    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  /* =========================
     STATUS LOAD
  ========================= */
  async loadAppliedStatus(job: any): Promise<void> {
    if (!job?.transNo) return;

    try {
      const res = await firstValueFrom(
        this.jobListServices.getAppliedStatus(job.transNo)
      );

      const status =
        res?.success && res?.data?.length
          ? res.data[0].applied_status
          : 'default';

      job.applied_status = status;

      // Force Angular change detection
      this.selectedJob = {
        ...job,
        applied_status: status
      };

    } catch (err) {
      console.error(err);

      this.selectedJob = {
        ...job,
        applied_status: 'default'
      };
    }
  }

  /* =========================
     BUTTON STATUS
  ========================= */
  getButtonStatus(job: any): string {
    if (!job) return 'default';

    if (job.code === this.currentUserCode) {
      return 'applied_active';
    }

    return job.applied_status || 'default';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'applied_active':
        return 'hourglass_top';

      case 'review':
        return 'search';

      case 'interview':
        return 'event';

      case 'approved':
        return 'check_circle';

      case 'reject':
        return 'cancel';

      default:
        return 'send';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'applied_active':
        return 'Applied';

      case 'review':
        return 'Under Review';

      case 'interview':
        return 'Interview Scheduled';

      case 'approved':
        return 'Hired';

      case 'reject':
        return 'Rejected';

      default:
        return 'Apply Now';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'applied_active':
        return '#f4895e';

      case 'review':
        return '#ffb300';

      case 'interview':
        return '#6a5acd'; // purple (interview)

      case 'approved':
        return '#388e3c';

      case 'reject':
        return '#d32f2f';

      default:
        return '#3071e0';
    }
  }
  /* =========================
     APPLY CLICK
  ========================= */
  onApplyClick(job: any): void {
    // ❌ FEATURE CHECK (PLAN RESTRICTION)
    if (!this.feature.can('APPLY_JOBS')) {
      this.sharedRoutines.openUpgradeModal();
      return;
    }

    const status = this.getButtonStatus(job);

    if (status === 'default') {
      this.router.navigate([
        '/' + this.sharedRoutines.getRole() + '/apply-job',
        job.transNo
      ]);
      return;
    }

    this.openAppliedStatusDialog(job);
  }

  openAppliedStatusDialog(job: any): void {
    const dialogRef = this.dialog.open(AppliedStatusDialogComponent, {
      width: '460px',
      data: job
    });

    dialogRef.afterClosed().subscribe(async (res) => {
      if (res) {
        await this.getJobPosting();

        const updated = this.jobs.find(
          x => x.transNo === this.selectedJob?.transNo
        );

        if (updated) {
          await this.loadAppliedStatus(updated);
        }
      }
    });
  }

  /* =========================
     SELECT JOB
  ========================= */
  async selectJob(job: any): Promise<void> {

    this.router.navigate([
      '/' + this.sharedRoutines.getRole() + '/recommended-jobs',
      job.transNo
    ]);

    // Copy the object so Angular detects the change
    this.selectedJob = { ...job };

    // Load the latest application status
    await this.loadAppliedStatus(this.selectedJob);
  }
  /* =========================
     UI ACTIONS
  ========================= */
  closeSidebar(): void {
    this.selectedJob = null;
  }

  toggleHeart(): void {
    this.saved = !this.saved;
  }
}