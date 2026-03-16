import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalinfoPedidosComponent } from './modalinfo-pedidos.component';

describe('ModalinfoPedidosComponent', () => {
  let component: ModalinfoPedidosComponent;
  let fixture: ComponentFixture<ModalinfoPedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalinfoPedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalinfoPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
