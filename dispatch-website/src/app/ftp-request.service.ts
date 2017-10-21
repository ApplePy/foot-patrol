import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Request} from './request';

@Injectable()
export class FtpRequestService {
  private requestURL = 'api/request';  // URL to web api
  
  constructor(private http:Http) { }

  Requests: Request[]=[
    {id:1, name: 'test1', location: 'Building 1', time: 1130},
    {id:2, name: 'test2', location: 'Building 2', time: 230},
    {id:3, name: 'test3', location: 'Building 3', time: 1700}
  ]

  getRequests(): Promise<Request[]> { 
    /*return this.http.get(this.requestURL)
            .toPromise()
            .then(response => response.json().data as Request[])
            .catch(this.handleError);
    */
    return Promise.resolve(this.Requests);
   } 

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); 
    return Promise.reject(error.message || error);
  }

}