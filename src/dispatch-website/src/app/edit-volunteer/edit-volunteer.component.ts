import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FtpRequestService } from '../ftp-request.service';
import { Location } from '@angular/common';
import { Volunteer } from '../volunteer';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-volunteer',
  templateUrl: './edit-volunteer.component.html',
  styleUrls: ['./edit-volunteer.component.css'],
  providers: [FtpRequestService]
})
export class EditVolunteerComponent implements OnInit {

  volunteer: Volunteer;
  errorMsg: string;
  states: string[] = ['Not Disabled', 'Disabled'];
  m_disabled: string;
  constructor(public route: ActivatedRoute,
  public ftpService: FtpRequestService,
  private location: Location,
  private router: Router) { }

  ngOnInit() {
    this.setup();
  }

  setup() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.setupTwo(id);
  }

  setupTwo(id) {
    this.ftpService.getVolunteer(id.toLocaleString()).subscribe(volunteer => {
      this.volunteer = volunteer;
      if (this.volunteer.disabled) {
        this.m_disabled = 'Disabled';
      }
    });
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

  updateVolunteer() {
    const uwo_id = this.volunteer.uwo_id;
    const first_name = this.volunteer.first_name;
    const last_name = this.volunteer.last_name;
    const id = this.volunteer.id;
    if (this.checkValid(this.volunteer.uwo_id) === true &&
    this.checkValid(this.volunteer.first_name) === true &&
    this.checkValid(this.volunteer.last_name) === true) {
      this.errorMsg = '';
      if (this.m_disabled === 'Not Disabled') {
        this.ftpService.updateVolunteer({uwo_id, first_name, last_name}, id).subscribe(() => {
          this.router.navigateByUrl('/volunteer-list');
        });
      } else if (this.m_disabled === 'Disabled') {
        const tr = true;
        this.ftpService.updateVolunteer({uwo_id, first_name, last_name, tr}, id).subscribe(() => {
          this.router.navigateByUrl('/volunteer-list');
        });
      } else {
        this.ftpService.updateVolunteer({uwo_id, first_name, last_name}, id).subscribe(() => {
          this.router.navigateByUrl('/volunteer-list');
        });
      }
      const data = {uwo_id, first_name, last_name};
    } else {
      this.errorMsg = 'Invalid characters detected. Please remove all special characters';
    }
  }

}
