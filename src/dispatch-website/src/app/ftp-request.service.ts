import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';

import {Request} from './request';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests?offset=0&count=10';

  constructor(private http: Http) { }

  getRequests(): Promise<Request[]> {
    return this.http.get(this.requestURL)
            .toPromise()
            .then(response => response.json().requests as Request[])
            .catch(this.handleError);
   }

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
