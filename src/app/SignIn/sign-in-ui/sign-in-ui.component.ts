import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { SigInService } from 'src/app/services/signIn/sig-in.service';
import { GoogleAuthService } from 'src/app/services/google/google-auth.service';

@Component({
  selector: 'app-sign-in-ui',
  templateUrl: './sign-in-ui.component.html',
  styleUrls: ['./sign-in-ui.component.css']
})
export class SignInUIComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hide = true;
  passwordVisible: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sigInService: SigInService,
    private notificationService: NotificationsService,
    private googleAuth: GoogleAuthService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('auth_token', token);
        this.router.navigate(['/dashboard']);
      }
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
        // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        //  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
      ]]
    });
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  isRedirecting = false;
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.sigInService.signin(email, password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || !res.success) {
          this.notificationService.toastPopUpError(
            res?.message || 'Login failed'
          );
          return;
        }

        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        sessionStorage.setItem('is_online', String(res.is_online ?? true));
        localStorage.setItem('chatmessages', 'true');
      
        // No active subscription -> Show Activate Free Plan dialog
        if (!res.has_subscription) {
          const route = `/${res.role}/subscription`;
          if (this.router.url !== route) {
            this.router.navigate([route]);
          }
          return;
        }
        // Show Windows loading
        this.isRedirecting = true;

        setTimeout(() => {

          switch (res.role) {

            case 'DEF-CLIENT':
              this.router.navigate(['/DEF-CLIENT/client-dashboard']);
              break;

            case 'DEF-ADMIN':
              this.router.navigate(['/DEF-ADMIN/admin-dashboard']);
              break;

            case 'DEF-MASTERADMIN':
              this.router.navigate(['/DEF-MASTERADMIN/admin-dashboard']);
              break;

            case 'DEF-USERS':
              this.router.navigate(['/DEF-USERS/home']);
              break;

            default:
              this.router.navigate(['/homepage']);

          }

        }, 1200); // Windows loading duration

      },

      error: (err) => {

        this.isLoading = false;

        const errorMsg =
          err.status === 401
            ? err.error?.message || 'Invalid email or password'
            : err.message || 'Something went wrong';

        this.notificationService.toastPopUpError(errorMsg);

      }

    });

  }

  onSubmitxxx(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.sigInService.signin(email, password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || res.success !== true) {
          this.notificationService.toastPopUpError(
            res?.message || 'Login failed'
          );
          return;
        }

        /* 🔐 STORE AUTH DATA */
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        sessionStorage.setItem('is_online', String(res.is_online ?? true));
        localStorage.setItem('chatmessages', 'true');

        /* 🚦 REDIRECT BY ROLE */
        if (res.role === 'DEF-CLIENT') {
          this.router.navigate(['/DEF-CLIENT/client-dashboard']);
          return;
        }

        if (res.role === 'DEF-ADMIN') {
          this.router.navigate(['/DEF-ADMIN/admin-dashboard']);
          return;
        }

        if (res.role === 'DEF-MASTERADMIN') {
          this.router.navigate(['/DEF-MASTERADMIN/admin-dashboard']);
          return;
        }

        if (res.role === 'DEF-USERS') {
          this.router.navigate(['/DEF-USERS/home']);
          return;
        }

        /* ❌ FALLBACK */
        //  this.router.navigate(['/homepage']);
      },

      error: (err) => {
        this.isLoading = false;

        const errorMsg =
          err.status === 401
            ? err.error?.message || 'Invalid email or password'
            : err.message || 'Something went wrong';

        this.notificationService.toastPopUpError(errorMsg);
      }
    });
  }

  // onSubmit(): void {
  //   if (this.loginForm.invalid) return;

  //   this.isLoading = true;
  //   const { email, password } = this.loginForm.value;
  //   console.log(this.loginForm.value)
  //   this.sigInService.signin(email, password).subscribe({
  //     next: (res) => {

  //       this.isLoading = false;
  //       if (res.success == true) {
  //         console.log(res)
  //         sessionStorage.setItem('token', res.token);
  //         localStorage.setItem("chatmessages", "true");
  //         if (res.message == 0) {
  //           // this.router.navigateByUrl("profile/705");
  //           // this.router.navigate(['/profile', this]);
  //               this.router.navigateByUrl("/client")
  //           // this.router.navigateByUrl("/home").then(() => {
  //           //   window.location.reload(); // Only if absolutely necessary
  //           // });
  //         }
  //         if (res.message == 1) {
  //           this.router.navigateByUrl("/user-cv")
  //         }

  //         // const targetRoute = res.message === 1 ? '/home' : '/user-cv';
  //         // this.router.navigate([targetRoute]).then(() => location.reload());
  //       } else {
  //         this.notificationService.toastPopUpError(res.message);
  //       }
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       const errorMsg = err.status === 401 ? err.error : err.message;
  //       this.notificationService.toastPopUpError(errorMsg);
  //     }
  //   });
  // }

  signInWithGoogle() {
    this.googleAuth.loginWithGoogle();
  }

}
