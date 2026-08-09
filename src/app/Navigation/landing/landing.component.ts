import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChatWebsitePopUPComponent } from 'src/app/ComponentUI/messages/chat-website-pop-up/chat-website-pop-up.component';

export interface User {
  name: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  private readonly sectionIds = [
    'home-section',
    'about-section',
    'pricing-section',
    'jobs-section',
    'client-section'
  ];
  private readonly chatStorageKey = 'chatOpened';
  private readonly mobileBreakpoint = 768;

  fadeIn = false;
  isSidebarOpen = false;
  isMobile = false;
  activeSection = 'home-section';
  chatOpened = false;

  myControl = new FormControl();
  options: User[] = [
    { name: 'UX Designer' },
    { name: 'Software Engineer' },
    { name: 'Data Scientist' }
  ];
  filteredOptions!: Observable<User[]>;

  searchQuery = '';
  filteredData: string[] = [];
  data: string[] = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'UI/UX Designer',
    'Product Manager',
    'Project Manager',
    'System Administrator',
    'Cloud Engineer',
    'Database Administrator',
    'Quality Assurance Engineer',
    'Technical Support Specialist',
    'Business Analyst',
    'Network Engineer',
    'Security Engineer',
    'Web Developer',
    'Mobile Developer',
    'SEO Specialist',
    'Digital Marketing Manager',
    'Content Writer',
    'Graphic Designer',
    'Game Developer'
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {
    this.updateMobileState();
  }

  ngOnInit(): void {
    this.fadeIn = true;

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.name)),
      map(name => (name ? this._filter(name) : this.options.slice()))
    );

    const storedState = localStorage.getItem(this.chatStorageKey);
    this.chatOpened = storedState ? JSON.parse(storedState) : false;
  }

  // ============================================================
  // Scroll handling
  // ============================================================

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset + 120;

    for (const id of this.sectionIds) {
      const section = document.getElementById(id);
      if (!section) continue;

      if (
        scrollPosition >= section.offsetTop &&
        scrollPosition < section.offsetTop + section.offsetHeight
      ) {
        this.activeSection = id;
      }
    }
  }

  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();

    const el = document.getElementById(sectionId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // reflect the anchor in the address bar without triggering navigation or scroll jump
    const basePath = window.location.pathname + window.location.search;
    history.replaceState(null, '', `${basePath}#${sectionId}`);
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.updateMobileState();
  }

  private updateMobileState(): void {
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
  }

  // ============================================================
  // Autocomplete
  // ============================================================

  displayFn(user: User): string {
    return user?.name ?? '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  filterData(): void {
    this.filteredData = this.data.filter(item =>
      item.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // ============================================================
  // Sidebar / navigation
  // ============================================================

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  refreshHomePage(): void {
    this.router.navigate(['/homepage']).then(() => {
      window.location.reload();
    });
  }

  // ============================================================
  // Chat popup
  // ============================================================

  openChat(): void {
    const dialogRef = this.dialog.open(ChatWebsitePopUPComponent, {
      width: '450px',
      position: { bottom: '20px', right: '20px' },
      panelClass: 'custom-chat-popup'
    });

    this.chatOpened = true;
    localStorage.setItem(this.chatStorageKey, JSON.stringify(true));

    dialogRef.afterClosed().subscribe(() => {
      this.chatOpened = false;
      localStorage.setItem(this.chatStorageKey, JSON.stringify(false));
    });
  }

  closeChat(): void {
    this.chatOpened = false;
    localStorage.setItem(this.chatStorageKey, JSON.stringify(false));
  }
}