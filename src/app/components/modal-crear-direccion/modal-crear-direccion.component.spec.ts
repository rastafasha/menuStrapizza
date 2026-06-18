import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearDireccionComponent } from './modal-crear-direccion.component';

describe('ModalCrearDireccionComponent', () => {
  let component: ModalCrearDireccionComponent;
  let fixture: ComponentFixture<ModalCrearDireccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearDireccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearDireccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
