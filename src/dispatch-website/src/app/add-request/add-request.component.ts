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
  errorMsg: string;
  ngOnInit() {
    this.errorMsg = '';
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

    if (this.checkValidSubmitReq(Iname, IfromLocation, ItoLocation, IadditionalInfo)) {
      const req = {
        'name': Iname,
        'from_location': IfromLocation,
        'to_location': ItoLocation,
        'additional_info': IadditionalInfo
      };

      this.ftpService.addRequest(req).subscribe(data => {
        this.router.navigateByUrl('/request-list');
      });
    }
  }

/**
 * check that the input strings for SubmitReq are valid
 * if any of the strings are invalid the user will recieve an alert
 * @param strName the string from the name field
 * @param strFromLocation the string from the fromLocation field
 * @param strToLocation the string from the toLocation field
 * @param strAdditionalInfo the string from the additionalInfo field
 */
  checkValidSubmitReq(strName: string, strFromLocation: string, strToLocation: string, strAdditionalInfo: string): Boolean {
    this.errorMsg = '';
    const regVal = /[^A-Za-z0-9_.,]/;
    const regWhi = new RegExp('\\s', 'g');
    let check = true;

    strName = strName.replace(regWhi, ''); // remove whitespace
    strFromLocation = strFromLocation.replace(regWhi, '');
    strFromLocation = strFromLocation.toLowerCase();
    strToLocation = strToLocation.replace(regWhi, '');
    strToLocation = strToLocation.toLowerCase();
    strAdditionalInfo = strAdditionalInfo.replace(regWhi, '');
    const b1 = regVal.test(strName);
    const b2 = regVal.test(strFromLocation);
    const b3 = regVal.test(strToLocation);
    const b4 = regVal.test(strAdditionalInfo);

    if (b1 || b2 || b3 || b4 === true) {
      this.errorMsg = 'Error: Invalid characters detected. Please remove any special characters such as !?*|":<>`\';()@&$#% from the input fields';
      check = false;
    }

    if (strFromLocation === strToLocation) {
      this.errorMsg = 'Error: To and From locations must be different';
      check = false;
    }

    if (strFromLocation.length === 0 || strToLocation.length === 0) {
      this.errorMsg = 'Error: A required field is empty';
      check = false;
    }

    if (check) {
      return true;
    } else {
      return false;
    }
  }
}
