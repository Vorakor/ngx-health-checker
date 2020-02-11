import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackEndErrorComponent } from './back-end-error.component';

describe('BackEndErrorComponent', () => {
  let component: BackEndErrorComponent;
  let fixture: ComponentFixture<BackEndErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackEndErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackEndErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
