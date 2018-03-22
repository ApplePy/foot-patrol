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
    this.ftpService.getSpecificVolunteerPair(id.toLocaleString()).subscribe(pair => {
      this.pair = pair;
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
    this.pair.volunteers = [this.volunteerONE, this.volunteerTWO];
     if (this.pair.volunteers[1].id === this.pair.volunteers[0].id) {
      this.errorMsg = 'ERROR: The volunteers in the pair must be different';
     } else if (this.pair.volunteers[0].id > this.pair.volunteers[1].id) {
       // if the volunteer ids are not in ascending order, swap the volunteers
      const temp = this.pair.volunteers[0];
      this.pair.volunteers[0] = this.pair.volunteers[1];
      this.pair.volunteers[1] = temp;

      this.sendPair();
     } else {
      this.sendPair();
     }
  }

  sendPair() {
    this.errorMsg = '';
    if (this.pairState === 'Active') {this.pair.active = true; }
    if (this.pairState === 'Inactive') {this.pair.active = false; }
    // I don't know why I had this here, if everything works it should be removed
    // this.ftpService.toggleActiveVolunteerPair(this.pair.id, this.pair.active).subscribe();
    this.ftpService.createNewVolunteerPair(this.pair.volunteers, this.pair.active).subscribe(() =>
      this.router.navigateByUrl('/volunteer-list')
    );


  }
}
