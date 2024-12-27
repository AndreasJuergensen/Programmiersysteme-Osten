import { TestBed } from '@angular/core/testing';

import { CollectArcsService } from './collect-arcs.service';

describe('CollectArcsService', () => {
  let service: CollectArcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectArcsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
