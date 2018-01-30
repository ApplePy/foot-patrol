import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';
import {HttpParams, HttpClient} from '@angular/common/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {Request} from './request';
import { Response } from '@angular/http/src/static_response';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';
  private addRequestURL = this.requestURL;

  constructor(private http: HttpClient) { }

  /**
   * Returns a Promise with up to 10 requests from the server
   */
  getRequests(): Promise<Request[]> {
    console.log(this.requestURL + '?offset=0&count=10');
    return this.http.get(this.requestURL + '?offset=0&count=10')
            .toPromise()
            .catch(this.handleError);
  }

  /**
   * archives the request by sending a patch request with the updated status
   *
   * @param request the request to be archived
   */
  archiveRequest(request) {
    const patchURL = this.requestURL + '/' + request.id;
    this.http.patch(patchURL, {
      archived: request.archived
    }).subscribe(resp => {}, error => this.handleError(error));
  }

  /**
   * Send request infomation to the server where it is made into a full request and added to the list of active requests
   * @param requestMini the request information to be sent to the server
   */
  addRequest(requestMini): Promise<Request> {
    return this.http.post(this.addRequestURL, requestMini)
            .toPromise()
            .catch(this.handleError);
  }

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
