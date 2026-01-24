import { TestBed } from '@angular/core/testing';

import { PedidomenuService } from './pedidomenu.service';

describe('PedidomenuService', () => {
  let service: PedidomenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidomenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
