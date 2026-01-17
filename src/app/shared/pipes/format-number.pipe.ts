import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear números con un número específico de decimales
 * Maneja casos donde el valor puede ser string o undefined
 */
@Pipe({
  name: 'formatNumber',
  standalone: true
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: any, decimals: number = 2): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '0.00';
    }

    return numValue.toFixed(decimals);
  }
}
