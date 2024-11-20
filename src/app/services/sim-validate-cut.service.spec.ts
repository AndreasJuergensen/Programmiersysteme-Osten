import { TestBed } from '@angular/core/testing';

import { SimValidateCutService } from './sim-validate-cut.service';

describe('SimValidateCutService', () => {
  let service: SimValidateCutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimValidateCutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
