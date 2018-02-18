import { Injectable } from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {HttpParams, HttpClient, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Request} from './request';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';
  private addRequestURL = this.requestURL;

  constructor(private http: HttpClient) { }


  /**
   * Returns an Observable with up to 10 requests from the server
   */
  getRequests() {
    return this.http.get(this.requestURL + '?offset=0&count=10')
                    .pipe(
                      catchError(this.handleError)
                    );
  }

  /**
   * archives the request by sending a patch request with the updated status
   *
   * @param request the request to be archived
   */
  archiveRequest(request: Request): Observable<any> {
    const patchURL = this.requestURL + '/' + request.id;
    return this.http.patch(patchURL, {
      archived: request.archived
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Send request infomation to the server where it is made into a full request and added to the list of active requests
   * consists of name (optional), from_location, to_location, and additional_info (optional)
   * @param requestMini the request information to be sent to the server.
   */
  addRequest(requestMini): Observable<Object> {
    return this.http.post(this.addRequestURL, requestMini)
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable('Something bad happened; please try again later.');
  }
}
