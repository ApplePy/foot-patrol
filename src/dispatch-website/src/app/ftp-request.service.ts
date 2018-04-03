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
import { Volunteer } from './volunteer';

@Injectable()
export class FtpRequestService {
  private apiUrl = environment.apiUrl;
  private requestURL = this.apiUrl + '/requests';
  private volunteerURL = this.apiUrl + '/volunteers';
  private volunteerPairsURL = this.apiUrl + '/volunteerpairs';
  // public errorMsg: string;

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
   * get a single request specified by the id parameter
   * @param id the id of the request to get from the server
   */
  getSingleRequest(id: string) {
    return this.http.get(this.requestURL + '/' + id)
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
   * Update all variables in the Request
   * @param request The request to be updated
   */
  updateRequest(request: Request): Observable<any> {
    const patchURL = this.requestURL + '/' + request.id;
    return this.http.patch(patchURL, {
      pairing: request.pairing,
      status: request.status
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
    return this.http.post(this.requestURL, requestMini)
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Get a list of all walking escort volunteers. Has the option to include disabled volunteers who have left the foot patrol
   * @param disabled Optional: decide whether to include disabled volunteers. Default is false
   */
  getAllVolunteers(disabled = false) {
    return this.http.get(this.volunteerURL + '?disabled=' + disabled)
                        .pipe(
                          retry(3),
                          catchError(this.handleError)
                        );
  }

  /**
   * Get list of actively patrolling volunteers
   */
  getAllActiveVolunteers() {
    return this.http.get(this.volunteerURL + '/active')
                      .pipe(
                        retry(3),
                        catchError(this.handleError)
                      );
  }

    /**
   * Get list of inactive volunteers
   */
  getAllInactiveVolunteers() {
    return this.http.get(this.volunteerURL + '/inactive')
                      .pipe(
                        retry(3),
                        catchError(this.handleError)
                      );
  }

  /**
   * Get a specific volunteer
   * @param id the id of the volunteer
   */
  getVolunteer(id) {
    return this.http.get(this.volunteerURL + '/' + id)
                        .pipe(
                          retry(3),
                          catchError(this.handleError)
                        );
  }

  /**
   * Get all volunteer pairs
   * @param inactive Optional: set whether to include inactive pairs. Default is false
   */
  getVolunteerPairs(inactive = false) {
    return this.http.get(this.volunteerPairsURL + `?inactive=${inactive}`)
                  .pipe(
                    retry(3),
                    catchError(this.handleError)
                  );
  }

  /**
   * Get a specific volunteer pair
   * @param id the id of the pair to search for
   */
  getSpecificVolunteerPair(id) {
    return this.http.get(this.volunteerPairsURL + '/' + id)
                        .pipe(
                          retry(3),
                          catchError(this.handleError)
                        );
  }

  /**
   * Get the volunteers assigned to a specific request.
   * returns an array called volunteers that stores the volunteers
   * @param id the id of the request to search for
   */
  getRequestsVolunteers(id) {
    return this.http.get(this.requestURL + `/${id}/volunteers`)
                        .pipe(
                          retry(3),
                          catchError(this.handleError)
                        );
  }

  toggleActiveVolunteerPair(Pair_id, status) {
    return this.http.post(this.volunteerPairsURL + `/${Pair_id}/active`, {active: status})
                        .pipe(
                          retry(3),
                          catchError(this.handleError)
                        );
  }

  createNewVolunteerPair(volunteers, active) {
    const data = {volunteers, active};
    return this.http.post(this.volunteerPairsURL, data)
                          .pipe(
                            retry(3),
                            catchError(this.handleError)
                          );
  }

  createNewVolunteer(volunteer) {
    return this.http.post(this.volunteerURL, volunteer)
                          .pipe(
                            retry(3),
                            catchError(this.handleError)
                          );
  }

  updateVolunteer(volunteer, id) {
    return this.http.patch(this.volunteerURL + `/${id}`, volunteer)
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
    const errorData = {
      status: error.status
    };
    return new ErrorObservable(errorData);
  }
}
