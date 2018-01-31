import { Component, OnInit } from '@angular/core';
import {Request} from '../request';
import {FtpRequestService} from '../ftp-request.service';
import {FormsModule} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

  ngOnInit(): void {
    // when the page is loaded start getting requests from the server
    this.getRepeat = setInterval(this.getFPrequests.bind(this), 1000);
  }

  archive(request): void {
    request.archived = true;
    this.ftpRequestService.archiveRequest(request);
  }

  /**
   * Get Requests from the server via the ftpRequests service and displays the requests on the website
   */
  getFPrequests(): void {
    this.ftpRequestService.getRequests()
    .then(resp => {
      const requests = resp.requests;
      // sort requests in reverse chronological order. oldest last, most recent first
      if (requests.length > 1) {
        requests.sort(this.comparerTimestamp);
      }

      // clear displayRequests
      this.displayRequests.length = 0;

      // move requests to displayRequests to display them
      for (let i = 0; i < requests.length; i++) {
        this.displayRequests[i] = requests[i];
      }
    }).catch(this.handleError);
  }

  /**
   * compare function to sort requests by their timestamps
   *
   * @param a request a
   * @param b request b
   */
  comparerTimestamp(a, b) {

    if (a.timestamp < b.timestamp) {
      return 1;
    } else if (a.timestamp > b.timestamp) {
      return -1;
    }

    // return clamp(b.timestamp - a.timestamp, 1, -1);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

function clamp(val: number, max: number, min: number) {
  return Math.max(Math.min(val, max), min);
}


