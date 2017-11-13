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

  Requests1: Request[]=[
    {id:1, name: 'test1',to_Location: "SEB",additional_info:"null",archived:false, timestamp: "2017-10-25T07:32:19.000Z",from_Location:"UCC"},
    {id:2, name: 'test2',to_Location: "SEB",additional_info:"null",archived:false, timestamp: "2017-10-26T07:13:52.000Z",from_Location:"UCC"},
  ]


  getRequests(): Promise<Request[]> {
    return Promise.resolve(this.Requests1);
    //get first 10 requests
    /*return this.http.get(this.requestURL + "?offset=0&count=10")
            .toPromise()
            .then(response => response.json().requests as Request[])
            .catch(this.handleError);
  */}
   
  archiveRequest(request){
    var patchURL=this.requestURL + "/"+request.id;
    this.http.patch(patchURL,{
      params: new URLSearchParams().set('archived',request.archived)
    }
  )
  }


   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
