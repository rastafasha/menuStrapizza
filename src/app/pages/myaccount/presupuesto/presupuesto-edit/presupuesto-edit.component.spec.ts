import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoEditComponent } from './presupuesto-edit.component';

describe('PresupuestoEditComponent', () => {
  let component: PresupuestoEditComponent;
  let fixture: ComponentFixture<PresupuestoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestoEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
