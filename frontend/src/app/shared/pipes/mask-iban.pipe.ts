import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskIban',
  standalone: true
})
export class MaskIbanPipe implements PipeTransform {
  /**
   * Enmascara un número de cuenta/IBAN mostrando solo los últimos 4 dígitos
   * @param value - Número de cuenta completo
   * @returns String enmascarado en formato "**** 1234"
   */
  transform(value: string | null | undefined): string {
    if (!value || value.length < 4) {
      return '****';
    }

    const lastFour = value.slice(-4);
    return `**** ${lastFour}`;
  }
}
