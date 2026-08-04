import { TestBed } from '@angular/core/testing';

import { AsignardeliveryService } from './asignardelivery.service';

describe('AsignardeliveryService', () => {
  let service: AsignardeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignardeliveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
