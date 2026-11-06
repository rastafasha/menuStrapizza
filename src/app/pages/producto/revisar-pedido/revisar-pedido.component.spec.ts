import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisarPedidoComponent } from './revisar-pedido.component';

describe('RevisarPedidoComponent', () => {
  let component: RevisarPedidoComponent;
  let fixture: ComponentFixture<RevisarPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisarPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisarPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
