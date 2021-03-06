import { Component, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { FtpRequestService } from '../ftp-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-volunteer',
  templateUrl: './add-volunteer.component.html',
  styleUrls: ['./add-volunteer.component.css'],
  providers: [FtpRequestService]
})
export class AddVolunteerComponent implements OnInit {
  uwo_id: string;
  first_name: string;
  last_name: string;
  m_disabled: string;
  readonly states: string[]= ['Not Disabled', 'Disabled'];
  errorMsg: string;

  constructor(public ftpService: FtpRequestService, public router: Router) {
    this.m_disabled = this.states[0];
  }

  ngOnInit() {
  }

  checkValid(input: string ): boolean {
    const regVal = /[^A-Za-z0-9]/;
    const regWhi = new RegExp('\\s', 'g');
    let charCheck = false;
    input = input.toLowerCase();
    charCheck = charCheck || regVal.test(input);
    charCheck = !charCheck;
    return charCheck;
  }

  submit() {
    const uwo_id = this.uwo_id;
    const first_name = this.first_name;
    const last_name = this.last_name;
    if (this.checkValid(this.uwo_id) === true && this.checkValid(this.first_name) === true && this.checkValid(this.last_name) === true) {
      const disabled = this.m_disabled === this.states[1];
      this.errorMsg = '';
      this.ftpService.createNewVolunteer({uwo_id, first_name, last_name, disabled}).subscribe(() => {
        this.router.navigateByUrl('/volunteer-list');
      });
    } else {
      this.errorMsg = 'Invalid characters detected. Please remove all special characters';
    }
  }
}
