import { TestBed } from '@angular/core/testing';

import { PetriNetManagementService } from './petri-net-management.service';

describe('PetriNetManagementService', () => {
  let service: PetriNetManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetriNetManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
