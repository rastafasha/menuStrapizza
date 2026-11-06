import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BajoPedidoComponent } from './bajo-pedido.component';

describe('BajoPedidoComponent', () => {
  let component: BajoPedidoComponent;
  let fixture: ComponentFixture<BajoPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BajoPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BajoPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
