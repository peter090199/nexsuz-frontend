// import { Component,OnInit  } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
// import { CookieService } from 'ngx-cookie-service';
// import { MessengerChatComponent } from './messenger-chat/messenger-chat.component';
// import { MatDialog } from '@angular/material/dialog';
// import { trigger, state, style, animate, transition } from '@angular/animations';
// import { ChatPopupComponent } from './ComponentUI/messages/chat-popup/chat-popup.component';
// import { ChatWebsitePopUPComponent } from './ComponentUI/messages/chat-website-pop-up/chat-website-pop-up.component';
// import { PusherService } from './services/pusher.service';
// import { AuthService } from './services/auth.service';
// import { EchoService } from './services/echo.service';
// import { SigInService } from './services/signIn/sig-in.service';
// import { InactivityService } from './services/inactivity.service';
// import { AuthGuard } from './AuthGuard/auth.guard';
// import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
// import { filter } from 'rxjs/operators';


// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css'],
//   animations: [
//     trigger('fadeInUp', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(20px)' }),
//         animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
//       ]),
//     ]),
//   ],

// })
// export class AppComponent implements OnInit {

//   isLoggedIn: boolean = false; // Track login status
//   showChatButton: boolean = true; // Default visibility
//   showWebsiteChat: boolean = true; // Default visibility
//   message: string = '';
//   userId: number | null = null;

//   constructor(private translate: TranslateService,public dialog: MatDialog,private pusherService: PusherService,
//     private cookieService: CookieService,private authService: AuthService,private echoService:EchoService,
//     private logoutServices: SigInService,private inactivityService:InactivityService,private authguard:AuthGuard,
//     private router: Router, private route: ActivatedRoute

//   ) {
//     translate.addLangs(['en', 'fr']); // Add other languages as needed
//     translate.setDefaultLang('en');   // Set the default language
//   }

//   ngOnInit(): void {
//      this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd))
//       .subscribe((event: NavigationEnd) => {
//         console.log('Route loaded:', event.urlAfterRedirects);
//         // Do additional logic here if needed
//       });

//     // const user = sessionStorage.getItem('token');
//     // if (!user) {
//     // this.authguard.logout();
//     // }

//     this.cookieService.set('myCookie', 'cookieValue', { expires: 7, path: '/' });
//     const myCookieValue = this.cookieService.get('myCookie');
//     this.cookieService.delete('myCookie');

//     this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
//     this.showChatButton = this.isLoggedIn;

//     this.showWebsiteChat = localStorage.getItem('chatmessages') === 'true';
//     this.reloadOnce();
//     this.loadUserID();
//    // this.inactivityService.startWatching();



//   }

//   onLogout(): void {
//     this.logoutServices.logout().subscribe({
//       next: () => {
//         const showChat = JSON.stringify(false);
//         const cookiesAccepted = JSON.stringify(true);
//         sessionStorage.clear();
//         localStorage.clear();
//         localStorage.setItem('showWebsiteChat', showChat);
//         localStorage.setItem('cookiesAccepted', cookiesAccepted);
//         window.location.href = '/homepage';
//       },
//       error: (err) => console.error('Logout failed:', err)
//     });
//   }


//   loadUserID() {
//     this.authService.getData().subscribe(res => {
//       this.userId = res.id; 
//       if (this.userId !== null) {
//         sessionStorage.setItem('userId', this.userId.toString());
//       }
//     });
//     this.load();
//   }

//   notificationCounts: number = 0;

//   load(){
//     this.echoService.notificationCount$.subscribe(counts => {
//       this.notificationCounts = counts;
//       console.log(this.notificationCounts)
//     });


//  }


//   reloadOnce() {
//     if (!sessionStorage.getItem('hasReloaded')) {
//       sessionStorage.setItem('hasReloaded', 'true');
//       location.reload(); 
//     }
//   }

//   switchLanguage(language: string) {
//     this.translate.use(language);
//   }

//   openChat1() {
//     this.dialog.open(ChatWebsitePopUPComponent, {
//       width: '450px',
//       position: { bottom: '20px', right: '20px' }, // Adjusted position for better visibility
//       panelClass: 'custom-chat-popup',
//     });
//   }

//   openChat() {
//     const dialogRef = this.dialog.open(ChatPopupComponent, {
//       width: '450px',
//       position: { bottom: '20px', right: '20px' }, // Adjusted position for better visibility
//       panelClass: 'custom-chat-popup',
//     });

//   }

//   closeChat() {
//     this.showChatButton = true; // Show floating button
//     localStorage.setItem('showChatButton', JSON.stringify(true)); // Save to localStorage
//   }
// }

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { trigger, style, animate, transition } from '@angular/animations';
import { ChatPopupComponent } from './ComponentUI/messages/chat-popup/chat-popup.component';
import { ChatWebsitePopUPComponent } from './ComponentUI/messages/chat-website-pop-up/chat-website-pop-up.component';
import { AuthService } from './services/auth.service';
import { EchoService } from './services/echo.service';
import { SigInService } from './services/signIn/sig-in.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SubscriptionService } from './services/AccountPlan/subscription.service';
import { FeatureService } from './services/AccountPlan/feature.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `<div class="app-container"><router-outlet></router-outlet></div>`,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  isLoggedIn = false;
  showChatButton = true;
  showWebsiteChat = true;
  userId: number | null = null;
  notificationCounts = 0;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private cookieService: CookieService,
    private authService: AuthService,
    private echoService: EchoService,
    private logoutServices: SigInService,
    private router: Router, private sub: SubscriptionService,
    private feature: FeatureService
  ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.sub.myFeatures().subscribe((res: any) => {
      this.feature.set(res.features);
    });

    
    // Set default cookies safely
    this.cookieService.set('myCookie', 'cookieValue', { expires: 7, path: '/' });

    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.showChatButton = this.isLoggedIn;
    this.showWebsiteChat = localStorage.getItem('chatmessages') === 'true';

    // Load user info asynchronously without blocking
    this.loadUserID();

    // Subscribe to notifications
    this.echoService.notificationCount$.subscribe(counts => {
      this.notificationCounts = counts;
    });
  }

  onLogout(): void {
    this.logoutServices.logout().subscribe({
      next: () => {
        sessionStorage.clear();
        localStorage.clear();
        localStorage.setItem('showWebsiteChat', 'false');
        window.location.href = '/homepage';
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }

  loadUserID() {
    this.authService.getData().subscribe(res => {
      this.userId = res.id;
      if (this.userId !== null) {
        sessionStorage.setItem('userId', this.userId.toString());
      }
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  openChat1() {
    this.dialog.open(ChatWebsitePopUPComponent, {
      width: '450px',
      position: { bottom: '20px', right: '20px' },
      panelClass: 'custom-chat-popup'
    });
  }

  openChat() {
    this.dialog.open(ChatPopupComponent, {
      width: '400px',
      position: { bottom: '20px', right: '5px' },
      panelClass: 'custom-chat-popup'
    });
  }

  closeChat() {
    this.showChatButton = true;
    localStorage.setItem('showChatButton', 'true');
  }
}
