/**
 * Global Chat Component
 * =====================
 *
 * Componente flotante global para el chat con el asistente financiero Mify.
 * Se renderiza en app.component y está disponible en todas las páginas.
 *
 * Características:
 * - FAB (Floating Action Button) fijo en esquina inferior derecha
 * - Panel lateral deslizante (no bloquea la página)
 * - Diseño WhatsApp-style con avatares y timestamps
 * - Limpia el historial al cerrar (conversación nueva cada vez)
 */

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ChatbotService, ChatMessage, ProposedAction } from '../../../core/services/chatbot.service';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import { SafeImagePipe } from '../../pipes/safe-image.pipe';

@Component({
  selector: 'app-global-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogComponent,
    SafeImagePipe
  ],
  templateUrl: './global-chat.component.html',
  styleUrls: ['./global-chat.component.scss']
})
export class GlobalChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Estado interno del panel
  isOpen = signal(false);
  userInput = '';
  readonly MAX_MESSAGE_LENGTH = 2000;

  // Dependencias
  private authService = inject(AuthService);
  private chatbotService = inject(ChatbotService);
  private destroy$ = new Subject<void>();

  // Auth state (expuestos al template)
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;

  // Chat state (del servicio)
  messages$ = this.chatbotService.messages$;
  isTyping$ = this.chatbotService.isTyping$;
  pendingAction$ = this.chatbotService.pendingAction$;
  actionInProgress$ = this.chatbotService.actionInProgress$;

  // Sugerencias de preguntas
  suggestedQuestions: string[] = [];

  // Control de scroll automático
  private shouldScroll = false;
  messages: ChatMessage[] = [];

  ngOnInit(): void {
    // Cargar sugerencias
    this.suggestedQuestions = this.chatbotService.getSuggestedQuestions();

    // Suscribirse a mensajes para control de scroll
    this.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msgs => {
        const hadMessages = this.messages.length > 0;
        this.messages = msgs;
        // Scroll solo si ya había mensajes (nuevo mensaje) o al abrir
        if (hadMessages || msgs.length === 1) {
          this.shouldScroll = true;
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================
  // Panel Open/Close
  // =====================

  toggleChat(): void {
    if (this.isOpen()) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat(): void {
    this.isOpen.set(true);
    this.shouldScroll = true;
  }

  closeChat(): void {
    if (this.isOpen()) {
      // RF-3: Limpiar historial al cerrar
      this.chatbotService.clearHistory();
      this.isOpen.set(false);
    }
  }

  // =====================
  // Messaging
  // =====================

  sendMessage(text?: string): void {
    const msg = (text || this.userInput).trim();
    if (!msg) return;

    this.chatbotService.sendMessage(msg);
    this.userInput = '';
    this.shouldScroll = true;
  }

  onEnter(event: KeyboardEvent): void {
    // Enter = enviar, Shift+Enter = nueva línea
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // =====================
  // Action Handling
  // =====================

  confirmAction(): void {
    this.chatbotService.executeAction();
  }

  cancelAction(): void {
    this.chatbotService.cancelAction();
  }

  getActionTitle(action: ProposedAction): string {
    return action.type === 'create_transaction'
      ? 'Confirmar Transacción'
      : 'Confirmar Categoría';
  }

  // =====================
  // Helpers
  // =====================

  formatTime(timestamp: Date): string {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      // Silenciar errores de scroll
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}
