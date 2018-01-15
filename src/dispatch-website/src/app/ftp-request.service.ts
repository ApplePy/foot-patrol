import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';
import {HttpParams} from '@angular/common/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {Request} from './request';
import { Response } from '@angular/http/src/static_response';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';

  constructor(private http: Http) { }

  /**
   * Returns a Promise with up to 10 requests from the server
   */
  getRequests(): Promise<Request[]> {
    return this.http.get(this.requestURL + '?offset=0&count=10')
            .toPromise()
            .then(response => {
              // response.json().requests as Request[]
              if (response.status !== 200) {
                console.log('Code: ' + response.status + ', ' + response.statusText);
              }
            })
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


   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
