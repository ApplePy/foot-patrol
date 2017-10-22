import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Request} from './request';

@Injectable()
export class FtpRequestService {
  private requestURL = 'api/request';  // URL to web api
  
  constructor(private http:Http) { }

  //requests 1 and 2 and swap are for testing
  Requests1: Request[]=[
    {id:1, name: 'test1', location: 'Building 1', time: 1130},
    {id:2, name: 'test2', location: 'Building 2', time: 230}
  ]

  Requests2: Request[]=[
    {id:4, name: 'test2', location: 'Building 2', time: 230},
    {id:5, name: 'test1', location: 'Building 1', time: 1130}
  ]

  swap: boolean=true;

  getRequests(): Promise<Request[]> { 
    //for actual use, uncomment this code
    /*return this.http.get(this.requestURL)
            .toPromise()
            .then(response => response.json().data as Request[])
            .catch(this.handleError);
    
*/
    //these statements are here for testing
    if(this.swap){   
      this.swap=false;
      return Promise.resolve(this.Requests1);
    }
    else{
      this.swap=true;
      return Promise.resolve(this.Requests2);      
    }
   } 

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); 
    return Promise.reject(error.message || error);
  }

}