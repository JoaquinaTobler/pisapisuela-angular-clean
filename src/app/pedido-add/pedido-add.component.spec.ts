import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoAddComponent } from './pedido-add.component';

describe('PedidoAddComponent', () => {
  let component: PedidoAddComponent;
  let fixture: ComponentFixture<PedidoAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PedidoAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
