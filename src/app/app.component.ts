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
      this.loadFeatures();
      this.loadUserID();
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
    if (this.upgradeDialogTimer) {
      return;
    }

    this.upgradeDialogTimer = interval(3000).subscribe(() => {
      const role = this.sharedService.getRole();
      if (role === 'DEF-ADMIN' || role === 'DEF-MASTERADMIN' || role === 'DEF-CLIENT') {
        return;
      }
      const route = `/${role}/subscription`;
      if (this.router.url !== route) {
        this.router.navigate([route]);
      }
    });



    // this.upgradeDialogTimer = interval(3000).subscribe(() => {
    //   if (this.dialog.openDialogs.length === 0) {
    //     // this.dialog.open(UpgradeRequiredComponent, {
    //     //   width: '600px',
    //     //   maxWidth: '95vw',
    //     //   disableClose: true,
    //     //   autoFocus: false,
    //     //   panelClass: 'upgrade-dialog'
    //     // });
    //   }
    // });

  }

  loadFeatures(): void {
    this.subscriptionService.myFeatures().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.featureService.set(res.features);
          // User has subscription
          this.stopUpgradePopup();
        }
      },
      error: (err) => {

        this.featureService.set([]);

        if (
          err.status === 403 ||
          err.status === 404 ||
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