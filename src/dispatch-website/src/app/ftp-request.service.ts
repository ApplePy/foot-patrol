import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';
import {HttpParams} from '@angular/common/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';

import {Request} from './request';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';

  constructor(private http: Http) { }


  getRequests(): Promise<Request[]> {
    // get first 10 requests
    return this.http.get(this.requestURL + '?offset=0&count=10')
            .toPromise()
            .then(response => response.json().requests as Request[])
            .catch(this.handleError);
  }

  archiveRequest(request) {
    const patchURL = this.requestURL + '/' + request.id;
    this.http.patch(patchURL, {
      params: new HttpParams().set('archived', request.archived)
    });
  }


   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}