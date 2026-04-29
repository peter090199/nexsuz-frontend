import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { JobPostingUIComponent } from 'src/app/ComponentSharedUI/job-posting-ui/job-posting-ui.component';
import { JobPostingService } from 'src/app/services/Jobs/job-posting.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { Router } from '@angular/router';
import { JobViewDetailsComponent } from './job-view-details/job-view-details.component';
import { PostingJobComponent } from 'src/app/ComponentSharedUI/posting-job/posting-job.component';
import { ListAppliedJobsComponent } from '../jobs/list-applied-jobs/list-applied-jobs.component';
import { SharedService } from 'src/app/services/SharedServices/shared.service';

@Component({
  selector: 'app-job-posting',
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.css']
})
export class JobPostingComponent implements OnInit {
  searchKey: string = '';
  placeHolder: string = 'Search';
  isLoading: boolean = false;

  // Default (all fields individually)
  defaultColumns: string[] = [
    'id',
    'job_name',
    'job_position',
    'job_description',
    'job_about',
    'qualification',
    'work_type',
    'comp_name',
    'comp_description',
    'job_image',
    'created_at',
    'updated_at',
    'actions'
  ];

  // Merged view
  mergedColumns: string[] = [
    'job_info',
    'job_position',
    'company_info',
    'work_type',
    'job_image',
    'actions'
  ];

  // Currently active set
  displayedColumns: string[] = this.defaultColumns;

  dataSource = new MatTableDataSource<any>([]);
  jobPosting: any[] = [];
  questions: any[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  success: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private jobServices: JobPostingService, private router: Router,
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.getJobPosting();
    this.toggleColumns();
  }

  // 🔄 Toggle between default & merged
  toggleColumns() {
    if (this.displayedColumns === this.defaultColumns) {
      this.displayedColumns = this.mergedColumns;
    } else {
      //   this.displayedColumns = this.defaultColumns;
    }
  }

  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLocaleLowerCase();
  }

  clearSearch() {
    this.searchKey = '';
    this.applyFilter();
  }

  jobPosting2() {
    this.router.navigateByUrl("/posting-job")
  }

  onClickNew(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '800px';

    const dialogRef = this.dialog.open(JobPostingUIComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getJobPosting();
      }
    });
  }

  async getJobPosting(): Promise<void> {
    try {
      this.isLoading = true;

      const res = await firstValueFrom(this.jobServices.getJobPosting());

      if (res.success) {
        this.success = true;

        this.jobPosting = res.jobs.map((job: any) => {
          const relatedQuestions = res.questions.filter(
            (q: any) => q.transNo === job.transNo
          );

          return {
            ...job,
            job_image: this.sharedService.cleanImageUrl(job.job_image),
            questions: relatedQuestions
          };  
        });

        this.dataSource.data = this.jobPosting;
      } else {
        this.success = false;
      }

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  
  viewCandidates(user: any) {

  }

  openCandidates(job: any): void {
    const dialogRef = this.dialog.open(ListAppliedJobsComponent, {
      width: '1400px',
      data: job
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getJobPosting();
    });
  }


  delete2(job: any): void {
    this.notificationsService.popupWarning(
      job.job_name,
      ' Are you sure to delete this job posting?'
    ).then((result) => {
      if (result.value) {
        this.jobServices.deleteJobPosting(job.transNo).subscribe({
          next: (res) => {
            if (res.success === true) {
              this.notificationsService.toastrSuccess(res.message);
            } else {
              this.notificationsService.toastrError(res.message);
            }
            this.getJobPosting();
          },
          error: (error) => {
            this.notificationsService.toastrError(error.error);
          }
        });
      }
    });
  }


  createJobPosting(): void {
    const dialogRef = this.dialog.open(JobPostingUIComponent, {
      width: '900px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getJobPosting();
      }
    });
  }


  edit(job: any): void {
    const dialogRef = this.dialog.open(JobPostingUIComponent, {
      width: '1000px',
      data: job
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getJobPosting();
      }
    });
  }


  viewDetails(data: any): void {
    console.log('Job details:', data);

    const dialogRef = this.dialog.open(JobViewDetailsComponent, {
      width: '800px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getJobPosting();
      }
    });
  }



}
