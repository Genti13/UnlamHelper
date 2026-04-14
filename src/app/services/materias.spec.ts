import { TestBed } from '@angular/core/testing';

import { Materias } from './materias';

describe('Materias', () => {
  let service: Materias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Materias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
