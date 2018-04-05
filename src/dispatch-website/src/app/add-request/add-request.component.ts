import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FtpRequestService } from '../ftp-request.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-add-request',
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.css'],
  providers: [FtpRequestService]
})
export class AddRequestComponent implements OnInit {

  constructor(public router: Router, public ftpService: FtpRequestService) { }
  errorMsg: string;
  walkFrom: Location;
  walkTo: Location;
  locations: Location[] = [
  {location: '3M CENTRE', gpsCoordinates: '43.00787670075733,-81.27418074042959'},
  {location: 'ALUMNI HALL', gpsCoordinates: '43.00597308418404,-81.27477407455444'},
  {location: 'BIOLOGY & GEOLOGY SCIENCES', gpsCoordinates: '43.010912,-81.27270060000001'},
  {location: 'CHEMISTRY BUILDING', gpsCoordinates: '43.0114977,-81.2727155'},
  {location: 'ELBORN COLLEGE', gpsCoordinates: '43.002931,-81.2780864'},
  {location: 'HEALTH SCIENCES BUILDING', gpsCoordinates: '43.00539737943838,-81.27280178419778'},
  {location: 'KRESGE BUILDING', gpsCoordinates: '43.01017044972421,-81.27377736607741'},
  {location: 'LAWSON HALL', gpsCoordinates: '43.0084066,-81.27418969999997'},
  {location: 'MIDDLESEX COLLEGE', gpsCoordinates: '43.0097325,-81.27074879999999'},
  {location: 'NORTH CAMPUS BUILDING', gpsCoordinates: '43.0103636,-81.2693481'},
  {location: 'NATURAL SCIENCES CENTRE', gpsCoordinates: '43.01031794086098,-81.27311325151823'},
  {location: 'SPENCER ENGINEERING BUILDING', gpsCoordinates: '43.00555333185497,-81.27604007720947'},
  {location: 'SOMERVILLE HOUSE', gpsCoordinates: '43.00783999999999,-81.27427319999998'},
  {location: 'SOCIAL SCIENCES CENTRE', gpsCoordinates: '43.0094264,-81.27517069999999'},
  {location: 'STEVENSON HALL', gpsCoordinates: '43.0089088,-81.2740063'},
  {location: 'TALBOT COLLEGE', gpsCoordinates: '43.0071649,-81.27049579999999'},
  {location: 'THOMPSON ENGINEERING BUILDING', gpsCoordinates: '43.00419205924161,-81.27536952495575'},
  {location: 'THAMES HALL', gpsCoordinates: '43.00687534583678,-81.27444684505463'},
  {location: 'UNIVERSITY COLLEGE', gpsCoordinates: '43.00825479999999,-81.27330510000002'},
  {location: 'UNIVERSITY COMMUNITY CENTRE', gpsCoordinates: '43.0085346,-81.2755338'},
  {location: 'VISUAL ARTS CENTRE', gpsCoordinates: '43.0108348,-81.27000710000004'},
  {location: 'WELDON LIBRARY', gpsCoordinates: '43.007832,-81.27551399999999'},
  {location: 'WESTERN SCIENCE CENTRE', gpsCoordinates: '43.0099697,-81.27144479999998'},
  {location: 'BRESCIA CAMPUS', gpsCoordinates: '43.003439,-81.28178700000001'},
  {location: 'HURON CAMPUS', gpsCoordinates: '43.0089872,-81.27770029999999'},
  {location: 'IVEY BUSINESS SCHOOL', gpsCoordinates: '43.0044265,-81.27791530000002'},
  {location: 'BROUGHDALE HALL (KING\'S UNIVERSITY COLLEGE)', gpsCoordinates: '43.0110321,-81.2588955'},
  {location: 'FACULTY BUILDING (KING\'S UNIVERSITY COLLEGE)', gpsCoordinates: '43.0124722,-81.25711590000003'},
  {location: 'WEMPLE HALL (KING\'S UNIVERSITY COLLEGE)', gpsCoordinates: '43.0125254,-81.25674459999999'},
  {location: 'LABATT HALL (KING\'S UNIVERSITY COLLEGE)', gpsCoordinates: '43.0117562,-81.25644090000003'},
  {location: 'DANTE LENARDON HALL (KING\'S UNIVERSITY COLLEGE', gpsCoordinates: '43.011195,-81.2570887'}
];
  ngOnInit() {
    this.errorMsg = '';
  }

  /**
   * Send the server a new request using the values in the input fields
   * If the request is valid, navigate to the request-list page
   */
  submitReq() {
    const Iname = (<HTMLInputElement>document.getElementById('name')).value;
    const IadditionalInfo = (<HTMLInputElement>document.getElementById('additionalInfo')).value;

    if (this.checkValidSubmitReq(Iname, this.walkFrom.location, this.walkTo.location, IadditionalInfo)) {
      const req = {
        'name': Iname,
        'from_location': this.walkFrom.gpsCoordinates,
        'to_location': this.walkTo.gpsCoordinates,
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
    let charCheck = false;
    strName = strName.replace(regWhi, ''); // remove whitespace
    strAdditionalInfo = strAdditionalInfo.replace(regWhi, '');
    charCheck = charCheck || regVal.test(strName);
    charCheck = charCheck || regVal.test(strAdditionalInfo);
    if (charCheck === true) {
      this.errorMsg = 'Error: Invalid characters detected. Remove any special characters other than "." and "," from the input fields';
      check = false;
    }
    if (strFromLocation === strToLocation) {
      this.errorMsg = 'Error: To and From locations must be different';
      check = false;
    }
    return check;
  }
}

class Location {
 location: string;
 gpsCoordinates: string;
}
