import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent {

  filters = {
    jobType: '',
    experience: '',
    setup: '',
    salary: '',
    location: '',
    company: '',
    skills: ''
  };

  constructor(
    private dialogRef: MatDialogRef<AdvancedSearchComponent>
  ) {}

  clear() {

    this.filters = {
      jobType: '',
      experience: '',
      setup: '',
      salary: '',
      location: '',
      company: '',
      skills: ''
    };

  }

  search() {
    this.dialogRef.close(this.filters);
  }

}