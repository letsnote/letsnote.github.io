import { TestBed } from '@angular/core/testing';

import { HeaderObserverService } from './header-observer.service';

describe('HeaderObserverService', () => {
  let service: HeaderObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
