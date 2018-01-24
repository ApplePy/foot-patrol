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

  constructor(private router: Router, private ftpService: FtpRequestService) { }

  ngOnInit() {
  }

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
    });
  } else {
    alert('Invalid characters detected. Please remove any special characters such as *|,":<>[]{}`\';()@&$#% from the input fields');
  }

    // console.log('N:'+name+'FL:'+fromLocation+' TL:'+toLocation+' AI:'+additionalInfo);

    // this.router.navigateByUrl('/request-list');
   }

private checkValid(str): Boolean {
  const splChars = '*|,\":<>[]{}`\';()@&$#%';
  for (let i = 0; i < str.value.length; i++) {
    if (splChars.indexOf(str.value.charAt(i)) !== -1) {
      return false;
    }
    return true;
  }
}

}
