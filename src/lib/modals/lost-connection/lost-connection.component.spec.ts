import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LostConnectionComponent } from './lost-connection.component';

describe('LostConnectionComponent', () => {
  let component: LostConnectionComponent;
  let fixture: ComponentFixture<LostConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LostConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LostConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
