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
    const name = (<HTMLInputElement>document.getElementById('name')).value;
    const fromLocation = (<HTMLInputElement>document.getElementById('fromLocation')).value;
    const toLocation = (<HTMLInputElement>document.getElementById('toLocation')).value;
    const additionalInfo = (<HTMLInputElement>document.getElementById('additionalInfo')).value;


    console.log('N:'+name+' FL:'+fromLocation+' TL:'+toLocation+' AI:'+additionalInfo);
    this.router.navigateByUrl('/request-list');
   }

  //  cancelReq() {
  //    console.log('cancel');
  //  }

}
