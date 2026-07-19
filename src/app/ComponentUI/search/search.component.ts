// import { Component, OnInit } from '@angular/core';
// import { SearchService } from 'src/app/services/search.service';
// import { SearchModalComponent } from './search-modal/search-modal.component';
// import { MatDialog } from '@angular/material/dialog';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatTableDataSource } from '@angular/material/table';
// import { SearchHistoryService } from 'src/app/services/Search/search-history.service';
// import { AuthService } from 'src/app/services/auth.service';
// import { NotificationsService } from 'src/app/services/Global/notifications.service';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
// import { FeatureService } from 'src/app/services/AccountPlan/feature.service';

// @Component({
//   selector: 'app-search',
//   templateUrl: './search.component.html',
//   styleUrls: ['./search.component.css']
// })
// export class SearchComponent implements OnInit {

//   // ================= DATA =================
//   users: any[] = [];
//   searchHistory: any[] = [];

//   searchQuery: string = '';
//   isLoading: boolean = false;

//   currentUserCode: any;

//   dataSource = new MatTableDataSource<any>([]);

//   // ================= RXJS =================
//   private searchSubject = new Subject<string>();

//   constructor(
//     private userService: SearchService, public feature: FeatureService,
//     private dialog: MatDialog, public sharedRoutines: SharedRoutinesService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private searchHistoryService: SearchHistoryService,
//     private authService: AuthService,
//     private notificationsService: NotificationsService,
//     public sharedService: SharedRoutinesService
//   ) { }

//   // ================= INIT =================
//   ngOnInit(): void {

//     this.currentUserCode = this.authService.getAuthCode();

//     this.loadHistory();

//     // URL sync
//     this.route.queryParams.subscribe(params => {
//       this.searchQuery = params['search'] || '';
//       this.searchSubject.next(this.searchQuery);
//     });

//     // debounce search
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(query => {
//       this.fetchUsers(query);
//     });
//   }

//   // ================= SEARCH INPUT =================
//   onSearch(): void {
//     const query = this.searchQuery.trim();

//     if (!query) {
//       this.users = [];
//       this.loadHistory();
//       return;
//     }

//     this.searchSubject.next(query);
//   }

//   // ================= API SEARCH =================
//   fetchUsers(query: string): void {

//     if (!query) {
//       this.users = [];
//       return;
//     }

//     this.userService.searchUsers(query).subscribe({
//       next: (res: any) => {

//         this.users = [
//           ...(Array.isArray(res?.online) ? res.online : []),
//           ...(Array.isArray(res?.offline) ? res.offline : [])
//         ];

//       },
//       error: () => {
//         this.users = [];
//       }
//     });
//   }

//   // ================= HISTORY =================
//   // ================= HISTORY =================
//   loadHistory(): void {
//     this.searchHistoryService.getSearchHistory().subscribe({
//       next: (res: any) => {
//         const raw = Array.isArray(res?.data) ? res.data : [];

//         // Normalize: support both a flat user shape and a nested
//         // { viewed: {...} } log-record shape from the backend.
//         this.searchHistory = raw.map((item: any) => item?.viewed ?? item);
//       },
//       error: () => {
//         this.searchHistory = [];
//       }
//     });
//   }

//   // ================= HISTORY CLICK =================
//   searchFromHistory(user: any): void {
//     this.router.navigate(this.sharedService.getProfileRouteAll(user));
//   }

//   trackByCode(_index: number, item: any): any {
//     return item?.code ?? item?.viewed_code ?? _index;
//   }

//   // ================= CLEAR SEARCH =================
//   clearSearch(): void {
//     this.searchQuery = '';
//     this.users = [];

//     this.router.navigate([], {
//       queryParams: { search: null },
//       queryParamsHandling: 'merge'
//     });
//   }

//   // ================= HISTORY CLICK =================
//   // searchFromHistory(query: string): void {
//   //   this.searchQuery = query;
//   //   this.onSearch();
//   // }

//   // ================= VIEW USER =================
//   onViewUser(user: any): void {

//     const payload = {
//       viewer_code: this.currentUserCode,
//       viewed_code: user.code,
//       activity_type: 'view'
//     };

//     this.searchHistoryService.saveSearch(payload).subscribe({
//       next: () => this.loadHistory(),
//       error: (err) => console.error('View log error:', err)
//     });
//   }

//   // ================= MODAL =================
//   openUserModal(user: any): void {
//     this.dialog.open(SearchModalComponent, {
//       width: '900px',
//       data: user
//     });
//   }

//   // ================= CLEAR HISTORY =================
//   clearHistory(): void {

//     const msg =
//       'Your search history is private. Are you sure you want to clear it?';

//     this.notificationsService.popupWarning('', msg).then((res: any) => {

//       if (res?.value) {

//         this.isLoading = true;

//         this.searchHistoryService.clearHistory().subscribe({
//           next: (r: any) => {
//             this.notificationsService.toastrSuccess(r?.message || 'Cleared');
//             this.searchHistory = [];
//             this.isLoading = false;
//           },
//           error: (err: any) => {
//             this.notificationsService.toastrError('Failed to clear history');
//             this.isLoading = false;
//           }
//         });

//       }

//     });
//   }
// }




import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { SearchHistoryService } from 'src/app/services/Search/search-history.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SharedRoutinesService } from 'src/app/services/Function/shared-routines.service';
import { FeatureService } from 'src/app/services/AccountPlan/feature.service';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';

type StatusFilter = 'all' | 'online' | 'offline';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  // ================= DATA =================
  users: any[] = [];          // filtered, rendered list
  allUsers: any[] = [];       // full unfiltered result set for current query
  searchHistory: any[] = [];

  searchQuery: string = '';
  isLoading: boolean = false;

  currentUserCode: any;

  dataSource = new MatTableDataSource<any>([]);

  // ================= FILTERS =================
  statusFilter: StatusFilter = 'all';
  jobFilter: string = 'all';
  jobTitles: any[] = [
    'Software Engineer',
    'Product Designer',
    'Marketing Manager',
    'Data Analyst',
    'Registered Nurse',
    'Sales Executive',
    'Civil Engineer',
    'Teacher'
  ];
  // ================= RXJS =================
  private searchSubject = new Subject<string>();

  constructor(
    private userService: SearchService, public feature: FeatureService,
    private dialog: MatDialog, public sharedRoutines: SharedRoutinesService,
    private route: ActivatedRoute,
    private router: Router,
    private searchHistoryService: SearchHistoryService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    public sharedService: SharedRoutinesService
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    this.currentUserCode = this.authService.getAuthCode();
    this.loadHistory();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.searchSubject.next(this.searchQuery);
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.fetchUsers(query);
    });
  }

  openFilters() {
    const dialogRef = this.dialog.open(AdvancedSearchComponent, {
      width: '600px',
      minHeight: 'auto',
      maxHeight: '90vh',
      position: { top: '40px', right: '90px' },
      panelClass: 'custom-notification-popup',
    });
    dialogRef.afterClosed().subscribe(() => {
      //  this.loadRealtimeCounts();
    });
  }



  // ================= SEARCH INPUT =================
  onSearch(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      this.resetResults();
      this.loadHistory();
      return;
    }
    this.loadHistory();
    this.searchSubject.next(query);
  }

  // ================= API SEARCH =================
  fetchUsers(query: string): void {
    if (!query) {
      this.resetResults();
      return;
    }

    this.userService.searchUsers(query).subscribe({
      next: (res: any) => {
        const online = (Array.isArray(res?.online) ? res.online : [])
          .map((u: any) => ({ ...u, _status: 'online' }));
        const offline = (Array.isArray(res?.offline) ? res.offline : [])
          .map((u: any) => ({ ...u, _status: 'offline' }));

        this.allUsers = [...online, ...offline];
        this.jobTitles = this.extractJobTitles(this.allUsers);

        // Reset filters on a fresh query so old chips don't silently hide new results
        this.statusFilter = 'all';
        this.jobFilter = 'all';

        this.applyFilters();
      },
      error: () => {
        this.resetResults();
      }
    });
  }

  // ================= FILTERS =================
  private extractJobTitles(list: any[]): string[] {
    const titles = list
      .map(u => (u?.job_title || '').trim())
      .filter(Boolean);
    return Array.from(new Set(titles)).sort();
  }

  setStatusFilter(status: StatusFilter): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  setJobFilter(job: string): void {
    this.jobFilter = job;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.users = this.allUsers.filter(u => {
      const matchesStatus = this.statusFilter === 'all' || u._status === this.statusFilter;
      const matchesJob = this.jobFilter === 'all' || u.job_title === this.jobFilter;
      return matchesStatus && matchesJob;
    });
  }

  private resetResults(): void {
    this.users = [];
    this.allUsers = [];
    this.jobTitles = [];
    this.statusFilter = 'all';
    this.jobFilter = 'all';
  }

  // ================= HISTORY =================
  loadHistory(): void {
    this.searchHistoryService.getSearchHistory().subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res?.data) ? res.data : [];
        this.searchHistory = raw.map((item: any) => item?.viewed ?? item);
      },
      error: () => {
        this.searchHistory = [];
      }
    });
  }

  // ================= CLEAR SEARCH =================
  clearSearch(): void {
    this.searchQuery = '';
    this.resetResults();

    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
  }

  // ================= HISTORY CLICK =================
  searchFromHistory(user: any): void {
    this.router.navigate(this.sharedService.getProfileRouteAll(user));
  }

  // ================= VIEW USER =================
  onViewUser(user: any): void {
    const payload = {
      viewer_code: this.currentUserCode,
      viewed_code: user.code,
      activity_type: 'view'
    };

    this.searchHistoryService.saveSearch(payload).subscribe({
      next: () => this.loadHistory(),
      error: (err) => console.error('View log error:', err)
    });
  }

  // ================= MODAL =================
  openUserModal(user: any): void {
    this.dialog.open(SearchModalComponent, {
      width: '900px',
      data: user
    });
  }

  // ================= CLEAR HISTORY =================
  clearHistory(): void {
    const msg = 'Your search history is private. Are you sure you want to clear it?';

    this.notificationsService.popupWarning('', msg).then((res: any) => {
      if (res?.value) {
        this.isLoading = true;

        this.searchHistoryService.clearHistory().subscribe({
          next: (r: any) => {
            this.notificationsService.toastrSuccess(r?.message || 'Cleared');
            this.searchHistory = [];
            this.isLoading = false;
          },
          error: (err: any) => {
            this.notificationsService.toastrError('Failed to clear history');
            this.isLoading = false;
          }
        });
      }
    });
  }

  trackByCode(_index: number, item: any): any {
    return item?.code ?? item?.viewed_code ?? _index;
  }
}