import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatAdicionalesComponent } from './cat-adicionales.component';

describe('CatAdicionalesComponent', () => {
  let component: CatAdicionalesComponent;
  let fixture: ComponentFixture<CatAdicionalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatAdicionalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatAdicionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
