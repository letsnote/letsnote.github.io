import { TestBed } from '@angular/core/testing';

import { ShellControllerService } from './shell-controller.service';

describe('ShellControllerService', () => {
  let service: ShellControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShellControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
