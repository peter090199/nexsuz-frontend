import { Component, HostListener, OnInit } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/app/AuthGuard/auth.guard';
import { TNavigationService } from 'src/app/services/TNavigation/tnavigation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  fadeIn: boolean = false;
  isSidebarOpen = false; // Sidebar state
  isDesktop: boolean = true;
  isMobile: boolean = false; // Mobile detection state
  nav_module: any=[]; // Store user data fetched from API
  submenuMenu!: MatMenuPanel<any>;
  searchValue = '';
  isLoading:boolean = false;
  success:boolean = false;

 
  constructor(
    private authService: AuthGuard,
    private navigationService: TNavigationService // Inject the TNavigationService
  ) {
    this.updateMobileState(); // Set initial state
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateMobileState();
  }

  updateMobileState() {
    this.isMobile = window.innerWidth <= 768; // Adjust this breakpoint as needed
  }

  ngOnInit(): void {
  }

  async getModule(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.navigationService.getData());
  
      if (response) {
        this.success = true;
        this.nav_module = response;
      } else {
        this.success = false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
