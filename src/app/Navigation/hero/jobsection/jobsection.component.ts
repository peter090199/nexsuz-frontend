import { Component, OnInit } from '@angular/core';

interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  typeClass: string;
  image: string;
}

@Component({
  selector: 'app-jobsection',
  templateUrl: './jobsection.component.html',
  styleUrls: ['./jobsection.component.css']
})
export class JobsectionComponent implements OnInit {

  // Search text
  searchText: string = '';

  // Job list
  jobs: Job[] = [
    {
      title: 'Senior Laravel Developer',
      company: 'Tech Solutions Inc.',
      location: 'Cebu City, Philippines',
      salary: '₱60,000 - ₱90,000',
      type: 'Full Time',
      typeClass: 'full-time',
      image: 'assets/images/company1.png'
    },
    {
      title: 'Angular Frontend Developer',
      company: 'NexTech Solutions',
      location: 'Remote',
      salary: '₱50,000 - ₱80,000',
      type: 'Remote',
      typeClass: 'remote',
      image: 'assets/images/company2.png'
    },
    {
      title: 'UI / UX Designer',
      company: 'Creative Studio',
      location: 'Manila',
      salary: '₱35,000 - ₱55,000',
      type: 'Hybrid',
      typeClass: 'hybrid',
      image: 'assets/images/company3.png'
    },
    {
      title: 'Marketing Specialist',
      company: 'Digital Marketing Hub',
      location: 'Davao City',
      salary: '₱30,000 - ₱45,000',
      type: 'Part Time',
      typeClass: 'part-time',
      image: 'assets/images/company4.png'
    },
    {
      title: 'Software Engineer Intern',
      company: 'Future Labs',
      location: 'Makati City',
      salary: '₱15,000 Allowance',
      type: 'Internship',
      typeClass: 'internship',
      image: 'assets/images/company5.png'
    },
    {
      title: 'HR Officer',
      company: 'Global Business Corp.',
      location: 'Quezon City',
      salary: '₱28,000 - ₱40,000',
      type: 'Full Time',
      typeClass: 'full-time',
      image: 'assets/images/company6.png'
    }
  ];

  // Filtered jobs
  filteredJobs: Job[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filteredJobs = [...this.jobs];
  }

  // Live search
  onSearch(): void {

    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.filteredJobs = [...this.jobs];
      return;
    }

    this.filteredJobs = this.jobs.filter(job =>
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.location.toLowerCase().includes(keyword) ||
      job.type.toLowerCase().includes(keyword)
    );
  }

  // Search button
  search(): void {
    this.onSearch();
    console.log('Searching:', this.searchText);
  }

  // Enter key
  onEnter(): void {
    this.onSearch();
  }

  // Clear search
  clearSearch(): void {
    this.searchText = '';
    this.filteredJobs = [...this.jobs];
  }

  // Select job
  selectJob(job: Job): void {
    this.searchText = job.title;
    this.onSearch();
    console.log('Selected Job:', job);
  }

}