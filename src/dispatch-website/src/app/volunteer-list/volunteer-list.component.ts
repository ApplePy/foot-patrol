import { Component, OnInit } from '@angular/core';
import {FtpRequestService} from '../ftp-request.service';
import {Volunteer} from '../volunteer';
import {FormControl, FormGroup} from '@angular/forms';
import {VolunteerPair} from '../volunteer-pair';
import {Router} from '@angular/router';
import * as Moment from 'moment';

@Component({
  selector: 'app-volunteer-list',
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css'],
  providers: [FtpRequestService]
})
export class VolunteerListComponent implements OnInit {
  displayVolunteers: Volunteer[] = [];
  volunteerPairs: DisplayPair[] = [];
  m_inactive: 'inactive';
  m_active: 'active';

  constructor(public ftpService: FtpRequestService, private router: Router) { }

  ngOnInit() {
    this.setup();
  }
  /**
   * Setup function is separate for testing
   */
  setup() {
    this.changePairView('active');
    this.changeVolunteerView('all');
  }

  changePairView(view) {
    this.volunteerPairs.length = 0;
    if (view === 'active') {
      this.ftpService.getVolunteerPairs().subscribe(pairs => {
        this.volunteerPairs = [];
        for (let i = 0; i < pairs.pairs.length; i++) {
          this.volunteerPairs[i] = new DisplayPair;
          this.volunteerPairs[i].pair = pairs.pairs[i];
          if (pairs.pairs[i].active) {
            this.volunteerPairs[i].state = 'ACTIVE';
          } else {
            this.volunteerPairs[i].state = 'INACTIVE';
          }
        }
      });
    } else if (view === 'all') {
      this.ftpService.getVolunteerPairs(true).subscribe(pairs => {
        this.volunteerPairs = [];
        for (let i = 0; i < pairs.pairs.length; i++) {
          this.volunteerPairs[i] = new DisplayPair;
          this.volunteerPairs[i].pair = pairs.pairs[i];
          if (pairs.pairs[i].active) {
            this.volunteerPairs[i].state = 'ACTIVE';
          } else {
            this.volunteerPairs[i].state = 'INACTIVE';
          }
        }
      });
    }
  }

  changeVolunteerView(view) {
    this.displayVolunteers.length = 0;
    if (view === 'all') {
      this.ftpService.getAllVolunteers().subscribe(volunteers => {
        this.displayVolunteers = [];
        for (let i = 0; i < volunteers.volunteers.length; i++) {
          this.displayVolunteers[i] = volunteers.volunteers[i];
        }
      });
    } else if (view === 'active') {
      this.ftpService.getAllActiveVolunteers().subscribe(volunteers => {
        for (let i = 0; i < volunteers.volunteers.length; i++) {
          this.displayVolunteers[i] = volunteers.volunteers[i];
        }
      });
    } else if (view === 'inactive') {
      this.ftpService.getAllInactiveVolunteers().subscribe(volunteers => {
        for (let i = 0; i < volunteers.volunteers.length; i++) {
          this.displayVolunteers[i] = volunteers.volunteers[i];
        }
      });
    } else if (view === 'disabled') {
      this.ftpService.getAllVolunteers(true).subscribe(volunteers => {
        for (let i = 0; i < volunteers.volunteers.length; i++) {
          this.displayVolunteers[i] = volunteers.volunteers[i];
        }
      });
    }
  }

  editVolunteerPair(id) {
    this.router.navigateByUrl(`/editPair/${id}`);
  }

  editVolunteer(id) {
    this.router.navigateByUrl(`/edit-volunteer/${id}`);
  }

  timestampString(timestamp: Date) {
    if (timestamp) {
      return Moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
    } else {
      return timestamp;
    }
  }
}

class DisplayPair {
  state: string;
  pair: VolunteerPair;
}
