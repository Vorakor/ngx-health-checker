import { TestBed } from '@angular/core/testing';

import { NgxHealthCheckerService } from './ngx-health-checker.service';

describe('NgxHealthCheckerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxHealthCheckerService = TestBed.get(NgxHealthCheckerService);
    expect(service).toBeTruthy();
  });
});
