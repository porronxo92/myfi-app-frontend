/**
 * Chatbot Service
 * ===============
 * 
 * Servicio para gestionar la interacción con el agente conversacional financiero.
 * Mantiene el historial de conversación y se comunica con el endpoint del chat.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  error?: boolean;
  supportingData?: any;
}

export interface ChatResponse {
  response: string;
  context_used: string[];
  suggested_questions: string[];
  supporting_data?: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  
  private apiUrl = `${environment.apiUrl}/insights/chat`;
  
  // BehaviorSubjects privados
  private _messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private _isTyping$ = new BehaviorSubject<boolean>(false);
  private conversationId: string = this.generateConversationId();

  // Observables públicos (read-only)
  public readonly messages$ = this._messages$.asObservable();
  public readonly isTyping$ = this._isTyping$.asObservable();

  constructor(private http: HttpClient) {
    // Restaurar historial de sesión si existe
    this.restoreHistory();
    
    // Mensaje de bienvenida
    if (this._messages$.value.length === 0) {
      this.addWelcomeMessage();
    }
  }

  // Enviar mensaje al agente
  async sendMessage(userMessage: string): Promise<void> {
    if (!userMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMsg: ChatMessage = {
      id: this.generateMessageId(),
      sender: 'user',
      text: userMessage.trim(),
      timestamp: new Date()
    };
    
    this.addMessage(userMsg);
    
    // Mostrar indicador de "escribiendo..."
    this._isTyping$.next(true);

    try {
      // Llamar al endpoint del chat
      const response = await this.http.post<ChatResponse>(
        this.apiUrl,
        { message: userMessage }
      ).toPromise();

      if (!response) throw new Error('No response from server');

      // Agregar respuesta del agente
      const agentMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: response.response,
        timestamp: new Date(),
        supportingData: response.supporting_data
      };
      
      this.addMessage(agentMsg);
      
      // Guardar sugerencias para mostrar después
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        this.storeSuggestions(response.suggested_questions);
      }
      
    } catch (error: any) {
      console.error('Error sending message');
      
      // Mensaje de error
      const errorMsg: ChatMessage = {
        id: this.generateMessageId(),
        sender: 'agent',
        text: 'Lo siento, tuve problemas para procesar tu pregunta. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date()
      };
      
      this.addMessage(errorMsg);
    } finally {
      this._isTyping$.next(false);
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
      text: '¡Hola! 👋 Soy tu asistente financiero personal. Puedo ayudarte a entender tus finanzas, analizar gastos y darte recomendaciones. ¿En qué puedo ayudarte hoy?',
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
      console.error('Error saving chat history');
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
      console.error('Error restoring chat history');
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
