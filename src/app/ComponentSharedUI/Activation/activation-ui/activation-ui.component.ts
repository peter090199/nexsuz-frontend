import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivationService } from 'src/app/services/Activation/activation.service';

@Component({
  selector: 'app-activation-ui',
  templateUrl: './activation-ui.component.html',
  styleUrls: ['./activation-ui.component.css']
})
export class ActivationUIComponent implements OnInit {

  isLoading: boolean= false;
  activationForm!: FormGroup; // Define the form group properly
  email: string = '';
  code: string = '';
  constructor(private fb: FormBuilder,private notificationsService:NotificationsService,
    private router:Router,  private route: ActivatedRoute,private activation:ActivationService

  ) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.paramMap.get('email') || '';
    
    this.activationForm = this.fb.group({
      code: [''],

    });
  }
  errorMessage:string='';
  
  onSubmit() {
    if (this.activationForm.valid) {
      const { email, code } = this.activationForm.value;
    const payload = {
      email : this.email, // Use the destructured value
      code   // Use the destructured value
    };
  
      console.log(payload)
      // Call the reset password service
      this.activation.activate(payload).subscribe(
        (res) => {
          console.log(res.value)
          if (res.success)
          {
            this.isLoading = true;
            this.notificationsService.toastrSuccess(res.message);
            this.router.navigate(['/signInUI']);
          }
          else
          {
            this.notificationsService.toastrWarning(res.message);
            this.isLoading = false;
          }
          
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
          this.notificationsService.toastrError(this.errorMessage);
          // Check if the error message indicates an expired link
          // if (this.errorMessage.includes('expired')) {
          //   this.openExpiredLinkDialog();
          // }
        }
      );
      }
    }
}
