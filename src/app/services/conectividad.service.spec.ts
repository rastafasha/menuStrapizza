import { TestBed } from '@angular/core/testing';

import { ConectividadService } from './conectividad.service';

describe('ConectividadService', () => {
  let service: ConectividadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConectividadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
