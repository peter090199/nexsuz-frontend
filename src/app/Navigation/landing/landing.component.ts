import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly sectionIds = [
    'home-section',
    'about-section',
    'pricing-section',
    'jobs-section',
    'client-section'
  ];
  private readonly chatStorageKey = 'chatOpened';
  private readonly mobileBreakpoint = 768;
  private readonly scrollTopThreshold = 300;
  private readonly sectionOffset = 120;

  @ViewChild('pageContent') pageContentRef?: ElementRef<HTMLElement>;
  private scrollContainer: HTMLElement | null = null;
  private scrollTicking = false;

  fadeIn = false;
  isSidebarOpen = false;
  isMobile = false;
  activeSection = 'home-section';
  chatOpened = false;
  showScrollTop = false;

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

  ngAfterViewInit(): void {
    // .page-content is the actual scrolling element (mat-sidenav-content),
    // not window — grab a direct reference instead of relying on the template event.
    this.scrollContainer = this.pageContentRef?.nativeElement
      ?? document.querySelector('.page-content');
  }

  ngOnDestroy(): void {
    // no manual subscriptions to tear down; kept for future use (e.g. if a
    // fromEvent/RxJS scroll stream is introduced later)
  }

  // ============================================================
  // Scroll handling
  // ============================================================

  onPageScroll(event: Event): void {
    // rAF-throttle so we update state at most once per frame, regardless of
    // how many scroll events fire.
    if (this.scrollTicking) return;
    this.scrollTicking = true;

    requestAnimationFrame(() => {
      const target = (event.target as HTMLElement) ?? this.scrollContainer;
      if (target) {
        this.showScrollTop = target.scrollTop > this.scrollTopThreshold;
        this.updateActiveSection(target.scrollTop);
      }
      this.scrollTicking = false;
    });
  }

  private updateActiveSection(scrollTop: number): void {
    const scrollPosition = scrollTop + this.sectionOffset;

    for (const id of this.sectionIds) {
      const section = document.getElementById(id);
      if (!section) continue;

      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPosition >= top && scrollPosition < bottom) {
        this.activeSection = id;
        break;
      }
    }
  }

  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();

    const el = document.getElementById(sectionId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSection = sectionId;

    // reflect the anchor in the address bar without triggering navigation or scroll jump
    const basePath = window.location.pathname + window.location.search;
    history.replaceState(null, '', `${basePath}#${sectionId}`);
  }

  scrollToTop(): void {
    this.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
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