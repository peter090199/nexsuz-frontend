import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-logo',
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.css']
})
export class AppLogoComponent implements OnInit {

  constructor( private router: Router) { }

  ngOnInit(): void {
  }

  refreshHomePage() {
    this.router.navigate(['/DEF-USERS/home']).then(() => {
      window.location.reload();
    });
  }

}
