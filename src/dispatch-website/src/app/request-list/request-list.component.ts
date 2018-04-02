import { Component, OnInit } from '@angular/core';
import {Request} from '../request';
import {FtpRequestService} from '../ftp-request.service';
import {FormsModule} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Volunteer } from '../volunteer';
import * as Moment from 'moment';
// import { request } from 'http';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css'],
  providers: [FtpRequestService]
})
export class RequestListComponent implements OnInit {
  // requests in displayRequests are displayed in the view
  displayRequests: Request[] = [ ];
  getRepeat: number;

  constructor(public ftpRequestService: FtpRequestService, private router: Router) {
    router.events.subscribe((val) => {
      // when the user navigates away from the page, stop getting requests
      clearInterval(this.getRepeat);
    });
  }

  ngOnInit() {
    // when the page is loaded start getting requests from the server
    this.getFPrequests();
    this.getRepeat = setInterval(this.getFPrequests.bind(this), 1000);
  }

  /**
   * Send a patch message to the server which marks the request as archived, removing it from the display list
   * @param request The request to be archived
   */
  archive(request): void {
    request.request.archived = true;
   // request.status = 'ARCHIVED';
    this.ftpRequestService.archiveRequest(request.request).subscribe(
      // TODO: maybe add some kind of confirmation that the request was archived or a message when there's an error
     );
  }

  /**
   * Get Requests from the server via the ftpRequests service and displays the requests on the website
   */
  getFPrequests(): void {
    this.ftpRequestService.getRequests().subscribe(
      data => {
        const requests  = data.requests;
        this.displayGetRequests(requests);
      }
  );
  }

  /**
   * routes to the editing component to edit the specified request
   * @param id the id of the request to be edited
   */
  editRequest(id) {
    this.router.navigateByUrl('/editRequest' + '/' + id);
  }

  displayGetRequests(requests: Array<Request>): void {
    // sort requests in reverse chronological order. oldest last, most recent first
    if (requests.length > 1) {
      requests.sort(this.comparerTimestamp);
    }
    // clear displayRequests
    this.displayRequests.length = 0;

    // move requests to displayRequests to display them
    // this.displayRequests = requests.slice();

    // go through the requests and ask the server to send their volunteers to be displayed.
    // if the request has no volunteers then display an empty string
    // let j = 0;
    this.displayRequests = [];
    for (let i = 0; i < requests.length; i++) {
      this.displayRequests[i] = requests[i];
    }
      // this.displayRequests[i].request = requests[i];
      // this.ftpRequestService.getRequestsVolunteers(requests[i].id).subscribe(volunteers => {
      //   if (volunteers.volunteers.length === 2) {
      //     this.displayRequests[j].volunteers =
      //     `${volunteers[0].first_name} ${volunteers[0].last_name} and ${volunteers[1].first_name} ${volunteers[1].last_name}`;
      //   } else {
      //     this.displayRequests[j].volunteers = '';
      //   }
      //   j++;
      // });
  }

  /**
   * compare function to sort requests by their timestamps
   *
   * @param a request a
   * @param b request b
   */
  comparerTimestamp(a, b) {
    if (a.timestamp <= b.timestamp) {
      return 1;
    } else if (a.timestamp > b.timestamp) {
      return -1;
    }
  }

  timestampString(timestamp: Date) {
    if (timestamp) {
      return Moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
    } else {
      return timestamp;
    }
  }
}
// hacky new display request type
// has all the elements of the request type as well as the assigned volunteer info
 class DisplayRequestType {
  request: Request;
  volunteers: string;
 }
