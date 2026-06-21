import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearDireccionExpressComponent } from './modal-crear-direccion-express.component';

describe('ModalCrearDireccionExpressComponent', () => {
  let component: ModalCrearDireccionExpressComponent;
  let fixture: ComponentFixture<ModalCrearDireccionExpressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearDireccionExpressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearDireccionExpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
