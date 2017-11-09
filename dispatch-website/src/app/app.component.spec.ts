import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import {RequestListComponent} from './request-list/request-list.component';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

describe('AppComponent', () => {
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports:[
        FormsModule,
        HttpModule],
      declarations: [
        AppComponent,
        RequestListComponent,
      ],
      providers:[HttpModule]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'Foot-Patrol Dispatcher Website'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Foot-Patrol Dispatcher Website');
  }));
  /*it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Foot-Patrol Dispatcher Website');
  }));*/
});



