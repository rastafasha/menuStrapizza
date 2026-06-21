import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreciosDeliveryComponent } from './precios-delivery.component';

describe('PreciosDeliveryComponent', () => {
  let component: PreciosDeliveryComponent;
  let fixture: ComponentFixture<PreciosDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreciosDeliveryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreciosDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
