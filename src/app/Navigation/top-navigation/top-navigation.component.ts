import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuPanel } from '@angular/material/menu';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, firstValueFrom, interval } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { SigInService } from 'src/app/services/signIn/sig-in.service';
import { TNavigationService } from 'src/app/services/TNavigation/tnavigation.service';
import { slideUp, slideFade } from 'src/app/animations';
import { ChatPopupComponent } from 'src/app/ComponentUI/messages/chat-popup/chat-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from 'src/app/services/chat.service';
import { NotificationComponent } from 'src/app/ComponentUI/notification/notification.component';
import { NotificationService } from 'src/app/services/notification.service';
import { EchoService } from 'src/app/services/echo.service';
import { Title } from '@angular/platform-browser';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { CurriculumVitaeService } from 'src/app/services/CV/curriculum-vitae.service';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';

export interface User {
  name: string;
}

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css'],
  animations: [slideUp, slideFade]
})
export class TopNavigationComponent implements OnInit {
  isSidebarOpen = false;
  isMobile = window.innerWidth <= 768;
  searchValue = '';
  isLoading = false;
  success = false;
  isChatOpen = false;
  isSearchOpen = false;
  homeModule:any;
  nav_module: any = [];
  submenuMenu!: MatMenuPanel<any>;
  

  messageCount = 3;
  notificationCounts:number = 0;
  notificationCount: any = [];
  notifications: any[] = []; 

  myControl = new FormControl();
  options: User[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  filteredOptions!: Observable<User[]>;

  searchQuery = '';
  filteredData: string[] = [];
  unreadMessages = 0;
  totalUnreadMessages:number = 0;
  data: string[] = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
    'DevOps Engineer', 'UI/UX Designer', 'Product Manager', 'Project Manager'
  ];

  notificationCountSubject = new BehaviorSubject<number>(0); // Initial count of 0
  unreadCount$ = this.notificationCountSubject.asObservable();
  userId:number = 0;
  unreadCount:number = 0;
  count = 0;
  isOpen = false;
  homeNewDataCount = 0;
mobileMenu: MatMenuPanel<any>;
desktopMenu: MatMenuPanel<any>;

  constructor(
    private authService: SigInService,
    private navigationService: TNavigationService,private dialog:MatDialog,
    private router: Router, private chatService:ChatService,private echoService:EchoService,
    private notificationService:NotificationService, private ngZone: NgZone,private titleService: Title,
    private alert:NotificationsService,public sharedRoutines: SharedRoutinesService,private profile: ProfileService,
     private cvService: CurriculumVitaeService,public feature:FeatureService
  ) {
    this.sharedRoutines.onNewPostsDetected = (count: number) => {
      this.homeNewDataCount = count;
    };
  }

  user: any;
  lastActionTime = Date.now();
  inactivityCheck: any;
  refreshingIcon: string | null = null;
 profileservices:any;
 
  ngOnInit(): void {
     this.getProfile();

     this.inactivityCheck = setInterval(() => this.checkInactivity(), 30000);
       setTimeout(() => {
      this.isLoading = false;
    }, 5000);
    
    this.loadRealtimeCounts();
    this.fetchModules();
     this.loadUserData();
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value?.name)),
        map(name => (name ? this._filter(name) : this.options.slice()))
      );

      this.sharedRoutines.onNewPostsDetected = (count: number) => {
        this.homeNewDataCount = count;
      };
  }

  
  
  @HostListener('document:click')
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  onUserAction(): void {
    this.lastActionTime = Date.now();
  }

  checkInactivity(): void {
    const now = Date.now();
    const minutesInactive = (now - this.lastActionTime) / (1000 * 60);

    if (minutesInactive >= 1) {
      this.triggerRefresh();
      this.lastActionTime = now; // reset after refresh
    }
  }


  refreshHomePage() {
    this.router.navigate(['/homepage']).then(() => {
      window.location.reload();
    });
  }

    getProfile(): void {
    this.cvService.getDataCV().subscribe({
      next: (res: any) => {
        this.profileservices = res.message;
      },
      error: (err: any) => console.error('Error loading profile:', err)
    });
  }

  
  triggerRefresh(): void {
    this.isLoading = true;

    this.fetchModules(); // Example API reload
    this.loadUserData();

    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }


  ngOnDestroy(): void {
    if (this.inactivityCheck) {
      clearInterval(this.inactivityCheck);
    }
  }
  
  error:any;
 loadUserData() {
    this.profile.getProfileByUserOnly().subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.message; // assume backend returns [{ fullname, email, ... }]
        } else {
          this.error = 'Failed to load profile data';
        }
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching profile data';
      },
    });
  }


  async onHomeClick(): Promise<void> {
    this.sharedRoutines.onNewPostsDetected = (count: number) => {
      this.homeNewDataCount = count;
      console.log('New posts detected:', count);
    };
  }

  loadRealtimeCounts(){
    if (!this.countsSubscription || this.countsSubscription.closed) {
      this.echoService.listenToNotificationCount();
      this.echoService.notificationCount$.subscribe(count => {
        this.unreadCount = count;
      console.log("counts " + this.unreadCount)
      this.updateTitle(this.unreadCount);
      });
    }
  
  }

  updateTitle(count: number) {
    if (count > 0) {
      this.titleService.setTitle(`🔔 (${count}) Nexsuz`);
    } else {
      this.titleService.setTitle('Nexsuz');
    }
  }

  chatDialogRef: any;
  chatUpdateSub: Subscription | undefined;
  countsSubscription: Subscription | undefined;

  openChat(notif?: any) {
    this.chatDialogRef = this.dialog.open(ChatPopupComponent, {
      width: '500px',
      position: { bottom: '80px', right: '80px' },
      panelClass: 'custom-chat-popup',

      data: notif
    });
  
    this.chatDialogRef.afterClosed().subscribe(() => {
    });
  }


  openChatxx() {
    this.dialog.open(ChatPopupComponent, {
      width: '500px',
      position: { bottom: '80px', right: '20px' },
      panelClass: 'custom-chat-popup'
    });
    this.loadRealtimeCounts();

  }

  // listenToNotifications(userId: number) {
  //   this.notificationService
  //     .private(`user.${userId}`).listen('notifications.count', (event: { unreadCount: number }) => {
  //       console.log('New unread count:', event.unreadCount);
  //       this.notificationCountSubject.next(event.unreadCount); // Update the unread count
  //     })
  //     .error((err: any) => {
  //       console.error('❌ Error receiving the event:', err);
  //     });
  // }


  loadNoficationsCount(){
    // this.notificationService.unreadCount$.subscribe(count => {
    //   this.notificationCount = count;
    //   this.totalUnreadMessages = this.notificationCount.unreadCount
    // //  console.log(this.totalUnreadMessages)
    // });
    

    // this.notificationService.unreadCount$.subscribe((data) => {
    //   this.notificationCount = data;
    //   this.totalUnreadMessages = this.notificationCount.unreadCount
    // });

  }
  // updateNotificationCount(): void {
  //   this.notificationService.getNotifications().subscribe({
  //     next: (count: any) => {
  //       this.notificationCount = count.unreadCount;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching notification count:', err);
  //     }
  //   });
  // }


  // loadNotifications(): void {
  //   this.chatService.getNotifications().subscribe({
  //     next: (res) => {
  //       this.notifications = res.unreadCount;
  //       this.echoService.totalUnread$.subscribe((cnt) => {
  //         this.totalUnreadMessages = cnt;
  //       });
    
  //     },
  //     error: (err) => console.error('❌ Error fetching notifications:', err),
  //   });
  // }
  
  

    
  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  private _filter(name: string): User[] {
    return this.options.filter(option =>
      option.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.autoCloseSearch(); // Auto-hide search after a delay
    }
  }

  closeSearchOnOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('search-overlay')) {
      this.toggleSearch(); // Close if clicking outside the search container
    }
  }

  autoCloseSearch() {
    setTimeout(() => {
      this.isSearchOpen = false;
    }, 5000); // Auto-hide after 5 seconds (adjust as needed)
  }


  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  clearSearch() {
    this.searchValue = '';
  }

  filterData() {
    this.filteredData = this.data.filter(item =>
      item.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  async fetchModules(): Promise<void> {
      this.isLoading = true;

      try {
        const response = await firstValueFrom(this.navigationService.getData());
        this.nav_module = response;
        this.isLoading = true;
      } catch (error) {
        console.error('Error fetching modules:', error);
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    }

refreshMenu(icon: string) {
  if(icon === 'home') {
    this.refreshingIcon = icon;

    // Simulate refresh process
    setTimeout(() => {
      this.refreshingIcon = null;
    }, 2000);
  }

  // handle other menu clicks normally
}

 async refreshMenux(icon: string): Promise<void> {
    if (this.refreshingIcon === icon) return; // Prevent repeat clicks
    this.refreshingIcon = icon;

    // Simulate re-fetch (like Facebook refresh)
    await this.fetchModules();

    setTimeout(() => {
      this.refreshingIcon = null;
    }, 1000);
  }



  sendData() {
    const requestBody = { name: 'John Doe', email: 'john@example.com' };
    this.navigationService.postData('submit-form', requestBody).subscribe({
      next: response => console.log('Form submitted successfully', response),
      error: error => console.error('Error submitting form:', error)
    });
  }
  
  
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        const showChat = JSON.stringify(false);
        const cookiesAccepted = JSON.stringify(true);
        sessionStorage.clear(); // Or use localStorage.clear() if needed
        localStorage.clear();
        // Restore required flags
        localStorage.setItem('showWebsiteChat', showChat);
        localStorage.setItem('cookiesAccepted', cookiesAccepted);
  
        // Redirect to homepage
        window.location.href = '/homepage';
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }
  
    onLogoutx() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']).then(() => {
          localStorage.clear(); // Clears ALL local storage items for better performance
          localStorage.setItem('showWebsiteChat', JSON.stringify(true));
          localStorage.setItem('cookiesAccepted', JSON.stringify(true));
          window.location.href = '/homepage';
        });
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }
  
  
  onLogouts() {
    localStorage.clear(); // Clears ALL local storage items for better performance
    localStorage.setItem('showWebsiteChat', JSON.stringify(true));
    localStorage.setItem('cookiesAccepted', JSON.stringify(true));
    window.location.href = '/homepage';
  }
  
  chatHistory: { [key: number]: any[] } = {};

  openNotifications() {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      minHeight: 'auto',
      maxHeight: '90vh',
      position: { top: '40px', right: '90px' }, 
      panelClass: 'custom-notification-popup',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadRealtimeCounts();
    });
  }
  

  
}

// import { Component, HostListener, NgZone, OnInit } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { MatMenuPanel } from '@angular/material/menu';
// import { Router } from '@angular/router';
// import { BehaviorSubject, Observable, Subscription, firstValueFrom, interval, of } from 'rxjs';
// import { catchError, finalize, map, startWith, take, tap } from 'rxjs/operators';
// import { SigInService } from 'src/app/services/signIn/sig-in.service';
// import { TNavigationService } from 'src/app/services/TNavigation/tnavigation.service';
// import { slideUp, slideFade } from 'src/app/animations';
// import { ChatPopupComponent } from 'src/app/ComponentUI/messages/chat-popup/chat-popup.component';
// import { MatDialog } from '@angular/material/dialog';
// import { ChatService } from 'src/app/services/chat.service';
// import { NotificationComponent } from 'src/app/ComponentUI/notification/notification.component';
// import { NotificationService } from 'src/app/services/notification.service';
// import { EchoService } from 'src/app/services/echo.service';
// import { Title } from '@angular/platform-browser';
// import { NotificationsService } from 'src/app/services/Global/notifications.service';
// import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
// import { ProfileService } from 'src/app/services/Profile/profile.service';

// // Interfaces
// export interface User {
//   name: string;
// }

// @Component({
//   selector: 'app-top-navigation',
//   templateUrl: './top-navigation.component.html',
//   styleUrls: ['./top-navigation.component.css'],
//   animations: [slideUp, slideFade]
// })
// export class TopNavigationComponent implements OnInit {
//   // --- UI State ---
//   isSidebarOpen = false;
//   isMobile = window.innerWidth <= 768;
//   isChatOpen = false;
//   isSearchOpen = false;
//   isLoading = false;
//   success = false;

//   // --- Data / Counts ---
//   unreadCount = 0;
//   totalUnreadMessages = 0;
//   messageCount = 0;
//   notificationCounts = 0;
//   notificationCount: any = [];
//   notifications: any[] = [];
//   homeNewDataCount = 0;

//   // --- Forms / Search ---
//   searchValue = '';
//   searchQuery = '';
//   myControl = new FormControl();
//   filteredOptions!: Observable<User[]>;
//   filteredData: string[] = [];
//   data: string[] = [
//     'Software Engineer', 'Frontend Developer', 'Backend Developer',
//     'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
//     'DevOps Engineer', 'UI/UX Designer', 'Product Manager', 'Project Manager'
//   ];
//   options: User[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];

//   // --- Navigation ---
//   nav_module: any[] = [];
//   homeModule: any;
//   mobileMenu!: MatMenuPanel<any>;
//   desktopMenu!: MatMenuPanel<any>;

//   // --- Observables / BehaviorSubjects ---
//   notificationCountSubject = new BehaviorSubject<number>(0);
//   unreadCount$ = this.notificationCountSubject.asObservable();

//   // --- Subscriptions ---
//   chatDialogRef: any;
//   chatUpdateSub?: Subscription;
//   countsSubscription?: Subscription;

//   user: any;
//   userId = 0;
//   count = 0;
//   error: any;

//   constructor(
//     private authService: SigInService,
//     private navigationService: TNavigationService,
//     private dialog: MatDialog,
//     private router: Router,
//     private chatService: ChatService,
//     private echoService: EchoService,
//     private notificationService: NotificationService,
//     private ngZone: NgZone,
//     private titleService: Title,
//     private alert: NotificationsService,
//     public sharedRoutines: SharedRoutinesService,
//     private profile: ProfileService
//   ) {
//     // Detect new posts from shared routines
//     this.sharedRoutines.onNewPostsDetected = (count: number) => {
//       this.homeNewDataCount = count;
//       console.log('New posts detected:', count);
//     };
//   }

//   // ======================
//   // 🔹 Lifecycle
//   // ======================
//   ngOnInit(): void {
//     //this.detectDevice();
//     this.loadRealtimeCounts();
//     this.fetchModules();
//     this.loadUserData();

//     // Autocomplete filtering setup
//     this.filteredOptions = this.myControl.valueChanges.pipe(
//       startWith(''),
//       map(value => (typeof value === 'string' ? value : value?.name)),
//       map(name => (name ? this._filter(name) : this.options.slice()))
//     );
//   }

  
// fetchModules(): void {
//   this.navigationService.getData().pipe(
//     take(1), // Automatically unsubscribe after one emission
//     tap(() => this.success = true),
//     finalize(() => this.isLoading = false),
//     catchError((error) => {
//       this.alert.toastrError(`Error fetching navigation modules: ${error.message || error}`);
//       this.success = false;
//       return of([]); // Return empty array to avoid crash
//     })
//   ).subscribe((response: any) => {
//     this.nav_module = response?.data || response || [];
//   });
// }


//   // ======================
//   // 🔹 User Data
//   // ======================
//   loadUserData(): void {
//     this.profile.getProfileByUserOnly().subscribe({
//       next: (response) => {
//         if (response.success) {
//           this.user = response.message;
//         } else {
//           this.error = 'Failed to load profile data';
//         }
//       },
//       error: (err) => {
//         this.error = err.message || 'An error occurred while fetching profile data';
//       }
//     });
//   }

//   // ======================
//   // 🔹 Realtime Counts
//   // ======================
//   loadRealtimeCounts(): void {
//     if (!this.countsSubscription || this.countsSubscription.closed) {
//       this.echoService.listenToNotificationCount();
//       this.echoService.notificationCount$.subscribe(count => {
//         this.unreadCount = count;
//         this.updateTitle(count);
//       });
//     }
//   }

//   updateTitle(count: number): void {
//     if (count > 0) {
//       this.titleService.setTitle(`🔔 (${count}) Nexsuz`);
//     } else {
//       this.titleService.setTitle('Nexsuz');
//     }
//   }

//   // ======================
//   // 🔹 Chat Popup
//   // ======================
//   openChat(notif?: any): void {
//     this.chatDialogRef = this.dialog.open(ChatPopupComponent, {
//       width: '500px',
//       position: { bottom: '80px', right: '80px' },
//       panelClass: 'custom-chat-popup',
//       data: notif
//     });

//     this.chatDialogRef.afterClosed().subscribe(() => {
//       // Recalculate or reset counters if needed
//     });
//   }

//   // ======================
//   // 🔹 Notifications Popup
//   // ======================
//   openNotifications(): void {
//     const dialogRef = this.dialog.open(NotificationComponent, {
//       width: '400px',
//       minHeight: 'auto',
//       maxHeight: '90vh',
//       position: { top: '40px', right: '90px' },
//       panelClass: 'custom-notification-popup',
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       this.loadRealtimeCounts();
//     });
//   }

//   // ======================
//   // 🔹 Search Logic
//   // ======================
//   toggleSearch(): void {
//     this.isSearchOpen = !this.isSearchOpen;
//     if (this.isSearchOpen) this.autoCloseSearch();
//   }

//   closeSearchOnOverlayClick(event: MouseEvent): void {
//     if ((event.target as HTMLElement).classList.contains('search-overlay')) {
//       this.toggleSearch();
//     }
//   }

//   autoCloseSearch(): void {
//     setTimeout(() => {
//       this.isSearchOpen = false;
//     }, 5000);
//   }

//   closeSearch(): void {
//     this.isSearchOpen = false;
//     this.searchQuery = '';
//   }

//   clearSearch(): void {
//     this.searchValue = '';
//   }

//   filterData(): void {
//     this.filteredData = this.data.filter(item =>
//       item.toLowerCase().includes(this.searchQuery.toLowerCase())
//     );
//   }

//   private _filter(name: string): User[] {
//     return this.options.filter(option =>
//       option.name.toLowerCase().includes(name.toLowerCase())
//     );
//   }

//   // ======================
//   // 🔹 Sidebar + Device
//   // ======================
//   @HostListener('window:resize')
//   onResize(): void {
//     this.detectDevice();
//   }

//   private detectDevice(): void {
//     this.isMobile = window.innerWidth <= 768;
//   }

//   toggleSidebar(): void {
//     this.isSidebarOpen = !this.isSidebarOpen;
//   }

//   // ======================
//   // 🔹 Logout
//   // ======================
//   onLogout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         sessionStorage.clear();
//         localStorage.clear();
//         localStorage.setItem('showWebsiteChat', JSON.stringify(false));
//         localStorage.setItem('cookiesAccepted', JSON.stringify(true));
//         window.location.href = '/homepage';
//       },
//       error: (err:any) => console.error('Logout failed:', err)
//     });
//   }
// }
