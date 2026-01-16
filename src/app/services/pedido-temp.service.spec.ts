import { TestBed } from '@angular/core/testing';

import { PedidoTempService } from './pedido-temp.service';

describe('PedidoTempService', () => {
  let service: PedidoTempService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoTempService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
