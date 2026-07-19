import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { trigger, style, animate, transition } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { ChatPopupComponent } from './ComponentUI/messages/chat-popup/chat-popup.component';
import { ChatWebsitePopUPComponent } from './ComponentUI/messages/chat-website-pop-up/chat-website-pop-up.component';
import { AuthService } from './services/auth.service';
import { EchoService } from './services/echo.service';
import { SigInService } from './services/signIn/sig-in.service';
import { SubscriptionService } from './services/AccountPlan/subscription.service';
import { FeatureService } from './services/AccountPlan/feature.service';
import { UpgradeRequiredComponent } from './ComponentSharedUI/account-type-plan/upgrade-required/upgrade-required.component';
import { Router } from '@angular/router';
import { SharedRoutinesService } from './services/Function/shared-routines.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate(
          '0.5s ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  is_online = false;
  showChatButton = true;
  showWebsiteChat = true;

  userId: number | null = null;
  notificationCounts = 0;
  private upgradeDialogTimer?: Subscription

  constructor(
    private translate: TranslateService, public sharedService: SharedRoutinesService,
    private cookieService: CookieService,
    private authService: AuthService,
    private echoService: EchoService,
    private logoutServices: SigInService,
    private subscriptionService: SubscriptionService,
    private featureService: FeatureService,
    public dialog: MatDialog,
    private router: Router
  ) {

    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('en');
  }
  ngOnInit(): void {

    this.cookieService.set('myCookie', 'cookieValue', {
      expires: 7,
      path: '/'
    });

    this.is_online = sessionStorage.getItem('is_online') === 'true';

    this.showChatButton = this.is_online;
    this.showWebsiteChat = localStorage.getItem('chatmessages') === 'true';

    if (this.is_online) {
      this.loadUserID();

      // Delay slightly so the token/session is ready
      setTimeout(() => {
        this.loadFeatures();
      }, 300);
    }

    this.echoService.notificationCount$
      .subscribe(count => {
        this.notificationCounts = count;
      });
  }
  private stopUpgradePopup(): void {
    if (this.upgradeDialogTimer) {
      this.upgradeDialogTimer.unsubscribe();
      this.upgradeDialogTimer = undefined;
    }

  }

  private startUpgradePopup(): void {

    // Already started
    if (this.upgradeDialogTimer) {
      return;
    }

    this.upgradeDialogTimer = interval(3000).subscribe(() => {

      const role = this.sharedService.getRole();

      // Don't redirect these roles
      if (
        role === 'DEF-ADMIN' ||
        role === 'DEF-MASTERADMIN' ||
        role === 'DEF-CLIENT'
      ) {
        this.stopUpgradePopup();
        return;
      }

      const subscriptionRoute = `/${role}/subscription`;

      // Already on subscription page
      if (this.router.url === subscriptionRoute) {
        return;
      }

      this.router.navigateByUrl(subscriptionRoute);

    });

  }

  loadFeatures(): void {
    this.subscriptionService.myFeatures().subscribe({
      next: (res: any) => {
        console.log('Features:', res);
        if (res && res.success === true) {
          this.featureService.set(res.features || []);
          // Stop redirect timer
          this.stopUpgradePopup();
        } else {
          // No active subscription
          this.featureService.set([]);
          this.startUpgradePopup();
        }
      },
      error: (err: any) => {
        this.featureService.set([]);
        if (
          err.status === 403 ||
          err.status === 404 ||
          err.status === 401 ||
          err.error?.message === 'No active subscription found.'
        ) {
          this.startUpgradePopup();
        }
      }
    });
  }

  loadUserID(): void {
    this.authService.getData().subscribe({
      next: (res: any) => {
        this.userId = res.id;
        if (this.userId) {
          sessionStorage.setItem(
            'userId',
            this.userId.toString()
          );
        }
      },
      error: err => console.error(err)
    });
  }

  onLogout(): void {
    this.logoutServices.logout().subscribe({
      next: () => {
        sessionStorage.clear();
        localStorage.clear();
        localStorage.setItem(
          'showWebsiteChat',
          'false'
        );
        window.location.href = '/homepage';
      },
      error: err => console.error(err)
    });
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }

  openChat1(): void {

    this.dialog.open(ChatWebsitePopUPComponent, {
      width: '450px',
      position: {
        bottom: '20px',
        right: '20px'
      },
      panelClass: 'custom-chat-popup'
    });

  }

  openChat(): void {

    this.dialog.open(ChatPopupComponent, {
      width: '400px',
      position: {
        bottom: '20px',
        right: '5px'
      },
      panelClass: 'custom-chat-popup'
    });

  }

  closeChat(): void {

    this.showChatButton = true;
    localStorage.setItem('showChatButton', 'true');

  }

}