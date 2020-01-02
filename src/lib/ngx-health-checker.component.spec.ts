import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxHealthCheckerComponent } from './ngx-health-checker.component';

describe('NgxHealthCheckerComponent', () => {
  let component: NgxHealthCheckerComponent;
  let fixture: ComponentFixture<NgxHealthCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxHealthCheckerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxHealthCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
