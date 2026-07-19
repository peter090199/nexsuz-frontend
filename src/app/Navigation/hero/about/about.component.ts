import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit {

  ngAfterViewInit(): void {

    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }

      });

    }, {
      threshold: 0.2
    });

    reveals.forEach(item => observer.observe(item));

  }

}