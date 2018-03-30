import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { FtpRequestService } from '../ftp-request.service';
import { Volunteer } from '../volunteer';
import { VolunteerPair } from '../volunteer-pair';

@Component({
  selector: 'app-edit-volunteerpair',
  templateUrl: './edit-volunteerpair.component.html',
  styleUrls: ['./edit-volunteerpair.component.css']
})
export class EditVolunteerpairComponent implements OnInit {

  pair: VolunteerPair;
  OGpair: VolunteerPair = new VolunteerPair;
  volunteers: Volunteer[];
  volunteerONE: Volunteer;
  volunteerTWO: Volunteer;

  errorMsg: string;
  pairState: string;

  constructor(public route: ActivatedRoute,
    public ftpService: FtpRequestService,
    private location: Location,
    private router: Router) { }

  ngOnInit() {
    this.setup();
  }
  // this is split up like this becuase at my current level of angular testing expertise,
  // I don't know how to test or spyOn the one line of code in setup
  setup() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.setupTwo(id);
  }
  setupTwo(id) {
    this.OGpair.volunteers = [];
    this.ftpService.getSpecificVolunteerPair(id.toLocaleString()).subscribe(pair => {
      this.pair = pair;
      this.OGpair.volunteers[0] = this.pair.volunteers[0];
      this.OGpair.volunteers[1] = this.pair.volunteers[1];
      if (this.pair.active) {this.pairState = 'Active'; } else {this.pairState = 'Inactive'; }
    });
    this.ftpService.getAllActiveVolunteers().subscribe(volunteers => {
      this.volunteers = [];
      for (let i = 0; i < volunteers.volunteers.length; i++) {
        this.volunteers[i] = volunteers.volunteers[i];
      }
  });
  }

  updatePair() {
    let go = true;
    if (this.volunteerONE === undefined || this.volunteerTWO === undefined) {
      this.errorMsg = 'ERROR: All fields must have values';
      go = false;
    } else {
      this.pair.volunteers = [this.volunteerONE, this.volunteerTWO];
    }
    if (go) {
      if (this.pair.volunteers[1].id === this.pair.volunteers[0].id) {
        this.errorMsg = 'ERROR: The volunteers in the pair must be different';
      } else if (this.pair.volunteers[0].id > this.pair.volunteers[1].id) {


          // if the volunteer ids are not in ascending order, swap the volunteers
          const temp = this.pair.volunteers[0];
          this.pair.volunteers[0] = this.pair.volunteers[1];
          this.pair.volunteers[1] = temp;

          let tick = true;
              // check all existing pairs for duplicates to prevent 500 error
          this.ftpService.getVolunteerPairs().subscribe(pairs => {
            pairs.pairs.forEach(element => {
              if (element.volunteers[0].id === this.pair.volunteers[0].id && element.volunteers[1].id === this.pair.volunteers[1].id) {
                tick = false;
              }
            });
            if (tick) {
              this.sendPair();
            } else {
              this.pair.volunteers[0] = this.OGpair.volunteers[0];
              this.pair.volunteers[1] = this.OGpair.volunteers[1];
              this.errorMsg = "ERROR: this pairing already exists. To reactivate the other pairing, please set it's state to ACTIVE";
            }
          });
        } else {
          let tick = true;
          // check all existing pairs for duplicates to prevent 500 error
    this.ftpService.getVolunteerPairs().subscribe(pairs => {
      pairs.pairs.forEach(element => {
        if (element.volunteers[0].id === this.pair.volunteers[0].id && element.volunteers[1].id === this.pair.volunteers[1].id) {
          tick = false;
        }
      });
      if (tick) {
        this.sendPair();
      } else {
        this.pair = this.OGpair;
        this.errorMsg = "ERROR: this pairing already exists. To reactivate the other pairing, please set it's state to ACTIVE";
      }
    });
      }
    }
  }

  sendPair() {
    this.errorMsg = '';
    if (this.pairState === 'Active') {this.pair.active = true; }
    if (this.pairState === 'Inactive') {this.pair.active = false; }
    this.ftpService.toggleActiveVolunteerPair(this.pair.id, this.pair.active).subscribe(); // disable old pair
    this.ftpService.createNewVolunteerPair([this.pair.volunteers[0].id, this.pair.volunteers[1].id], this.pair.active).subscribe(() =>
      this.router.navigateByUrl('/volunteer-list')
    );
  }
}
