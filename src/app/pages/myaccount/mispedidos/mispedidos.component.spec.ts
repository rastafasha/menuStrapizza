import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MispedidosComponent } from './mispedidos.component';

describe('MispedidosComponent', () => {
  let component: MispedidosComponent;
  let fixture: ComponentFixture<MispedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MispedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MispedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
