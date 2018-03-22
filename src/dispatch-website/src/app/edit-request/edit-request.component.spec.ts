import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRequestComponent } from './edit-request.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FtpRequestService } from '../ftp-request.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

describe('EditRequestComponent', () => {
  let component: EditRequestComponent;
  let fixture: ComponentFixture<EditRequestComponent>;
  const fakeActivateRoute = { // this isn't being used properly.
    request: {
      id: 1,
      name: 'name1',
      from_location: 'SEB',
      to_location: 'TEB',
      additional_info: 'quick',
      timestamp: '2017-10-26T06:51:05.000Z',
      archived: false,
      pairing: null,
      status: 'assigned'
    }
  };

  const fakeVolunteerPair = {
    id: 1,
    active: true,
    volunteers: [{
      id: 1,
      uwo_id: 'Astring@uwo.ca',
      first_name: 'Ajohn',
      last_name: 'Ajohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 2,
      uwo_id: 'Bstring@uwo.ca',
      first_name: 'Bjohn',
      last_name: 'Bjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  };

  const fakeVolunteerPairs = [{
    id: 2,
    active: true,
    volunteers: [{
      id: 3,
      uwo_id: 'Cstring@uwo.ca',
      first_name: 'Cjohn',
      last_name: 'Cjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 4,
      uwo_id: 'Dstring@uwo.ca',
      first_name: 'Djohn',
      last_name: 'Djohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }, {
    id: 3,
    active: true,
    volunteers: [{
      id: 5,
      uwo_id: 'Estring@uwo.ca',
      first_name: 'Ejohn',
      last_name: 'Ejohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 6,
      uwo_id: 'Fstring@uwo.ca',
      first_name: 'Fjohn',
      last_name: 'Fjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }, {
    id: 4,
    active: true,
    volunteers: [{
      id: 7,
      uwo_id: 'Gstring@uwo.ca',
      first_name: 'Gjohn',
      last_name: 'Gjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 8,
      uwo_id: 'Hstring@uwo.ca',
      first_name: 'Hjohn',
      last_name: 'Hjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule
      ],
      declarations: [ EditRequestComponent ],
      providers: [
       {provide: ActivatedRoute, useValue: fakeActivateRoute},
       FtpRequestService,
       HttpClient,
       HttpModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRequestComponent);
    component = fixture.componentInstance;
    component.request = fakeActivateRoute.request;
    component.volunteerPair = fakeVolunteerPair;
    component.volunteerPairs = fakeVolunteerPairs;
    spyOn(component, 'setup');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setup', () => {
    expect(component.setup).toHaveBeenCalled();
  });

  describe('setup', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(EditRequestComponent);
      component = fixture.componentInstance;
      spyOn(component.ftpService, 'getSingleRequest').and.returnValue({ subscribe: request => {
        request = fakeActivateRoute.request;
       }});
      spyOn(component.ftpService, 'getVolunteerPairs').and.returnValue({ subscribe: pairs => {
        pairs = fakeVolunteerPairs;
       }});
       spyOn(component.ftpService, 'getSpecificVolunteerPair').and.returnValue({ subscribe: pair => {
        pair = fakeVolunteerPair;
       }});
    });
    it('should get the request and volunteer pairs', async() => {
      component.setupTwo(fakeActivateRoute.request.id);
      expect(component.ftpService.getSingleRequest).toHaveBeenCalled();
      expect(component.ftpService.getVolunteerPairs).toHaveBeenCalled();
    });
  });

  describe('updateRequest', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(EditRequestComponent);
      component = fixture.componentInstance;
      component.request = fakeActivateRoute.request;
      component.volunteerPair = fakeVolunteerPair;
      spyOn(component, 'setup');
      spyOn(component, 'checkValidUpdateRequest').and.returnValue(true);
      spyOn(component.ftpService, 'updateRequest').and.returnValue({subscribe: () => {}});
      fixture.detectChanges();
      component.updateRequest();
    });

    it('should call checkValidUpdateRequest', () => {
      expect(component.checkValidUpdateRequest).toHaveBeenCalled();
    });
    it('should set the request pairing to the volunteerPair id', () => {
      expect(component.request.pairing).toBe(component.volunteerPair.id);
    });
    it('should call ftpService.updateRequest', () => {
      expect(component.ftpService.updateRequest).toHaveBeenCalledWith(component.request);
    });
  });
});
