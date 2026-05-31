import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/services/SharedServices/shared.service';

@Component({
  selector: 'app-user-resume-ui',
  templateUrl: './user-resume-ui.component.html',
  styleUrls: ['./user-resume-ui.component.css']
})
export class UserResumeUIComponent implements OnInit {

  gallery: any[] = [];
  selectedResume: any = null;
  user: any;
  radius = 45;
  // ✅ SCORE VARIABLES
  score = 0;
  totalQuestions = 0;
  percentage = 0;
  strokeDashoffset = 0;
  circumference = 2 * Math.PI * this.radius;
  transNo: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserResumeUIComponent>,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.transNo = this.data.transNo;
    this.loadApplicationScore();

    // this.sharedService.getApplicationScore(this.transNo).subscribe({
    //   next: (res: any) => {
    //     // Map the user info
    //     this.user = { ...this.data, ...res.user };

    //     // Map the answers (ensure numeric_score is handled)
    //     this.data.answers = res.answers;

    //     // Handle Resumes if returned by API, otherwise fallback to injected data
    //     const resumes = res.resumes || this.data?.resumes || [];
    //     this.gallery = resumes.map((r: any) => {
    //       const url = this.sharedService.cleanImageUrl(r.url);
    //       return {
    //         ...r,
    //         url,
    //         safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url)
    //       };
    //     });
    //     this.selectedResume = this.gallery.length ? this.gallery[0] : null;

    //     // 3. Perform Scoring Calculations
    //     this.totalQuestions = res.summary.total_possible;
    //     this.score = res.summary.total_score;

    //     this.calculateScore();
    //   },
    //   error: (err) => {
    //     console.error('Error fetching score data:', err);
    //   }
    // });
  }


  yesScore = 0;
  noScore = 0;
  maybeScore = 0;
  totalScore = 0;
  calculateScorexx(): void {
    const answers = this.data?.answers || [];

    const safeText = (a: any) => (a?.answer_text || '').toLowerCase();

    // YES / NO / MAYBE breakdown
    this.yesScore = answers.filter((a: any) => safeText(a) === 'yes').length;
    this.noScore = answers.filter((a: any) => safeText(a) === 'no').length;
    this.maybeScore = answers.filter((a: any) => safeText(a) === 'maybe').length;

    // ✅ TOTAL SCORE (BASED ON numeric_score)
    this.totalScore = answers.reduce((sum: number, a: { numeric_score: number; }) => {
      return sum + (a.numeric_score || 0);
    }, 0);

    // OPTIONAL: total questions
    this.totalQuestions = answers.length;

    // percentage
    this.percentage = this.totalQuestions
      ? Math.round((this.totalScore / this.totalQuestions) * 100)
      : 0;
  }




  get yesPercent(): number {
    return this.totalScore ? Math.round((this.yesScore / this.totalScore) * 100) : 0;
  }

  get noPercent(): number {
    return this.totalScore ? Math.round((this.noScore / this.totalScore) * 100) : 0;
  }

  get maybePercent(): number {
    return this.totalScore ? Math.round((this.maybeScore / this.totalScore) * 100) : 0;
  }


  flip = false;

  get percentages(): number {
    return Math.round((this.score / this.totalQuestions) * 100);
  }

  loadApplicationScore(): void {
    this.sharedService.getApplicationScore(this.transNo).subscribe({
      next: (res: any) => {

        // Map user info
        this.user = { ...this.data, ...res.user };

        // Map answers
        this.data.answers = res.answers;

        // Handle resumes (API or fallback)
        const resumes = res.resumes || this.data?.resumes || [];

        this.gallery = resumes.map((r: any) => {
          const url = this.sharedService.cleanImageUrl(r.url);
          return {
            ...r,
            url,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url)
          };
        });

        this.selectedResume = this.gallery.length ? this.gallery[0] : null;

        // Scoring
        this.totalQuestions = res.summary?.total_possible || 0;
        this.score = res.summary?.total_score || 0;

        this.calculateScore();
      },
      error: (err) => {
        console.error('Error fetching score data:', err);
      }
    });
  }


  // ✅ SCORE CIRCLE CALCULATION
  calculateScore(): void {
    if (!this.totalQuestions) return;

    // Calculate percentage based on the numeric sum
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);

    const progress = this.percentage / 100;
    this.strokeDashoffset = this.circumference - this.circumference * progress;
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'review':
        return 'status-review';
      case 'applied_active':
        return 'status-active';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isPDF(url: string): boolean {
    return /\.pdf$/i.test(url);
  }

  setSelected(item: any): void {
    this.selectedResume = item;
  }

  close(): void {
    this.dialogRef.close();
  }

  downloadPDF(url: string): void {
    const fileName = url.split('/').pop() || 'resume.pdf';

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}