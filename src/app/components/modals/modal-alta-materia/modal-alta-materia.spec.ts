import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAltaMateria } from './modal-alta-materia';

describe('ModalAltaMateria', () => {
  let component: ModalAltaMateria;
  let fixture: ComponentFixture<ModalAltaMateria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAltaMateria],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAltaMateria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
