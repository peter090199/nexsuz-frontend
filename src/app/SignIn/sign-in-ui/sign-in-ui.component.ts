import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { SigInService } from 'src/app/services/signIn/sig-in.service';
import { GoogleAuthService } from 'src/app/services/google/google-auth.service';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';
import { SubscriptionService } from 'src/app/services/AccountPlan/subscription.service';

@Component({
  selector: 'app-sign-in-ui',
  templateUrl: './sign-in-ui.component.html',
  styleUrls: ['./sign-in-ui.component.css']
})
export class SignInUIComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  isRedirecting = false;
  passwordVisible = false;

  returnUrl: string | null = null;
  applyTransNo: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sigInService: SigInService,
    private notificationService: NotificationsService,
    private googleAuth: GoogleAuthService,
    private subscriptionService: SubscriptionService,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('auth_token', token);
        this.router.navigate(['/dashboard']);
      }

      this.returnUrl = params['returnUrl'] || null;
      this.applyTransNo = params['applyTransNo'] || null;
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
      ]]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.sigInService.signin(email, password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || !res.success) {
          this.notificationService.toastPopUpError(res?.message || 'Login failed');
          return;
        }

        // Save session
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        sessionStorage.setItem('is_online', String(res.is_online ?? true));
        localStorage.setItem('chatmessages', 'true');

        // Came from "Apply Now" -> go straight back to that job
        if (this.applyTransNo) {
          this.redirectTo([`/${res.role}/apply-job`, this.applyTransNo]);
          return;
        }

        // Came from some other protected page -> go back there
        if (this.returnUrl) {
          this.redirectTo([this.returnUrl]);
          return;
        }

        // No subscription -> prompt to activate plan
        if (res.role === 'DEF-USERS' && !res.has_subscription) {
          this.router.navigate([`/${res.role}/subscription`]);
          return;
        }

        // Load features, then redirect by role
        this.subscriptionService.myFeatures().subscribe({
          next: (featureRes: any) => {
            this.featureService.set(featureRes.success ? featureRes.features : []);
            this.redirectUser(res.role);
          },
          error: () => {
            this.featureService.set([]);
            this.redirectUser(res.role);
          }
        });
      },

      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.status === 401
          ? err.error?.message || 'Invalid email or password'
          : err.message || 'Something went wrong';
        this.notificationService.toastPopUpError(errorMsg);
      }
    });
  }

  private redirectUser(role: string): void {
    const routes: Record<string, string> = {
      'DEF-CLIENT': '/DEF-CLIENT/client-dashboard',
      'DEF-ADMIN': '/DEF-ADMIN/admin-dashboard',
      'DEF-MASTERADMIN': '/DEF-MASTERADMIN/admin-dashboard',
      'DEF-USERS': '/DEF-USERS/home'
    };
    this.redirectTo([routes[role] || '/homepage']);
  }

  private redirectTo(commands: any[]): void {
    this.isRedirecting = true;
    setTimeout(() => this.router.navigate(commands), 1200);
  }

  signInWithGoogle(): void {
    this.googleAuth.loginWithGoogle();
  }
}