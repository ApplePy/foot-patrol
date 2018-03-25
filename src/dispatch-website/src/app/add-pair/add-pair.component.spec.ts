import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPairComponent } from './add-pair.component';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { FtpRequestService } from '../ftp-request.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Volunteer } from '../volunteer';
import { VolunteerPair } from '../volunteer-pair';

describe('AddPairComponent', () => {
  let component: AddPairComponent;
  let fixture: ComponentFixture<AddPairComponent>;

  const testVolunteerTWO: Volunteer = {
    id: 1,
    uwo_id: 'jsmith1',
    first_name: 'John',
    last_name: 'Smith',
    disabled: false,
    latitude: '',
    longitude: '',
    timestamp: ''
  };

  const testVolunteerONE: Volunteer = {
    id: 2,
    uwo_id: 'jsmithe2',
    first_name: 'Jane',
    last_name: 'Swole',
    disabled: false,
    latitude: '',
    longitude: '',
    timestamp: ''
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule
      ],
      declarations: [ AddPairComponent ],
      providers: [
        FtpRequestService,
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPairComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setup');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setup', () => {
    expect(component.setup).toHaveBeenCalled();
  });

  describe('createPair()', () => {

    this.testVolunteerONE = {
      id: 2,
      uwo_id: 'jsmithe2',
      first_name: 'Jane',
      last_name: 'Swole',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    };

    this.testVolunteerTWO = {
      id: 1,
      uwo_id: 'jsmith1',
      first_name: 'John',
      last_name: 'Smith',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(AddPairComponent);
      component = fixture.componentInstance;
      spyOn(component, 'setup');
      fixture.detectChanges();
      spyOn(component.ftpService, 'createNewVolunteerPair').and.returnValue({ subscribe: () => { }});
      component.volunteerONE = this.testVolunteerONE;
      component.volunteerTWO = this.testVolunteerTWO;
      component.pair = new VolunteerPair();
      component.pairState = 'Active';
      component.createPair();
    });

    it('should sort the volunteers by id in ascending order', () => {
      // I would like to just check contents of the arrays but that doesn't work for some unknown reason
      expect(component.pair.volunteers[0].id).toBe(1);
      expect(component.pair.volunteers[1].id).toBe(2);
    });

    it('should send the created pair to the server', () => {
      expect(component.ftpService.createNewVolunteerPair).toHaveBeenCalled();
    });
  });
});
