import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * MarkdownPipe
 * ============
 * Convierte markdown básico a HTML seguro para renderizar en el chat.
 *
 * Soporta:
 * - **negrita**
 * - *cursiva*
 * - `código inline`
 * - Listas con * o -
 * - Saltos de línea
 */
@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(text: string): SafeHtml {
    if (!text) return '';

    let html = text;

    // Escapar HTML base para seguridad (excepto los que generamos)
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Procesar bloques de lista (líneas que empiezan por * o -)
    html = this.processLists(html);

    // Negrita: **texto**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Cursiva: *texto* (solo si no es parte de una lista ya procesada)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    // Código inline: `texto`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Saltos de línea (los que no son listas)
    html = html.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private processLists(text: string): string {
    const lines = text.split('\n');
    const result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^(\s*)[*\-]\s+(.+)$/);

      if (listMatch) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push(`<li>${listMatch[2]}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }
}
