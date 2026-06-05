import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCancelarComponent } from './modal-cancelar.component';

describe('ModalCancelarComponent', () => {
  let component: ModalCancelarComponent;
  let fixture: ComponentFixture<ModalCancelarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCancelarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCancelarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
