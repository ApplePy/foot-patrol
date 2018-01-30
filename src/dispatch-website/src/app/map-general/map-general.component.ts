import { Component, OnInit } from '@angular/core';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core/core.module';

@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css'],
})

@NgModule({
  imports: [AgmCoreModule],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class MapGeneralComponent implements OnInit {

  // ignore lint, the number declaration is needed to make the map work
  lat: number = 51.234;
  lng: number = 7.345;

  constructor() { }

  ngOnInit() {
  }

}
