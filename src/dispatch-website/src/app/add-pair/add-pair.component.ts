import { Component, OnInit } from '@angular/core';
import { FtpRequestService } from '../ftp-request.service';
import { Volunteer } from '../volunteer';
import { VolunteerPair } from '../volunteer-pair';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-pair',
  templateUrl: './add-pair.component.html',
  styleUrls: ['./add-pair.component.css']
})
export class AddPairComponent implements OnInit {

  constructor(public ftpService: FtpRequestService, private router: Router) { }

  volunteers: Volunteer[ ];
  pair: VolunteerPair;
  volunteerONE: Volunteer;
  volunteerTWO: Volunteer;
  pairState: string;

  errorMsg: string;

  ngOnInit() {
    this.setup();
  }

  setup() {
    this.ftpService.getAllVolunteers().subscribe(volunteers => {
      this.volunteers = [];
        for (let i = 0; i < volunteers.volunteers.length; i++) {
          this.volunteers[i] = volunteers.volunteers[i];
        }
    });
    this.pairState = 'Active';
    this.pair = new VolunteerPair();
  }

  createPair() {
    this.pair.volunteers = [this.volunteerONE, this.volunteerTWO];
    if (this.pair.volunteers[0] === undefined || this.pair.volunteers[1] === undefined) {
      this.errorMsg = 'ERROR: All fields must have values';
    } else if (this.pair.volunteers[1].id === this.pair.volunteers[0].id) {
      this.errorMsg = 'ERROR: The volunteers in the pair must be different';
     } else if (this.pair.volunteers[0].id > this.pair.volunteers[1].id) {
       // if the volunteer ids are not in ascending order, swap the volunteers

       const temp = this.pair.volunteers[0];
      this.pair.volunteers[0] = this.pair.volunteers[1];
      this.pair.volunteers[1] = temp;

      let tick = true;
          // check all existing pairs for duplicates to prevent 500 error
    this.ftpService.getVolunteerPairs(true).subscribe(pairs => {
      pairs.pairs.forEach(element => {
        if (element.volunteers[0].id === this.pair.volunteers[0].id && element.volunteers[1].id === this.pair.volunteers[1].id) {
          tick = false;
        }
      });
      if (tick) {
        this.sendPair();
      } else {
        this.errorMsg = 'ERROR: this pairing already exists. To reactivate this specific pairing, please set it\'s state to ACTIVE';
      }
    });
     } else {

      let tick = true;
          // check all existing pairs for duplicates to prevent 500 error
    this.ftpService.getVolunteerPairs(true).subscribe(pairs => {
      pairs.pairs.forEach(element => {
        if (element.volunteers[0].id === this.pair.volunteers[0].id && element.volunteers[1].id === this.pair.volunteers[1].id) {
          tick = false;
        }
      });
      if (tick) {
        this.sendPair();
      } else {
        this.errorMsg = 'ERROR: this pairing already exists. To reactivate this specific pairing, please set it\'s state to ACTIVE';
      }
    });
     }
  }

  private sendPair() {

    // this.ftpService.errorMsg = '';
    if (this.pairState === 'Active') {this.pair.active = true; }
    if (this.pairState === 'Inactive') {this.pair.active = false; }

    // this.ftpService.toggleActiveVolunteerPair(this.pair.id, this.pair.active).subscribe();
    this.ftpService.createNewVolunteerPair([this.pair.volunteers[0].id, this.pair.volunteers[1].id], this.pair.active).subscribe(() =>
      this.router.navigateByUrl('/volunteer-list')
    );
  }

}
