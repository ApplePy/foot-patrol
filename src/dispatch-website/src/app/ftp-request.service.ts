import { Injectable } from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {HttpParams, HttpClient} from '@angular/common/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Request} from './request';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

class ResponseServ {
    requests: Request[];
    meta: {
      offset: number;
      count: number;
      archived: boolean;
    };
}


@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';
  private addRequestURL = this.requestURL;

  constructor(private http: HttpClient) { }


  /**
   * Returns a Promise with up to 10 requests from the server
   */
  // getRequests(): Promise<Request[]> {
  //   return this.http.get(this.requestURL + '?offset=0&count=10')
  //           .toPromise().then((res: ResponseServ) => {
  //             return res.requests;
  //           })
  //           .catch(this.handleError);
  // }
  getRequests() {
    return this.http.get(this.requestURL + '?offset=0&count=10')
                .catch(this.handleErrorO('getRequests', []));
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
    }).subscribe(resp => {}, error => this.handleErrorP(error));
  }

  /**
   * Send request infomation to the server where it is made into a full request and added to the list of active requests
   * @param requestMini the request information to be sent to the server
   */
  addRequest(requestMini): Promise<Request> {
    return this.http.post(this.addRequestURL, requestMini)
            .toPromise()
            .catch(this.handleErrorP);
  }
  /**
   * error handler for promises
   * @param error the error
   */
  private handleErrorP(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  /**
   * error handler for observables
   * @param operation what was being run when the error happenned
   * @param result return an empty result to keep the app running
   */
  private handleErrorO<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  // private extractData(res: Response) {
  //   // TODO: remove this line of test code
  //   console.log(res.type);
  //   try {
  //     const body = res .json();
  //     return body;
  //   } catch (error) {
  //     const body2 = {
  //       'requests': []
  //     };
  //     console.log(error);
  //     console.log(`Data Extraction failed: ${error.message}`);
  //     return body2;
  //   }
  // }

}
