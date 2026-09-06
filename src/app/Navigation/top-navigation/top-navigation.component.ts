import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuPanel } from '@angular/material/menu';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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

// How long the user must be inactive before we stop auto-refreshing modules.
// Prevents indefinite background polling (and API traffic) while the tab sits idle.
const INACTIVITY_CHECK_INTERVAL_MS = 30_000;
const MAX_IDLE_REFRESHES = 1; // only auto-refresh once per idle period, not every 30s forever

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css'],
  animations: [slideUp, slideFade]
})
export class TopNavigationComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isMobile = window.innerWidth <= 768;
  searchValue = '';
  isLoading = false;
  success = false;
  isChatOpen = false;
  isSearchOpen = false;
  homeModule: any;
  nav_module: any = [];
  submenuMenu!: MatMenuPanel<any>;

  messageCount = 3;
  notificationCounts = 0;
  notificationCount: any = [];
  notifications: any[] = [];

  myControl = new FormControl();
  options: User[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  filteredOptions!: Observable<User[]>;

  searchQuery = '';
  filteredData: string[] = [];
  totalUnreadMessages = 0;
  data: string[] = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
    'DevOps Engineer', 'UI/UX Designer', 'Product Manager', 'Project Manager'
  ];

  notificationCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.notificationCountSubject.asObservable();
  userId = 0;
  unreadCount = 0;
  isOpen = false;
  homeNewDataCount = 0;

  mobileMenu!: MatMenuPanel<any>;
  desktopMenu!: MatMenuPanel<any>;

  user: any;
  lastActionTime = Date.now();
  inactivityCheck: any;
  idleRefreshCount = 0;
  refreshingIcon: string | null = null;
  profileservices: any;
  error: any;

  searchKeyword = '';
  chatHistory: { [key: number]: any[] } = {};

  chatDialogRef: any;
  chatUpdateSub: Subscription | undefined;
  countsSubscription: Subscription | undefined;

  constructor(
    private authService: SigInService,
    private navigationService: TNavigationService,
    private dialog: MatDialog,
    private router: Router,
    private chatService: ChatService,
    private echoService: EchoService,
    private notificationService: NotificationService,
    private titleService: Title,
    private alert: NotificationsService,
    public sharedRoutines: SharedRoutinesService,
    private profile: ProfileService,
    private cvService: CurriculumVitaeService,
    public feature: FeatureService,
    public sharedService: SharedRoutinesService
  ) {
    this.sharedRoutines.onNewPostsDetected = (count: number) => {
      this.homeNewDataCount = count;
    };
  }

  ngOnInit(): void {
    this.getProfile();

    this.inactivityCheck = setInterval(() => this.checkInactivity(), INACTIVITY_CHECK_INTERVAL_MS);
    setTimeout(() => (this.isLoading = false), 5000);

    this.loadRealtimeCounts();
    this.fetchModules();
    this.loadUserData();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.name)),
      map(name => (name ? this._filter(name) : this.options.slice()))
    );
  }

  ngOnDestroy(): void {
    if (this.inactivityCheck) {
      clearInterval(this.inactivityCheck);
    }
    this.countsSubscription?.unsubscribe();
    this.chatUpdateSub?.unsubscribe();
  }

  @HostListener('document:click')
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  onUserAction(): void {
    this.lastActionTime = Date.now();
    this.idleRefreshCount = 0; // user is active again, allow future idle refresh
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  // Only refresh once after crossing the idle threshold, not every 30s forever.
  // The previous version reset lastActionTime on every tick, so it kept
  // re-triggering fetchModules()/loadUserData() every minute indefinitely
  // while the tab sat idle — unnecessary background traffic.
  checkInactivity(): void {
    const minutesInactive = (Date.now() - this.lastActionTime) / (1000 * 60);
    if (minutesInactive >= 1 && this.idleRefreshCount < MAX_IDLE_REFRESHES) {
      this.triggerRefresh();
      this.idleRefreshCount++;
    }
  }

  triggerRefresh(): void {
    this.isLoading = true;
    this.fetchModules();
    this.loadUserData();
    setTimeout(() => (this.isLoading = false), 3000);
  }

  refreshHomePage(): void {
    // Pick one: SPA navigation OR full reload, not both — chaining them
    // forces a full asset re-download right after a route change.
    this.router.navigate(['/homepage']);
  }

  getProfile(): void {
    this.cvService.getDataCV().subscribe({
      next: (res: any) => (this.profileservices = res.message),
      error: (err: any) => console.error('Error loading profile:', err)
    });
  }

  loadUserData(): void {
    this.profile.getProfileByUserOnly().subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.message;
        } else {
          this.error = 'Failed to load profile data';
        }
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching profile data';
      }
    });
  }

  async onHomeClick(): Promise<void> {
    this.sharedRoutines.onNewPostsDetected = (count: number) => {
      this.homeNewDataCount = count;
    };
  }

  // Guarded so repeated calls (e.g. from openChatxx) don't stack duplicate
  // socket listeners; subscription is now actually stored so ngOnDestroy can clean it up.
  loadRealtimeCounts(): void {
    if (!this.countsSubscription || this.countsSubscription.closed) {
      this.echoService.listenToNotificationCount();
      this.countsSubscription = this.echoService.notificationCount$.subscribe(count => {
        this.unreadCount = count;
        this.updateTitle(this.unreadCount);
      });
    }
  }

  updateTitle(count: number): void {
    this.titleService.setTitle(count > 0 ? `🔔 (${count}) Nexsuz` : 'Nexsuz');
  }

  openChat(notif?: any): void {
    this.chatDialogRef = this.dialog.open(ChatPopupComponent, {
      width: '500px',
      position: { bottom: '80px', right: '80px' },
      panelClass: 'custom-chat-popup',
      data: notif
    });
    this.chatDialogRef.afterClosed().subscribe(() => {});
  }

  openChatxx(): void {
    this.dialog.open(ChatPopupComponent, {
      width: '500px',
      position: { bottom: '80px', right: '20px' },
      panelClass: 'custom-chat-popup'
    });
    this.loadRealtimeCounts();
  }

  private _filter(name: string): User[] {
    return this.options.filter(option =>
      option.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.autoCloseSearch();
    }
  }

  closeSearchOnOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('search-overlay')) {
      this.toggleSearch();
    }
  }

  autoCloseSearch(): void {
    setTimeout(() => (this.isSearchOpen = false), 5000);
  }

  closeSearch(): void {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  clearSearch(): void {
    this.searchValue = '';
  }

  filterData(): void {
    this.filteredData = this.data.filter(item =>
      item.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  async fetchModules(): Promise<void> {
    this.isLoading = true;
    try {
      this.nav_module = await firstValueFrom(this.navigationService.getData());
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      this.isLoading = false;
    }
  }

  refreshMenu(icon: string): void {
    if (icon === 'home') {
      this.refreshingIcon = icon;
      setTimeout(() => (this.refreshingIcon = null), 2000);
    }
  }

  async refreshMenux(icon: string): Promise<void> {
    if (this.refreshingIcon === icon) return; // prevent repeat clicks
    this.refreshingIcon = icon;
    await this.fetchModules();
    setTimeout(() => (this.refreshingIcon = null), 1000);
  }

  sendData(): void {
    const requestBody = { name: 'John Doe', email: 'john@example.com' };
    this.navigationService.postData('submit-form', requestBody).subscribe({
      next: response => console.log('Form submitted successfully', response),
      error: error => console.error('Error submitting form:', error)
    });
  }

  onAddPost(): void {
    this.router.navigate(['/post/new']);
  }

  search(): void {
    if (!this.searchKeyword.trim()) return;
    console.log(this.searchKeyword);
    // this.router.navigate(['/search'], { queryParams: { q: this.searchKeyword } });
  }


  openNotifications(): void {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      minHeight: 'auto',
      maxHeight: '90vh',
      position: { top: '40px', right: '90px' },
      panelClass: 'custom-notification-popup'
    });
    dialogRef.afterClosed().subscribe(() => this.loadRealtimeCounts());
  }

  openSearch(): void {
    const role = this.sharedRoutines.getRole();
    this.router.navigate([`/${role}/search`]);
  }
}