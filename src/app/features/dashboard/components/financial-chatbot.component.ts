/**
 * Financial Chatbot Component
 * ============================
 * 
 * Conversational AI sidebar for financial queries and insights
 * 
 * Features:
 * - Real-time chat with financial agent
 * - Message history with persistence
 * - Typing indicators
 * - Suggested questions
 * - Auto-scroll to latest message
 * - Error handling
 */

import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { ChatbotService, ChatMessage } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-financial-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-chatbot.component.html',
  styleUrls: ['./financial-chatbot.component.scss']
})
export class FinancialChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Output() close = new EventEmitter<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private shouldScroll = false;
  
  messages: ChatMessage[] = [];
  isTyping$!: Observable<boolean>;
  userInput = '';
  suggestedQuestions: string[] = [];
  
  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    // Initialize isTyping$ observable
    this.isTyping$ = this.chatbotService.isTyping$;
    
    // Subscribe to messages
    this.chatbotService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.shouldScroll = true;
      });

    // Load suggested questions
    this.suggestedQuestions = this.chatbotService.getSuggestedQuestions();
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

  /**
   * Send a message
   */
  sendMessage(message?: string): void {
    const textToSend = message || this.userInput.trim();
    
    if (!textToSend) {
      return;
    }

    // Clear input if sending from textarea
    if (!message) {
      this.userInput = '';
    }

    // Send to chatbot service
    this.chatbotService.sendMessage(textToSend);
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    if (confirm('¿Estás seguro de que quieres borrar el historial de conversación?')) {
      this.chatbotService.clearHistory();
    }
  }

  /**
   * Close chatbot
   */
  closeChatbot(): void {
    this.close.emit();
  }

  /**
   * Scroll to bottom of messages
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Format timestamp
   */
  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Track by function for ngFor
   */
  trackByMessage(index: number, message: ChatMessage): string {
    return `${message.timestamp}-${index}`;
  }
}
