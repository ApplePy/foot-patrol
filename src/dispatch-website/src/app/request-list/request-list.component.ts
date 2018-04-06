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

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css'],
  providers: [FtpRequestService]
})
export class RequestListComponent implements OnInit {
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
    request.archived = true;
    this.ftpRequestService.archiveRequest(request).subscribe();
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

    // go through the requests and ask the server to send their volunteers to be displayed.
    // if the request has no volunteers then display an empty string
    this.displayRequests = [];
    for (let i = 0; i < requests.length; i++) {
      this.displayRequests[i] = requests[i];
    }
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
