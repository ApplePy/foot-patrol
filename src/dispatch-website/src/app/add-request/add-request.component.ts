import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FtpRequestService } from '../ftp-request.service';

@Component({
  selector: 'app-add-request',
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.css'],
  providers: [FtpRequestService]
})
export class AddRequestComponent implements OnInit {

  constructor(public router: Router, public ftpService: FtpRequestService) { }

  ngOnInit() {
  }

  /**
   * Send the server a new request using the values in the input fields
   * If the request is valid, navigate to the request-list page
   */
  submitReq() {
    const Iname = (<HTMLInputElement>document.getElementById('name')).value;
    const IfromLocation = (<HTMLInputElement>document.getElementById('fromLocation')).value;
    const ItoLocation = (<HTMLInputElement>document.getElementById('toLocation')).value;
    const IadditionalInfo = (<HTMLInputElement>document.getElementById('additionalInfo')).value;

    if (this.checkValid(Iname) === true &&
      this.checkValid(IfromLocation) === true &&
      this.checkValid(ItoLocation) === true &&
      this.checkValid(IadditionalInfo) === true
    ) {

    const req = {
      'name': Iname,
      'from_location': IfromLocation,
      'to_location': ItoLocation,
      'additional_info': IadditionalInfo
    };

    this.ftpService.addRequest(req).then(response => {
      this.router.navigateByUrl('/request-list');
    })
    .catch(this.handleError);
    } else {
      alert('Invalid characters detected. Please remove any special characters such as *|,":<>[]{}`\';()@&$#% from the input fields');
    }
  }

   /**
    * Checks that the input string contains no special characters
    * @param str The string that is being checked
    */
  checkValid(str): Boolean {
  if (str.length === 0) {return true; }
  const splChars = '*|,\":<>[]{}`\';()@&$#%';
  for (let i = 0; i < str.length; i++) {
    if (splChars.indexOf(str.charAt(i)) !== -1) {
      return false;
    }
    return true;
  }
}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
