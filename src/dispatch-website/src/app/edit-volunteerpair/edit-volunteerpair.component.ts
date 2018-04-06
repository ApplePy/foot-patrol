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
  }

  updatePair() {
    if (this.pairState === 'Active') {this.pair.active = true; }
    if (this.pairState === 'Inactive') {this.pair.active = false; }
      this.ftpService.toggleActiveVolunteerPair(this.pair.id, this.pair.active).subscribe((data) => {
        this.router.navigateByUrl('/volunteer-list');
      },
      (error) => {
        if (error.status === 409) {
          this.errorMsg = 'ERROR: One of these volunteers is already in an active pair. Deactivate the existing pair to proceed';
        }
      });
  }
}
