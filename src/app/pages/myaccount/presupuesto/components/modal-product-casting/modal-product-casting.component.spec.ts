import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProductCastingComponent } from './modal-product-casting.component';

describe('ModalProductCastingComponent', () => {
  let component: ModalProductCastingComponent;
  let fixture: ComponentFixture<ModalProductCastingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalProductCastingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalProductCastingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
