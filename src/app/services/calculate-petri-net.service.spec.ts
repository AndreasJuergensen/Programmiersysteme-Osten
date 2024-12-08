import { TestBed } from '@angular/core/testing';

import { CalculatePetriNetService } from './calculate-petri-net.service';

describe('CalculatePetriNetService', () => {
  let service: CalculatePetriNetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatePetriNetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
