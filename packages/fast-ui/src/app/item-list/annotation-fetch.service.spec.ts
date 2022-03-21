import { TestBed } from '@angular/core/testing';
import { AnnotationFetchService } from './annotation-fetch.service';

describe('PartialAnnotationFetchService', () => {
  let service: AnnotationFetchService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
