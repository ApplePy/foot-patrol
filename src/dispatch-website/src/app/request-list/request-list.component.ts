import { Component, OnInit } from '@angular/core';
import {Request} from '../request';
import {FtpRequestService} from '../ftp-request.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css'],
  providers: [FtpRequestService]
})
export class RequestListComponent implements OnInit {

  // request overflow flag
  requestOverflow: boolean;

  // displayRequests is displayed in the view
  displayRequests: Request[] = [ ];
  // storedRequests stores all requests that have been received.
  storedRequests: Request[] = [ ];

  requestIndex: number;
  listIndex: number;

  constructor(private ftpRequestService: FtpRequestService) {}

  ngOnInit(): void {
    setInterval(this.getFPrequests.bind(this), 1000);
  }

  /**
   * Get Requests from the server via the ftpRequests service and display them on the website
   *
   * the number of displayed requests is capped at 10.
   *
   * If more requests are stored in the storedRequests array, the 10 most recent are moved to the displayRequests array
   *
   * If more than 10 requests are recieved in a batch,
   * the requestOverflow flag is set and only 10 of the requests are moved to the displayRequests array
   */
  getFPrequests(): void {
    this.ftpRequestService.getRequests().then(requests => {
      if (requests.length > 0) {
        // add new requests to the storedRequests array
        for (let i = 0; i < requests.length; i++) {
          // archived = complete
          // this fix will work but when the website sends info back use patch not put
          // and specifiy only the parts you are sending back, ie: archived
          if (requests[i].name === null) {
            requests[i].name = '';
          }
          if (requests[i].additional_info === null) {
            requests[i].additional_info = '';
          }
          this.storedRequests.push(requests[i]);
        }

        // check for overflow
        if (requests.length > 10) {
          this.requestOverflow = true;
        } else {
          this.requestOverflow = false;
        }
// optional name and additional info
        // setup indexes
        this.requestIndex = 0;
        this.listIndex = this.storedRequests.length - 1;

        // display the last 10 requests
        if (this.listIndex > 10) {
          while (this.listIndex >= this.storedRequests.length - 10) {
            this.displayRequests[this.requestIndex] = this.storedRequests[this.listIndex];
            this.requestIndex++;
            this.listIndex--;
          }
        } else {
          while (this.listIndex >= 0) {
            this.displayRequests[this.requestIndex] = this.storedRequests[this.listIndex];
            this.requestIndex++;
            this.listIndex--;
          }
        }
      }
    });
  }
}
