import { TestBed } from '@angular/core/testing';

import { CastingService } from './casting.service';

describe('CastingService', () => {
  let service: CastingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CastingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
