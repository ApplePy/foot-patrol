import { Injectable } from '@angular/core';
import {Request} from './request';

@Injectable()
export class FtpRequestService {

  constructor() { }
  Requests: Request[]=[
    {id:1, name: 'test1', location: 'Building 1', time: 1130},
    {id:2, name: 'test2', location: 'Building 2', time: 230},
    {id:3, name: 'test3', location: 'Building 3', time: 1700}
  ]

  getRequests(): Promise<Request[]> { 
    return Promise.resolve(this.Requests);
   } //stub
}
