import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { JobListService } from 'src/app/services/Jobs/job-list.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { ImagesService } from 'src/app/services/images/images.service';

interface Job {
  job_name: string;
  job_position: string;
  location: string;
  currency?: string;
  min_salary?: number;
  max_salary?: number;
  work_type: string;
  typeClass: string;
  image: string;
}

@Component({
  selector: 'app-jobs-client',
  templateUrl: './jobs-client.component.html',
  styleUrls: ['./jobs-client.component.scss']
})
export class JobsClientComponent implements OnInit {
  searchText = '';
  jobs: any[] = [];
  filteredJobs: any[] = [];
  isLoading = false;
  code: any;
  currentUserCode: any;
  placeholderImg = 'assets/images/logo2.png';

  constructor(
    private jobService: JobListService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private sharedService: ImagesService,
    private sharedRoutineService: SharedRoutinesService
  ) { }

  ngOnInit(): void {
    this.currentUserCode = this.authService.getAuthCode();
    this.code = this.route.snapshot.paramMap.get('code') || window.location.href.split('/').pop() || '';
    this.getActiveJobsByCode();
  }

  async getActiveJobsByCode(): Promise<void> {
    try {
      this.isLoading = true;
      const res = await firstValueFrom(this.jobService.getActiveJobsByCode(this.code));

      if (res?.success) {
        this.jobs = res.data.map((job: any) => ({
          ...job,
          job_name: job.job_name ?? 'Untitled Job',
          location: job.location ?? 'Not specified',
          work_type: job.work_type,
          image: job.job_image ? this.sharedService.cleanImageUrl(job.job_image) : this.placeholderImg,
          typeClass: this.getTypeClass(job.work_type)
        }));
        this.filteredJobs = [...this.jobs];
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    const keyword = (this.searchText ?? '').trim().toLowerCase();
    this.filteredJobs = !keyword
      ? [...this.jobs]
      : this.jobs.filter(job =>
        job.job_name?.toLowerCase().includes(keyword) ||
        job.job_position?.toLowerCase().includes(keyword) ||
        job.location?.toLowerCase().includes(keyword) ||
        job.work_type?.toLowerCase().includes(keyword)
      );
  }

  onEnter(): void {
    this.onSearch();
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredJobs = [...this.jobs];
  }

  selectJob(job: Job): void {
    this.searchText = job.job_name ?? '';
    this.onSearch();
  }

  formatSalary(job: Job): string {
    if (job.min_salary == null && job.max_salary == null) return 'Salary not specified';
    const symbol = this.getCurrencySymbol(job.currency);
    return `${symbol}${job.min_salary ?? ''} - ${symbol}${job.max_salary ?? ''}`;
  }

  openJobApply(job: any): void {
    this.router.navigate(
      [...this.sharedRoutineService.getApplyJobRoute(), job.transNo],
      { queryParams: { code: this.currentUserCode } }
    );
  }

  private getTypeClass(type?: string): string {
    if (!type) return 'default';
    const normalized = type.toLowerCase().trim();

    if (normalized.includes('remote') || normalized.includes('home')) return 'remote';
    if (normalized.includes('hybrid')) return 'hybrid';
    if (normalized.includes('onsite') || normalized.includes('on-site') || normalized.includes('office')) return 'onsite';
    if (normalized.includes('freelance') || normalized.includes('contract')) return 'freelance';
    if (normalized.includes('part')) return 'parttime';
    if (normalized.includes('full')) return 'fulltime';

    return 'default'; // fallback for anything unmatched
  }

  private getCurrencySymbol(code?: string): string {
    const map: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return code ? (map[code] ?? code + ' ') : '';
  }
}