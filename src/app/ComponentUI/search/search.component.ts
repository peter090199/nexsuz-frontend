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

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  // ================= DATA =================
  users: any[] = [];
  searchHistory: any[] = [];

  searchQuery: string = '';
  isLoading: boolean = false;

  currentUserCode: any;

  dataSource = new MatTableDataSource<any>([]);

  // ================= RXJS =================
  private searchSubject = new Subject<string>();

  constructor(
    private userService: SearchService,public feature:FeatureService,
    private dialog: MatDialog,public sharedRoutines: SharedRoutinesService,
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

    // URL sync
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.searchSubject.next(this.searchQuery);
    });

    // debounce search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.fetchUsers(query);
    });
  }

  // ================= SEARCH INPUT =================
  onSearch(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      this.users = [];
      this.loadHistory();
      return;
    }

    this.searchSubject.next(query);
  }

  // ================= API SEARCH =================
  fetchUsers(query: string): void {

    if (!query) {
      this.users = [];
      return;
    }

    this.userService.searchUsers(query).subscribe({
      next: (res: any) => {

        this.users = [
          ...(Array.isArray(res?.online) ? res.online : []),
          ...(Array.isArray(res?.offline) ? res.offline : [])
        ];

      },
      error: () => {
        this.users = [];
      }
    });
  }

  // ================= HISTORY =================
  loadHistory(): void {
    this.searchHistoryService.getSearchHistory().subscribe({
      next: (res: any) => {
        this.searchHistory = Array.isArray(res?.data) ? res.data : [];
      },
      error: () => {
        this.searchHistory = [];
      }
    });
  }

  // ================= CLEAR SEARCH =================
  clearSearch(): void {
    this.searchQuery = '';
    this.users = [];

    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
  }

  // ================= HISTORY CLICK =================
  searchFromHistory(query: string): void {
    this.searchQuery = query;
    this.onSearch();
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

    const msg =
      'Your search history is private. Are you sure you want to clear it?';

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
}