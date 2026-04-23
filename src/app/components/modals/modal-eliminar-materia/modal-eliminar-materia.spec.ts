import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEliminarMateria } from './modal-eliminar-materia';

describe('ModalEliminarMateria', () => {
  let component: ModalEliminarMateria;
  let fixture: ComponentFixture<ModalEliminarMateria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEliminarMateria],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalEliminarMateria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
