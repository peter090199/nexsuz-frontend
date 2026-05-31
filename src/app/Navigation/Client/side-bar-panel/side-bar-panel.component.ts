// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// import { Router, NavigationEnd } from '@angular/router';
// import { Subscription, firstValueFrom } from 'rxjs';
// import { filter } from 'rxjs/operators';
// import { SigInService } from 'src/app/services/signIn/sig-in.service';
// import { TNavigationService } from 'src/app/services/TNavigation/tnavigation.service';
// import { NotificationComponent } from 'src/app/ComponentUI/notification/notification.component';
// import { MatDialog } from '@angular/material/dialog';
// import { EchoService } from 'src/app/services/echo.service';
// import { Title } from '@angular/platform-browser';
// import { ProfileService } from 'src/app/services/Profile/profile.service';
// import { SharedService } from 'src/app/services/SharedServices/shared.service';
// import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
// import { Location } from '@angular/common';
// import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';

// @Component({
//   selector: 'app-side-bar-panel',
//   templateUrl: './side-bar-panel.component.html',
//   styleUrls: ['./side-bar-panel.component.css']
// })
// export class SideBarPanelComponent implements OnInit, OnDestroy {
//   sidebarOpen = true;
//   isMobile = false;
//   menuItems: any[] = [];
//   pageTitle = 'Dashboard';
//   unreadCount = 0;
//   userName = 'John Doe';
//   profile: any;

//   private countsSubscription?: Subscription;
//   private breakpointSubscription?: Subscription;
//   private routerSubscription?: Subscription;

//   constructor(
//     private observer: BreakpointObserver,
//     private authService: SigInService,
//     private navigationService: TNavigationService,
//     private router: Router,
//     private dialog: MatDialog,
//     private echoService: EchoService,
//     private titleService: Title,
//     private profileService: ProfileService,
//     public sharedService: SharedRoutinesService,
//     private location: Location,
//     private cvService: CurriculumVitaeService,
//   ) { }

//   ngOnInit(): void {
//     this.breakpointSubscription = this.observer.observe([Breakpoints.Handset])
//       .subscribe(result => {
//         this.isMobile = result.matches;
//         this.sidebarOpen = !this.isMobile;
//       });

//     this.routerSubscription = this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd))
//       .subscribe(() => this.updatePageTitle());

//     this.fetchModules();
//     this.loadRealtimeCounts();
//     this.getProfile();
//   }

//   // getProfile() {
//   //   this.profileService.getProfileByUserOnly().subscribe({
//   //     next: (res) => {
//   //       this.profile = res.message;
//   //       console.log(this.profile?.role_code);
//   //          console.log('Profile data loaded:', res);
//   //     },
//   //     error: (err) => console.error(err)
//   //   });
//   // }

//   getProfile(): void {
//     this.cvService.getDataCV().subscribe({
//       next: (res: any) => {
//         this.profile = res.message;
//       },
//       error: (err: any) => console.error('Error loading profile:', err)
//     });
//   }

//   ngOnDestroy(): void {
//     this.countsSubscription?.unsubscribe();
//     this.breakpointSubscription?.unsubscribe();
//     this.routerSubscription?.unsubscribe();
//   }

//   async fetchModules(): Promise<void> {
//     try {
//       const response = await firstValueFrom(this.navigationService.getData());
//       this.menuItems = response
//         .sort((a: any, b: any) => a.sort - b.sort)
//         .map((item: any) => ({
//           label: item.description,
//           icon: item.icon,
//           route: item.route,
//           submenus: item.submenus || [],
//           expanded: false
//         }));
//     } catch (error) {
//       console.error('Error fetching modules:', error);
//     }
//   }

//   loadRealtimeCounts() {
//     if (!this.countsSubscription || this.countsSubscription.closed) {
//       this.echoService.listenToNotificationCount();
//       this.countsSubscription = this.echoService.notificationCount$
//         .subscribe(count => {
//           this.unreadCount = count;
//           this.updateTitle(count);
//         });
//     }
//   }

//   toggleSidebar() {
//     this.sidebarOpen = !this.sidebarOpen;
//   }

//   toggleSubmenu(item: any): void {
//     item.expanded = !item.expanded;
//   }

//   openNotifications(): void {
//     const dialogRef = this.dialog.open(NotificationComponent, {
//       width: '400px',
//       maxHeight: '90vh',
//       position: { top: '40px', right: '90px' },
//       panelClass: 'custom-notification-popup',
//     });

//     dialogRef.afterClosed().subscribe(() => this.loadRealtimeCounts());
//   }

//   logout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         sessionStorage.clear();
//         localStorage.clear();
//         localStorage.setItem('showWebsiteChat', 'false');
//         localStorage.setItem('cookiesAccepted', 'true');
//         window.location.href = '/homepage';
//       },
//       error: err => console.error('Logout failed:', err)
//     });
//   }

//   updateTitle(count: number): void {
//     this.titleService.setTitle(count > 0 ? `🔔 (${count}) Nexsuz` : 'Nexsuz');
//   }

//   updatePageTitle(): void {
//     const currentUrl = this.router.url;
//     const mainItem = this.menuItems.find(item => currentUrl.includes(item.route));
//     if (mainItem) {
//       this.pageTitle = mainItem.label;
//       return;
//     }

//     for (const item of this.menuItems) {
//       const sub = item.submenus?.find((subItem: any) => currentUrl.includes(subItem.route));
//       if (sub) {
//         this.pageTitle = sub.label || sub.description;
//         return;
//       }
//     }

//     this.pageTitle = 'Dashboard';
//   }

//   navigateTo(url: string) {
//     this.router.navigate([url]);
//   }

//   // get settingsUrl(): string {
//   //   return this.profile?.role_code === 'MASTER-ADMIN' ? '/masteradmin/settings' :
//   //     this.profile?.role_code === 'DEF-ADMIN' ? '/admin/settings' :
//   //       this.profile?.role_code === 'RECRUITER' ? '/recruiter/settings' :
//   //         '/settings';
//   // }

//   // get profileUrl(): string {
//   //   return this.profile?.role_code === 'MASTER-ADMIN' ? '/masteradmin/profile' :
//   //          this.profile?.role_code === 'DEF-ADMIN' ? '/admin/profile' :
//   //          this.profile?.role_code === 'RECRUITER' ? '/recruiter/profile' :
//   //          '/profile';
//   // }

//   //  settingsUrl(): string {
//   //     if (!this.profile) return '/profile';

//   //     const code = this.profile.code; // or id, depending on your API

//   //     switch (this.profile.role_code) {
//   //       case 'DEF-CLIENT':
//   //         return `/recruiter/settings`;
//   //       case 'DEF-MASTER-ADMIN':
//   //         return `/masteradmin/settings`;
//   //       case 'DEF-ADMIN':
//   //         return `/admin/settings`;
//   //       default:
//   //         return `/profile/settings`;
//   //     }
//   //   }

//   //   getProfileUrl(): string {
//   //     if (!this.profile) return '/profile';

//   //     const code = this.profile.code; // or id, depending on your API

//   //     switch (this.profile.role_code) {
//   //       case 'DEF-CLIENT':
//   //         return `/recruiter/client_profile/${code}`;
//   //       case 'DEF-MASTER-ADMIN':
//   //         return `/masteradmin/profile/${code}`;
//   //       case 'DEF-ADMIN':
//   //         return `/admin/profile/${code}`;
//   //       default:
//   //         return `/profile/${code}`;
//   //     }
//   //   }


//   getsettingsUrl(): void {
//     this.router.navigate(
//       this.sharedService.getsettingsRoute()
//     );
//   }

//   getProfileUrl(): void {
//     this.router.navigate(
//       this.sharedService.getProfileRoute(this.profile.code)
//     );
//   }

//   goBack(): void {
//     this.location.back();
//   }

// }


import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SigInService } from 'src/app/services/signIn/sig-in.service';
import { TNavigationService } from 'src/app/services/TNavigation/tnavigation.service';
import { NotificationComponent } from 'src/app/ComponentUI/notification/notification.component';
import { MatDialog } from '@angular/material/dialog';
import { EchoService } from 'src/app/services/echo.service';
import { Title } from '@angular/platform-browser';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { Location } from '@angular/common';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';

@Component({
  selector: 'app-side-bar-panel',
  templateUrl: './side-bar-panel.component.html',
  styleUrls: ['./side-bar-panel.component.css']
})
export class SideBarPanelComponent implements OnInit, OnDestroy {

  // ================= UI STATE =================
  sidebarOpen = true;
  isMobile = false;

  // ================= MENU =================
  menuItems: any[] = [];
  originalMenuItems: any[] = [];

  // ================= SEARCH =================
  showSearch = false;
  searchText = '';

  // ================= PAGE =================
  pageTitle = 'Dashboard';

  // ================= NOTIFICATION =================
  unreadCount = 0;

  // ================= PROFILE =================
  profile: any;

  // ================= SUBSCRIPTIONS =================
  private countsSubscription?: Subscription;
  private breakpointSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private observer: BreakpointObserver,
    private authService: SigInService,
    private navigationService: TNavigationService,
    private router: Router,
    private dialog: MatDialog,
    private echoService: EchoService,
    private titleService: Title,
    private profileService: ProfileService,
    public sharedService: SharedRoutinesService,
    private location: Location,
    private cvService: CurriculumVitaeService,
  ) { }
@ViewChild('searchSidenav') searchSidenav: any;

  ngOnInit(): void {

    // RESPONSIVE CHECK
    this.breakpointSubscription = this.observer
      .observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidebarOpen = !this.isMobile;
      });

    // ROUTE CHANGE TITLE
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updatePageTitle());

    this.fetchModules();
    this.loadRealtimeCounts();
    this.getProfile();
  }

  // ================= PROFILE =================
  getProfile(): void {
    this.cvService.getDataCV().subscribe({
      next: (res: any) => {
        this.profile = res.message;
      },
      error: (err: any) => console.error('Error loading profile:', err)
    });
  }

  // ================= MENU LOAD =================
  async fetchModules(): Promise<void> {
    try {
      const response = await firstValueFrom(this.navigationService.getData());

      const formatted = response
        .sort((a: any, b: any) => a.sort - b.sort)
        .map((item: any) => ({
          label: item.description,
          icon: item.icon,
          route: item.route,
          submenus: item.submenus || [],
          expanded: false
        }));

      this.menuItems = formatted;
      this.originalMenuItems = JSON.parse(JSON.stringify(formatted));

    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  }

  // ================= SEARCH =================
  toggleSearch(): void {
    this.showSearch = !this.showSearch;

    if (!this.showSearch) {
      this.clearSearch();
    }
  }


  filterMenu(): void {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.menuItems = JSON.parse(JSON.stringify(this.originalMenuItems));
      return;
    }

    this.menuItems = this.originalMenuItems
      .map(item => {

        const matchParent = item.label.toLowerCase().includes(search);

        const filteredSubmenus = item.submenus?.filter((sub: any) =>
          (sub.label || sub.description)?.toLowerCase().includes(search)
        );

        if (matchParent || (filteredSubmenus && filteredSubmenus.length)) {
          return {
            ...item,
            submenus: filteredSubmenus,
            expanded: true
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  closeSearch(): void {
    this.searchSidenav.close();
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchText = '';
    this.menuItems = JSON.parse(JSON.stringify(this.originalMenuItems));
  }
  // ================= SIDEBAR =================
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSubmenu(item: any): void {
    item.expanded = !item.expanded;
  }

  // ================= NOTIFICATIONS =================
  loadRealtimeCounts(): void {
    if (!this.countsSubscription || this.countsSubscription.closed) {
      this.echoService.listenToNotificationCount();

      this.countsSubscription = this.echoService.notificationCount$
        .subscribe(count => {
          this.unreadCount = count;
          this.updateTitle(count);
        });
    }
  }

  openNotifications(): void {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      maxHeight: '90vh',
      position: { top: '40px', right: '90px' },
      panelClass: 'custom-notification-popup',
    });

    dialogRef.afterClosed().subscribe(() => this.loadRealtimeCounts());
  }

  updateTitle(count: number): void {
    this.titleService.setTitle(
      count > 0 ? `🔔 (${count}) Nexsuz` : 'Nexsuz'
    );
  }

  // ================= ROUTE TITLE =================
  updatePageTitle(): void {
    const currentUrl = this.router.url;

    const mainItem = this.menuItems.find(item =>
      currentUrl.includes(item.route)
    );

    if (mainItem) {
      this.pageTitle = mainItem.label;
      return;
    }

    for (const item of this.menuItems) {
      const sub = item.submenus?.find((subItem: any) =>
        currentUrl.includes(subItem.route)
      );

      if (sub) {
        this.pageTitle = sub.label || sub.description;
        return;
      }
    }

    this.pageTitle = 'Dashboard';
  }

  // ================= AUTH =================
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/homepage';
      },
      error: err => console.error('Logout failed:', err)
    });
  }

  // ================= NAVIGATION =================
  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  getsettingsUrl(): void {
    this.router.navigate(this.sharedService.getsettingsRoute());
  }

  getProfileUrl(): void {
    this.router.navigate(
      this.sharedService.getProfileRoute(this.profile.code)
    );
  }

  goBack(): void {
    this.location.back();
  }

  // ================= CLEANUP =================
  ngOnDestroy(): void {
    this.countsSubscription?.unsubscribe();
    this.breakpointSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}