import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsBajoPedidoComponent } from './products-bajo-pedido.component';

describe('ProductsBajoPedidoComponent', () => {
  let component: ProductsBajoPedidoComponent;
  let fixture: ComponentFixture<ProductsBajoPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsBajoPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsBajoPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
