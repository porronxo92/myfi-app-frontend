/**
 * Chatbot Service
 * ===============
 *
 * Servicio para gestionar la interacción con el agente conversacional financiero.
 * Mantiene el historial de conversación y se comunica con el endpoint del chat.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AIQuotaService } from './ai-quota.service';
import { LoggerService } from './logger.service';

// ============================================
// INTERFACES
// ============================================

/** Mensaje interno para UI y persistencia */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  error?: boolean;
  supportingData?: any;
  proposedAction?: ProposedAction;
}

/** Request al endpoint /api/insights/chat */
export interface ChatRequest {
  message: string;
}

/** Acción propuesta por el agente (requiere confirmación) */
export interface ProposedAction {
  type: 'create_transaction' | 'create_category';
  description: string;
  endpoint: string;
  data: Record<string, any>;
}

/** Respuesta del endpoint /api/insights/chat */
export interface ChatResponse {
  message: string;
  proposed_action: ProposedAction | null;
  suggested_questions: string[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = `${environment.apiUrl}/insights/chat`;
  private aiQuotaService = inject(AIQuotaService);
  private logger = inject(LoggerService);

  // BehaviorSubjects privados
  private _messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private _isTyping$ = new BehaviorSubject<boolean>(false);
  private _pendingAction$ = new BehaviorSubject<ProposedAction | null>(null);
  private _actionInProgress$ = new BehaviorSubject<boolean>(false);
  private conversationId: string = this.generateConversationId();

  // Observables públicos (read-only)
  public readonly messages$ = this._messages$.asObservable();
  public readonly isTyping$ = this._isTyping$.asObservable();
  public readonly pendingAction$ = this._pendingAction$.asObservable();
  public readonly actionInProgress$ = this._actionInProgress$.asObservable();

  // Exponer estado de cuota
  public readonly isQuotaExceeded$ = this.aiQuotaService.isQuotaExceeded;
  public readonly quotaInfo$ = this.aiQuotaService.quotaInfo;

  constructor(private http: HttpClient) {
    // Restaurar historial de sesión si existe
    this.restoreHistory();

    // Mensaje de bienvenida
    if (this._messages$.value.length === 0) {
      this.addWelcomeMessage();
    }
  }

  // ============================================
  // SEND MESSAGE
  // ============================================

  /** Enviar mensaje al agente */
  async sendMessage(userMessage: string): Promise<void> {
    // Limpiar acción pendiente si había una (usuario continúa conversación)
    if (this._pendingAction$.value) {
      this.clearPendingAction();
    }

    // Truncar y validar mensaje
    const trimmedMessage = userMessage.trim().substring(0, 2000);
    if (!trimmedMessage) return;

    // Verificar si se puede hacer la petición
    if (!this.aiQuotaService.canMakeAIRequest()) {
      const quotaInfo = this.aiQuotaService.getQuotaDisplayInfo();
      let errorText: string;

      if (this.aiQuotaService.isQuotaExceeded()) {
        errorText = `⚠️ Has alcanzado el límite de ${quotaInfo?.limit || 20} consultas de IA este mes. ` +
                    `Tu cuota se renovará el ${quotaInfo?.resetDate || 'próximo mes'}.`;
      } else {
        errorText = '⏳ Demasiadas peticiones. Por favor, espera unos segundos antes de intentarlo de nuevo.';
      }

      const errorMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: errorText,
        timestamp: new Date(),
        error: true
      };
      this.addMessage(errorMsg);
      return;
    }

    // Agregar mensaje del usuario
    const userMsg: ChatMessage = {
      id: this.generateMessageId(),
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date()
    };

    this.addMessage(userMsg);

    // Mostrar indicador de "escribiendo..."
    this._isTyping$.next(true);

    try {
      // Construir request (el historial lo gestiona el servidor)
      const request: ChatRequest = {
        message: trimmedMessage
      };

      // Llamar al endpoint del chat
      const response = await this.http.post<ChatResponse>(
        this.apiUrl,
        request
      ).toPromise();

      if (!response) throw new Error('No response from server');

      // Agregar respuesta del agente con proposed_action adjunta
      const agentMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: response.message,
        timestamp: new Date(),
        proposedAction: response.proposed_action || undefined
      };

      this.addMessage(agentMsg);

      // Si hay acción propuesta, establecerla como pendiente
      if (response.proposed_action) {
        this._pendingAction$.next(response.proposed_action);
      }

      // Guardar sugerencias para mostrar después
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        this.storeSuggestions(response.suggested_questions);
      }

    } catch (error: any) {
      this.logger.error('Error sending message', error);

      let errorText: string;

      // Verificar si es un error de cuota (enriquecido por el interceptor)
      if (error instanceof HttpErrorResponse && error.status === 422) {
        errorText = 'El mensaje es demasiado largo (máx. 2000 caracteres).';
      } else if (error instanceof HttpErrorResponse && error.status === 429) {
        errorText = error.error?._userMessage ||
                    'Has alcanzado el límite de consultas. Por favor, intenta más tarde.';
      } else if (error instanceof HttpErrorResponse && error.status === 500) {
        errorText = 'Error interno del servidor. Por favor, inténtalo de nuevo.';
      } else {
        errorText = 'Lo siento, tuve problemas para procesar tu pregunta. ¿Podrías intentarlo de nuevo?';
      }

      // Mensaje de error
      const errorMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: errorText,
        timestamp: new Date(),
        error: true
      };

      this.addMessage(errorMsg);
    } finally {
      this._isTyping$.next(false);
    }
  }

  // ============================================
  // ACTION EXECUTION
  // ============================================

  /** Ejecutar la acción pendiente tras confirmación del usuario */
  async executeAction(): Promise<{ success: boolean; message: string }> {
    const action = this._pendingAction$.value;
    if (!action) {
      return { success: false, message: 'No hay acción pendiente' };
    }

    this._actionInProgress$.next(true);

    try {
      // Parsear endpoint para obtener método y path
      const [method, path] = action.endpoint.split(' ');
      const url = `${environment.apiUrl}${path.replace('/api', '')}`;

      if (method === 'POST') {
        await this.http.post(url, action.data).toPromise();
      } else if (method === 'PUT') {
        await this.http.put(url, action.data).toPromise();
      } else {
        throw new Error(`Método HTTP no soportado: ${method}`);
      }

      // Mensaje de éxito
      const successMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: this.getSuccessMessage(action.type),
        timestamp: new Date()
      };
      this.addMessage(successMsg);

      this.clearPendingAction();
      return { success: true, message: 'Acción ejecutada correctamente' };

    } catch (error: any) {
      this.logger.error('Error executing action', error);

      const errorMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: `❌ Error al ejecutar la acción: ${error.error?.detail || error.message || 'Error desconocido'}`,
        timestamp: new Date(),
        error: true
      };
      this.addMessage(errorMsg);

      this.clearPendingAction();
      return { success: false, message: error.message };

    } finally {
      this._actionInProgress$.next(false);
    }
  }

  /** Cancelar la acción pendiente */
  cancelAction(): void {
    if (this._pendingAction$.value) {
      const cancelMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: 'Entendido, no se ha realizado ninguna acción. ¿Hay algo más en lo que pueda ayudarte?',
        timestamp: new Date()
      };
      this.addMessage(cancelMsg);
    }
    this.clearPendingAction();
  }

  /** Limpiar estado de acción pendiente */
  clearPendingAction(): void {
    this._pendingAction$.next(null);
  }

  /** Obtener mensaje de éxito según tipo de acción */
  private getSuccessMessage(actionType: string): string {
    switch (actionType) {
      case 'create_transaction':
        return '✅ ¡Transacción creada correctamente! He registrado el movimiento en tu cuenta.';
      case 'create_category':
        return '✅ ¡Categoría creada correctamente! Ya puedes usarla para clasificar tus transacciones.';
      default:
        return '✅ ¡Acción completada correctamente!';
    }
  }

  // Gestión de mensajes
  private addMessage(message: ChatMessage): void {
    const currentMessages = this._messages$.value;
    const newMessages = [...currentMessages, message];
    
    this._messages$.next(newMessages);
    this.saveHistory(newMessages);
  }

  clearHistory(): void {
    this._messages$.next([]);
    sessionStorage.removeItem(`chat_history_${this.conversationId}`);
    this.addWelcomeMessage();
  }

  // Mensaje de bienvenida
  private addWelcomeMessage(): void {
    const welcomeMsg: ChatMessage = {
      id: this.generateMessageId(),
      sender: 'agent',
      text: '¡Hola! 👋 Soy Mify, tu asistente financiero personal. Puedo ayudarte a entender tus finanzas, analizar gastos y darte recomendaciones. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    };
    
    this._messages$.next([welcomeMsg]);
  }

  // Persistencia de historial
  private saveHistory(messages: ChatMessage[]): void {
    try {
      // Guardar solo últimos 50 mensajes
      const recentMessages = messages.slice(-50);
      sessionStorage.setItem(
        `chat_history_${this.conversationId}`,
        JSON.stringify(recentMessages)
      );
    } catch (e) {
      this.logger.error('Error saving chat history');
    }
  }

  private restoreHistory(): void {
    try {
      const saved = sessionStorage.getItem(`chat_history_${this.conversationId}`);
      if (saved) {
        const messages = JSON.parse(saved);
        // Convertir timestamps de string a Date
        messages.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        this._messages$.next(messages);
      }
    } catch (e) {
      this.logger.error('Error restoring chat history');
    }
  }

  // Sugerencias rápidas
  getSuggestedQuestions(): string[] {
    const suggestions = sessionStorage.getItem('chat_suggestions');
    if (suggestions) {
      return JSON.parse(suggestions);
    }
    
    // Sugerencias por defecto
    return [
      '¿Cuánto gasté este mes?',
      '¿En qué categoría gasto más?',
      '¿Cómo van mis ahorros?',
      '¿Cuál es mi balance actual?',
      'Dame consejos para ahorrar'
    ];
  }

  private storeSuggestions(suggestions: string[]): void {
    sessionStorage.setItem('chat_suggestions', JSON.stringify(suggestions));
  }

  // Helpers
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConversationId(): string {
    // ID de conversación único por sesión
    let convId = sessionStorage.getItem('conversation_id');
    if (!convId) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('conversation_id', convId);
    }
    return convId;
  }

  // Análisis de sentimiento del mensaje (opcional)
  analyzeMessage(message: string): 'question' | 'statement' | 'command' {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('?') || 
        lowerMsg.startsWith('cuánto') ||
        lowerMsg.startsWith('cómo') ||
        lowerMsg.startsWith('qué') ||
        lowerMsg.startsWith('por qué') ||
        lowerMsg.startsWith('dónde')) {
      return 'question';
    }
    
    if (lowerMsg.startsWith('muestra') ||
        lowerMsg.startsWith('dame') ||
        lowerMsg.startsWith('explica')) {
      return 'command';
    }
    
    return 'statement';
  }
}
