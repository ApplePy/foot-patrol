import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FtpRequestService} from '../ftp-request.service';
import { EditVolunteerpairComponent } from './edit-volunteerpair.component';
import {FormControl, FormGroup, FormsModule} from '@angular/forms';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EditVolunteerpairComponent', () => {
  let component: EditVolunteerpairComponent;
  let fixture: ComponentFixture<EditVolunteerpairComponent>;

  const fakeActivateRoute = { // this still isn't being used properly.
    // request: {
    //   id: 1,
    //   name: 'name1',
    //   from_Location: 'SEB',
    //   to_Location: 'TEB',
    //   additional_info: 'quick',
    //   timestamp: '2017-10-26T06:51:05.000Z',
    //   archived: false,
    //   pairing: null,
    //   status: 'assigned'
    // }
  };

  const fakeVolunteers =  [{
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
  }];

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule
      ],
      declarations: [ EditVolunteerpairComponent ],
      providers: [FtpRequestService,
        {provide: ActivatedRoute, useValue: fakeActivateRoute},
        HttpClient,
        HttpHandler]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVolunteerpairComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setup');
    component.pair = fakeVolunteerPair;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setup', () => {
    expect(component.setup).toHaveBeenCalled();
  });
  // this is left here on the off chance I figure out what to do and can fix it
  // ie this is a WIP
  // describe('setupTwo', () => {
  //   function setupTwoStub() {
  //     console.log('1');
  //     component.setupTwo(1);
  //     console.log('2');
  //   }
  //   beforeEach(() => {
  //     fixture = TestBed.createComponent(EditVolunteerpairComponent);
  //     component = fixture.componentInstance;
  //     spyOn(component.ftpService, 'getSpecificVolunteerPair').and.returnValue({subscribe: () => this.fakeVolunteerPair});
  //     spyOn(component.ftpService, 'getAllActiveVolunteers').and.returnValue({subscribe: () => this.fakeVolunteers});
  //     spyOn(component, 'setup').and.callFake(setupTwoStub);
  //     // component.pair = fakeVolunteerPair;
  //     fixture.detectChanges();
  //   });

  //   it('should get the specified pair', () => {
  //     expect(component.ftpService.getSpecificVolunteerPair).toHaveBeenCalledWith('1');
  //     expect(component.pair).toBe(this.fakeVolunteerPair);
  //   });
  //   it('should set the pairState based on the pair it got', () => {
  //     expect(component.pairState).toBe('Active');
  //   });
  //   it('should get all active volunteers', () => {
  //     expect(component.ftpService.getAllActiveVolunteers).toHaveBeenCalled();
  //     expect(component.volunteers).toBe(this.fakeVolunteers);
  //   });
  // });

  describe('updatePair', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(EditVolunteerpairComponent);
      component = fixture.componentInstance;
      spyOn(component, 'setup');
      spyOn(component, 'sendPair');
      spyOn(component.ftpService, 'getVolunteerPairs').and.returnValue({subscribe: () => {}});
      component.pair = fakeVolunteerPair;
      component.volunteerONE = fakeVolunteers[0];
      component.volunteerTWO = fakeVolunteers[1];
      fixture.detectChanges();
      component.updatePair();
    });

    it('should assign volunteerONE and volunteerTWO to the pair', () => {
      expect(component.pair.volunteers[0]).toBe(component.volunteerONE);
      expect(component.pair.volunteers[1]).toBe(component.volunteerTWO);
    });
    it('should give an error if the volunteers are the same', () => {
      component.volunteerONE = fakeVolunteers[0];
      component.volunteerTWO = fakeVolunteers[0];
      fixture.detectChanges();
      component.updatePair();
      expect(component.errorMsg).toBe('ERROR: The volunteers in the pair must be different');
    });
    it('should sort the volunteers into acsending order by id', () => {
      component.volunteerONE = fakeVolunteers[1];
      component.volunteerTWO = fakeVolunteers[0];
      fixture.detectChanges();
      component.updatePair();
      expect(component.pair.volunteers[0]).toBe(fakeVolunteers[0]);
      expect(component.pair.volunteers[1]).toBe(fakeVolunteers[1]);
    });
    // it('should call sendPair', () => {
    //   expect(component.sendPair).toHaveBeenCalled();
    // });
  });

  describe('sendPair', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(EditVolunteerpairComponent);
      component = fixture.componentInstance;
      spyOn(component, 'setup');
      spyOn(component.ftpService, 'createNewVolunteerPair').and.returnValue({subscribe: () => {}});
      spyOn(component.ftpService, 'toggleActiveVolunteerPair').and.returnValue({subscribe: () => {}});
      component.pair = fakeVolunteerPair;
      component.pairState = 'Inactive';
      fixture.detectChanges();
      component.sendPair();
    });
    it('should call ftpservice.createNewVolunteerPair', () => {
      expect(component.ftpService.createNewVolunteerPair).toHaveBeenCalled();
    });
    it('should set the state of the pair to pairState', () => {
      expect(component.pair.active).toBeFalsy();
    });
  });
});
