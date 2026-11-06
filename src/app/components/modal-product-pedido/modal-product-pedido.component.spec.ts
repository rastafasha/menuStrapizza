import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProductPedidoComponent } from './modal-product-pedido.component';

describe('ModalProductPedidoComponent', () => {
  let component: ModalProductPedidoComponent;
  let fixture: ComponentFixture<ModalProductPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalProductPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalProductPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
