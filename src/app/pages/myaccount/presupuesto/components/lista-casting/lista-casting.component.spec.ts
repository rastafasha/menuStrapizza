import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCastingComponent } from './lista-casting.component';

describe('ListaCastingComponent', () => {
  let component: ListaCastingComponent;
  let fixture: ComponentFixture<ListaCastingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCastingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCastingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
