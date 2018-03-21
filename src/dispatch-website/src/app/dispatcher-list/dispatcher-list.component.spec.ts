import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatcherListComponent } from './dispatcher-list.component';

describe('DispatcherListComponent', () => {
  let component: DispatcherListComponent;
  let fixture: ComponentFixture<DispatcherListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatcherListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatcherListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
