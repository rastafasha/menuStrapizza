import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasProductsComponent } from './cas-products.component';

describe('CasProductsComponent', () => {
  let component: CasProductsComponent;
  let fixture: ComponentFixture<CasProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
