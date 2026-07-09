// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-search-modal',
//   templateUrl: './search-modal.component.html',
//   styleUrls: ['./search-modal.component.css']
// })
// export class SearchModalComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }



import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css']
})

export class SearchModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public user: any
  ) { }

  closeModal(): void {
    this.dialogRef.close();
  }

  searchKeyword = '';
  users: any[] = [
    { fullname: 'John Doe', skills: 'JavaScript, Angular', status: 'Active' },
    { fullname: 'Jane Smith', skills: 'Python, Django', status: 'Inactive' },
    { fullname: 'Alice Johnson', skills: 'Java, Spring Boot', status: 'Active' },
    { fullname: 'Bob Brown', skills: 'C#, .NET', status: 'Inactive' },
  ];

  filteredUsers = [...this.users];

  searchUsers() {
    const keyword = this.searchKeyword.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fullname.toLowerCase().includes(keyword) ||
      user.skills.toLowerCase().includes(keyword) ||
      user.status.toLowerCase().includes(keyword)
    );

  }

  clearSearch() {
    this.searchKeyword = '';
    this.filteredUsers = [...this.users];
  }

  selectUser(user: any) {
    console.log(user);
  }

}
