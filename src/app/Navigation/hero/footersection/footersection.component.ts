import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footersection',
  templateUrl: './footersection.component.html',
  styleUrls: ['./footersection.component.css']
})
export class FootersectionComponent implements OnInit {
  currentYear = new Date().getFullYear();
  activeSection = 'home-section';
  constructor() { }

  ngOnInit(): void {
  }


  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSection = sectionId;
    const basePath = window.location.pathname + window.location.search;
    history.replaceState(null, '', `${basePath}#${sectionId}`);
  }
}
