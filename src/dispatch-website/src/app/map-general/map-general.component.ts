import { Component, OnInit } from '@angular/core';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core/core.module';
import { FtpRequestService } from '../ftp-request.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css'],
})

export class MapGeneralComponent implements OnInit {

  /* tslint:disable:no-magic-numbers number-literal-format */
  lat: number = 43.00959710000001;
  lng: number = -81.27373360000001;
  zoom: number = 15;
  /* tslint:enable:no-magic-numbers number-literal-format */
  getRepeat: number;
  // this list is here to show that the markers work. delete this once the server connunication stuff for volunteer info is written
  displayList: DisplayVolunteer[] = [ ];

  constructor(private ftpService: FtpRequestService, private router: Router) {
    router.events.subscribe((val) => {
    //   // when the user navigates away from the page, stop getting requests
      clearInterval(this.getRepeat);
    });
  }

  ngOnInit() {
    this.getVolunteers();
    this.getRepeat = setInterval(this.getVolunteers.bind(this), 1000);
  }

  getVolunteers() {
    this.displayList = [];
    this.ftpService.getAllActiveVolunteers().subscribe(volunteers => {
      for (let i = 0; i < volunteers.volunteers.length; i++) {
        this.displayList[i] = volunteers.volunteers[i];
      }
    });
  }



}

class DisplayVolunteer {
  name: string;
  late: number;
  long: number;
  timestamp: string;
}
