import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInstruccionesComponent } from './modal-instrucciones.component';

describe('ModalInstruccionesComponent', () => {
  let component: ModalInstruccionesComponent;
  let fixture: ComponentFixture<ModalInstruccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInstruccionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalInstruccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
