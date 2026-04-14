import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVerPreguntas } from './modal-ver-preguntas';

describe('ModalVerPreguntas', () => {
  let component: ModalVerPreguntas;
  let fixture: ComponentFixture<ModalVerPreguntas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVerPreguntas],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalVerPreguntas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
