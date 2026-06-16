import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMasTarde } from './ver-mas-tarde';

describe('VerMasTarde', () => {
  let component: VerMasTarde;
  let fixture: ComponentFixture<VerMasTarde>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMasTarde]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMasTarde);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

