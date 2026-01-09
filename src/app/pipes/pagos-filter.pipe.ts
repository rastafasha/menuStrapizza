import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod } from '../models/paymenthmethod.model';

@Pipe({
  name: 'pagosFilter'
})
export class PagosFilterPipe implements PipeTransform {

  transform(paymentMethods: PaymentMethod[]): PaymentMethod[] {
    if (!paymentMethods) {
      return [];
    }
    return paymentMethods.filter(method => method.tipo !== 'cheque');
  }

}
