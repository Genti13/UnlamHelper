import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAltaPregunta } from './modal-alta-pregunta';

describe('ModalAltaPregunta', () => {
  let component: ModalAltaPregunta;
  let fixture: ComponentFixture<ModalAltaPregunta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAltaPregunta],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAltaPregunta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
