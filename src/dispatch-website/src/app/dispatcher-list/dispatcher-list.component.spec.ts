import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatcherListComponent } from './dispatcher-list.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('DispatcherListComponent', () => {
  let component: DispatcherListComponent;
  let fixture: ComponentFixture<DispatcherListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
      RouterTestingModule],
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
