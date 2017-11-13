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

  checkboxCheck(request):void{
    this.ftpRequestService.archiveRequest(request);
  }

  /**
   * Get Requests from the server via the ftpRequests service and display them on the website
   */
  getFPrequests(): void {
    this.ftpRequestService.getRequests()
    .then(requests => {
      //sort requests in reverse chronological order. oldest last, most recent first
      requests.sort(comparerTimestamp);

        //move requests to displayRequests to display them
        for(let i=0;i<requests.length;i++){
          this.displayRequests[i]=requests[i];
        }      
    });
  }
}

/**
 * compare function to sort requests by their timestamps
 * 
 * @param a request a
 * @param b request b
 */
function comparerTimestamp(a, b){  
  if (a.timestamp > b.timestamp) {
    return -1;
  }
  if (a.timestamp < b.timestamp) {
    return 1;
  }
  return 0;  
}