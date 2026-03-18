import { TestBed } from '@angular/core/testing';

import { ComentarioappService } from './comentarioapp.service';

describe('ComentarioappService', () => {
  let service: ComentarioappService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComentarioappService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
