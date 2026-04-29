import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { JobListService } from 'src/app/services/Jobs/job-list.service';
import { SharedService } from 'src/app/services/SharedServices/shared.service';
import { environment } from 'src/environments/environment';

interface Job {
  job_id: number;
  transNo: string;
  code: number;
  company: string;
  role_code: string;
  job_name: string;
  location: string;
  benefits: string;
  job_position: string;
  job_description: string;
  job_about: string;
  qualification: string;
  work_type: string;
  job_image?: string;
  fullname: string;
  created_at: string;
  updated_at: string;
  recordstatus: string;
  is_online: number;
  // Add more fields if needed
}

@Component({
  selector: 'app-jobs-client',
  templateUrl: './jobs-client.component.html',
  styleUrls: ['./jobs-client.component.css']
})
export class JobsClientComponent implements OnInit {

  jobs: Job[] = [];
  isLoading: boolean = false;
  selectedTabIndex: number = 2;
  code: any;
  currentUserCode: any;



  constructor(private jobService: JobListService, private route: ActivatedRoute,
    private authServiceCode: AuthService,private sharedService:SharedService
  ) { }

  getJobImageUrl(imagePath?: string): string {
    if (!imagePath) return 'assets/images/default-job.png';
    const publicPath = imagePath.replace(/^\/storage\/app\/public/, '/storage');
    return publicPath;
  }


  ngOnInit(): void {
    this.currentUserCode = this.authServiceCode.getAuthCode();
    console.log(this.currentUserCode)
    this.code = this.route.snapshot.paramMap.get('code') || window.location.href.split('/').pop() || '';
    this.loadTabData(this.selectedTabIndex);

  }

  private loadTabData(index: number): void {
    if (index === 2) {
      this.getActiveJobsByCode();
    }
  }



  async getActiveJobsByCode(): Promise<void> {
    try {
      this.isLoading = true;

      const res = await firstValueFrom(
        this.jobService.getActiveJobsByCode(this.code)
      );

      if (res?.success) {
        this.jobs = res.data.map((job: any) => ({
          ...job,
          job_image: this.sharedService.cleanImageUrl(job.job_image)
        }));
      }

    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openJobApply(job: Job): void {
    if (job.work_type && job.work_type.toLowerCase() === 'remote') {
      // Optional: handle remote jobs differently
    }
    if (job.job_image) {
      // Optional: preview image
    }
    // Open application URL if available
    const applyUrl = (job as any).applyUrl; // if backend provides
    if (applyUrl) {
      window.open(applyUrl, '_blank');
    }
  }

}
