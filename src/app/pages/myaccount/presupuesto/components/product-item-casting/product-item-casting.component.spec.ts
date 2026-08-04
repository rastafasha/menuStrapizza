import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductItemCastingComponent } from './product-item-casting.component';

describe('ProductItemCastingComponent', () => {
  let component: ProductItemCastingComponent;
  let fixture: ComponentFixture<ProductItemCastingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductItemCastingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductItemCastingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
