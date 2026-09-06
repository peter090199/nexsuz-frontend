import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contactsection',
  templateUrl: './contactsection.component.html',
  styleUrls: ['./contactsection.component.css']
})
export class ContactsectionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  contactModel = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;

  onContactSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;

    // Replace with your actual API call, e.g.:
    // this.contactService.sendMessage(this.contactModel).subscribe({
    //   next: () => { ... },
    //   error: () => { ... }
    // });

    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactModel = { fullName: '', email: '', phone: '', subject: '', message: '' };
    }, 1200);
  }

}
