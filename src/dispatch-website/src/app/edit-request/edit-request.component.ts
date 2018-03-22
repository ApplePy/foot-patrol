import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Request } from '../request';
import {FormsModule} from '@angular/forms';
import { FtpRequestService } from '../ftp-request.service';
import { environment } from '../../environments/environment';
import {Volunteer} from '../volunteer';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css']
})
    // remeber to add some sort of check to make sure that the edited request is still not archived
    // when the user returns to the main list page
    // like, in the editRequest component call the getRequest function
    // and check that the edited request is still there before sending the patch request
    // can probably still do the edits though
    //
    // this might not be a problem

export class EditRequestComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';

  request: Request;
  errorMsg: string;
  volunteerPair: Pair;
  volunteerPairs: Pair[ ];
  states: string[] = ['ASSIGNED', 'REJECTED'];

  constructor(
    public route: ActivatedRoute,
    public ftpService: FtpRequestService,
    private location: Location,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.setup();
  }

  setup() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.setupTwo(id);
  }
  // these are split becuase it makes writing tests easier
  setupTwo(id) {
    this.volunteerPair = {
      id: 0,
      active: true,
      volunteers: []
    };
    this.ftpService.getSingleRequest(id.toLocaleString()).subscribe(request => {
      this.request = request;
      if (this.request.pairing > 0) {
        this.ftpService.getSpecificVolunteerPair(this.request.pairing).subscribe(pair => {
          this.volunteerPair = pair;
        });
      }
    });
    this.ftpService.getVolunteerPairs().subscribe(volunteerPairs => {
      this.volunteerPairs = [];
      for (let i = 0; i < volunteerPairs.pairs.length; i++) {
        this.volunteerPairs[i] = volunteerPairs.pairs[i];
      }
    });
  }

  updateRequest(): void {
    if (this.checkValidUpdateRequest()) {
      this.request.pairing = this.volunteerPair.id;
      this.ftpService.updateRequest(this.request).subscribe(data =>
        this.router.navigateByUrl('/request-list')
      );
    }
  }

  /**
   * check that the input strings for UpdateRequest are valid
   */
  checkValidUpdateRequest(): Boolean {
    if (this.volunteerPair === null) {
      this.errorMsg = 'Error: Volunteer fields are required';
      return false;
    } else {
      return true;
    }
  }
}

// this is here becuase ts gets pissy if you try to call on variables that don't exist in the normal object type,
// but do exist in the object type that the method will be called on when the method is called
class Pair {
  id: number;
  active: boolean;
  volunteers: Volunteer[];
}
