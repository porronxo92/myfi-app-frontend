import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FileUploadZoneComponent } from '../../shared/components/file-upload-zone.component';
import { UploadService } from '../../core/services/upload.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { LoggerService } from '../../core/services/logger.service';
import { AIQuotaService } from '../../core/services/ai-quota.service';
import { UploadResponse, ProcessedTransaction, CreateTransactionDto, UploadStep } from '../../core/models/upload.model';
import { Account } from '../../core/models/account.model';
import { Category } from '../../core/models/category.model';
import { FormsModule } from '@angular/forms';

/**
 * Página de carga y procesamiento de extractos bancarios con IA
 * 
 * Flujo:
 * 1. Carga de archivo (drag & drop / selector)
 * 2. Procesamiento con Gemini AI
 * 3. Revisión y validación de movimientos
 * 4. Guardado en base de datos
 */
@Component({
  selector: 'app-upload-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FileUploadZoneComponent
  ],
  template: `
    <div class="upload-layout">
      <app-navbar></app-navbar>

      <main class="main-content">
        <!-- Cabecera -->
        <header class="page-header">
          <button class="btn-back" (click)="goBack()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <div class="header-text">
            <h1 class="page-title">Carga de Extractos Bancarios</h1>
            <p class="page-subtitle">Digitaliza tus movimientos bancarios con inteligencia artificial</p>
          </div>
        </header>

        <!-- Stepper de progreso -->
        <div class="stepper">
          <div class="step" [class.active]="currentStep() === 'upload'" [class.completed]="isStepCompleted('upload')">
            <div class="step-number">1</div>
            <div class="step-label">Carga</div>
          </div>
          <div class="step-line" [class.completed]="isStepCompleted('upload')"></div>
          <div class="step" [class.active]="currentStep() === 'processing'" [class.completed]="isStepCompleted('processing')">
            <div class="step-number">2</div>
            <div class="step-label">Procesamiento</div>
          </div>
          <div class="step-line" [class.completed]="isStepCompleted('processing')"></div>
          <div class="step" [class.active]="currentStep() === 'review'">
            <div class="step-number">3</div>
            <div class="step-label">Validación</div>
          </div>
        </div>

        <!-- PASO 1: Carga de archivo -->
        <div class="step-content" *ngIf="currentStep() === 'upload'">
          <app-file-upload-zone
            (fileSelected)="onFileSelected($event)"
          ></app-file-upload-zone>

          <!-- Error banner (quota exceeded or upload failure) -->
          <div class="upload-error-banner" *ngIf="uploadError()">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:2px">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="upload-error-text">
              <strong>No se pudo procesar el extracto</strong>
              <span>{{ uploadError() }}</span>
            </div>
          </div>

          <div class="step-actions" *ngIf="selectedFile()">
            <button class="btn btn-secondary" (click)="cancelUpload()">
              Cancelar
            </button>
            <button class="btn btn-primary" (click)="startProcessing()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Procesar extracto
            </button>
          </div>
        </div>

        <!-- PASO 2: Procesamiento -->
        <div class="step-content processing-step" *ngIf="currentStep() === 'processing'">
          <div class="processing-container">
            <div class="processing-spinner"></div>
            <h3 class="processing-title">Procesando extracto con IA...</h3>
            <p class="processing-description">
              Estamos analizando tu documento y extrayendo los movimientos bancarios.
              Este proceso puede tardar unos segundos.
            </p>
            <div class="processing-file-info">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>{{ selectedFile()?.name }}</span>
            </div>
          </div>
        </div>

        <!-- PASO 3: Revisión y validación -->
        <div class="step-content review-step" *ngIf="currentStep() === 'review' && uploadResponse()">
          <div class="review-layout">
            <!-- Panel lateral de información -->
            <aside class="summary-sidebar">
              <!-- Selector de Cuenta (Obligatorio) - PRIMERO -->
              <div class="account-card">
                <h3 class="account-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  Cuenta destino *
                </h3>
                <p class="account-hint">Elige la cuenta destino donde se cargarán estas transacciones</p>
                <select 
                  class="account-select"
                  [ngModel]="selectedAccountId()"
                  (ngModelChange)="selectedAccountId.set($event)"
                >
                  <option [value]="null">Seleccionar cuenta...</option>
                  <option *ngFor="let account of accounts()" [value]="account.id">
                    {{ account.name || account.account_name }}
                  </option>
                </select>
                <p class="account-help" *ngIf="!selectedAccountId()">
                  Debes seleccionar una cuenta para guardar las transacciones
                </p>
              </div>

              <!-- Card 1: Resumen del Período -->
              <div class="summary-card">
                <h3 class="summary-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Resumen del Período
                </h3>
                
                <div class="period-info">
                  <strong>{{ uploadResponse()!.data.resumen_periodo.periodo_completo }}</strong>
                  <div class="titular-name">{{ uploadResponse()!.data.resumen_periodo.titular }}</div>
                </div>

                <div class="summary-divider"></div>
                
                <div class="summary-item">
                  <span class="summary-label">Total Transacciones</span>
                  <span class="summary-value">{{ uploadResponse()!.data.metadatos.total_transacciones }}</span>
                </div>
                
                <div class="summary-item income">
                  <span class="summary-label">Total Ingresos</span>
                  <span class="summary-value">{{ formatCurrency(uploadResponse()!.data.resumen_periodo.total_ingresos) }}</span>
                </div>
                
                <div class="summary-item expense">
                  <span class="summary-label">Total Gastos</span>
                  <span class="summary-value">{{ formatCurrency(uploadResponse()!.data.resumen_periodo.total_gastos) }}</span>
                </div>

                <div class="summary-divider"></div>
                
                <div class="summary-item balance">
                  <span class="summary-label">Balance</span>
                  <span class="summary-value">{{ formatCurrency(uploadResponse()!.data.resumen_periodo.total_transacciones) }}</span>
                </div>
              </div>

              <!-- Card 2: Advertencias (si existen) -->
              <div class="warnings-card" *ngIf="uploadResponse()!.data.metadatos.advertencias.length > 0">
                <h3 class="warnings-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Advertencias de IA
                </h3>
                <ul class="warnings-list">
                  <li *ngFor="let warning of uploadResponse()!.data.metadatos.advertencias">
                    {{ warning }}
                  </li>
                </ul>
              </div>
            </aside>

            <!-- Tabla de movimientos -->
            <main class="review-main">
              <div class="table-header">
                <h3 class="table-title">Transacciones detectadas ({{ selectedCount() }} de {{ transactions().length }} seleccionadas)</h3>
                <div class="table-actions">
                  <button class="btn-select-all" (click)="toggleSelectAll()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ allSelected() ? 'Deseleccionar todos' : 'Seleccionar todos' }}
                  </button>
                </div>
              </div>

              <div class="transactions-table-container">
                <table class="transactions-table">
                  <thead>
                    <tr>
                      <th width="50">
                        <input 
                          type="checkbox"
                          [checked]="allSelected()"
                          (change)="toggleSelectAll()"
                        />
                      </th>
                      <th width="120">Fecha</th>
                      <th>Concepto</th>
                      <th width="200">Categoría</th>
                      <th width="140">Importe</th>
                      <th width="100">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      *ngFor="let transaction of paginatedTransactions()"
                      [class.selected]="transaction.selected"
                    >
                      <td>
                        <input 
                          type="checkbox"
                          [checked]="transaction.selected"
                          (change)="toggleTransaction(transaction)"
                        />
                      </td>
                      <td class="date-cell">{{ formatDate(transaction.fecha) }}</td>
                      <td class="description-cell">
                        <!-- Modo edición de descripción -->
                        <div *ngIf="isEditingDescription(transaction); else viewDescription" class="description-edit">
                          <input
                            class="desc-input"
                            type="text"
                            [ngModel]="tempDescription()"
                            (ngModelChange)="tempDescription.set($event)"
                            (keydown.enter)="confirmDescriptionEdit()"
                            (keydown.escape)="cancelDescriptionEdit()"
                            placeholder="Editar descripción"
                            autofocus
                          />
                          <div class="desc-actions">
                            <button class="btn-link save" (click)="confirmDescriptionEdit()" title="Guardar">
                              ✔ Guardar
                            </button>
                            <button class="btn-link cancel" (click)="cancelDescriptionEdit()" title="Cancelar">
                              ✖ Cancelar
                            </button>
                          </div>
                        </div>
                        <ng-template #viewDescription>
                          <div class="description-main">
                            {{ transaction.descripcion_nlp }}
                            <button class="btn-inline-edit" (click)="openDescriptionEditor(transaction)" title="Editar descripción">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M4 20h4l10.232-10.232a2.5 2.5 0 10-3.536-3.536L4 16v4z"/>
                              </svg>
                            </button>
                          </div>
                          <div class="description-original">{{ transaction.descripcion_original }}</div>
                        </ng-template>
                      </td>
                      <td class="category-cell">
                        <span 
                          class="category-badge" 
                          [class.editable]="true"
                          [class.uncategorized]="transaction.categoria === 'Sin Categorizar'"
                          [attr.data-category]="transaction.categoria"
                          (click)="openCategoryEditor(transaction)"
                          title="Editar categoría"
                        >
                          {{ transaction.categoria }}
                        </span>
                      </td>
                      <td class="amount-cell" [class.income]="transaction.tipo === 'income'" [class.expense]="transaction.tipo === 'expense'">
                        {{ formatCurrency(transaction.cantidad) }}
                      </td>
                      <td class="type-cell">
                        <span class="type-badge" [class.income]="transaction.tipo === 'income'" [class.expense]="transaction.tipo === 'expense'">
                          {{ transaction.tipo === 'income' ? 'Ingreso' : 'Gasto' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div class="pagination" *ngIf="totalPages() > 1">
                  <button 
                    class="pagination-btn" 
                    (click)="previousPage()" 
                    [disabled]="currentPage() === 1"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Anterior
                  </button>
                  
                  <span class="pagination-info">
                    Página {{ currentPage() }} de {{ totalPages() }}
                  </span>
                  
                  <button 
                    class="pagination-btn" 
                    (click)="nextPage()" 
                    [disabled]="currentPage() === totalPages()"
                  >
                    Siguiente
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <div class="empty-state" *ngIf="transactions().length === 0">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                  <p>No se encontraron transacciones en el extracto</p>
                </div>
              </div>
            </main>
          </div>

          <!-- Footer con acciones -->
          <footer class="review-footer">
            <button class="btn btn-secondary" (click)="discardAndReset()">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Descartar
            </button>
            <button 
              class="btn btn-primary" 
              (click)="saveTransactions()"
              [disabled]="!canSaveTransactions()"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Guardar {{ selectedCount() }} transaccion{{ selectedCount() !== 1 ? 'es' : '' }}
            </button>
          </footer>
        </div>

        <!-- Modal de confirmación -->
        <div class="modal-overlay" *ngIf="showConfirmModal()" (click)="closeConfirmModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirmar guardado</h3>
              <button class="modal-close" (click)="closeConfirmModal()">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas guardar <strong>{{ selectedCount() }} transaccion{{ selectedCount() !== 1 ? 'es' : '' }}</strong> en la cuenta seleccionada?</p>
              <p class="modal-account-info">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                {{ getSelectedAccountName() }}
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeConfirmModal()">
                Cancelar
              </button>
              <button class="btn btn-primary" (click)="confirmSaveTransactions()">
                Confirmar y guardar
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de guardado en progreso -->
        <div class="modal-overlay" *ngIf="isSaving()">
          <div class="modal-content saving-modal">
            <div *ngIf="!savingSuccess()">
              <div class="processing-spinner"></div>
              <h3>Guardando transacciones...</h3>
              <p>{{ savingProgress() }} de {{ selectedCount() }} transacciones guardadas</p>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="(savingProgress() / selectedCount()) * 100"></div>
              </div>
            </div>
            <div *ngIf="savingSuccess()" class="success-message">
              <svg class="success-icon" width="64" height="64" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3>¡Transacciones guardadas!</h3>
              <p>{{ savingProgress() }} transacciones se han guardado correctamente</p>
            </div>
          </div>
        </div>

        <!-- Modal de edición de categorías -->
        <div class="modal-overlay" *ngIf="showCategoryModal()" (click)="closeCategoryModal()">
          <div class="modal-content category-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Editar Categoría</h3>
              <button class="modal-close" (click)="closeCategoryModal()">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p class="category-modal-description">
                Selecciona una categoría apropiada para esta transacción:
              </p>
              <div class="transaction-preview" *ngIf="editingTransaction()">
                <div class="preview-label">Transacción:</div>
                <div class="preview-description">{{ editingTransaction()!.descripcion_nlp }}</div>
                <div class="preview-amount" [class.income]="editingTransaction()!.tipo === 'income'" [class.expense]="editingTransaction()!.tipo === 'expense'">
                  {{ formatCurrency(editingTransaction()!.cantidad) }}
                </div>
              </div>

              <!-- Loading state -->
              <div class="loading-categories" *ngIf="loadingCategories()">
                <div class="small-spinner"></div>
                <p>Cargando categorías...</p>
              </div>

              <!-- Error state -->
              <div class="error-categories" *ngIf="categoriesError()">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>{{ categoriesError() }}</p>
              </div>

              <!-- Categories list -->
              <div class="categories-list" *ngIf="!loadingCategories() && !categoriesError() && availableCategories().length > 0">
                <button 
                  *ngFor="let category of availableCategories()"
                  class="category-option"
                  (click)="selectCategory(category)"
                >
                  <span class="category-option-name">{{ category.name }}</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <div class="empty-categories" *ngIf="!loadingCategories() && !categoriesError() && availableCategories().length === 0">
                <p>No hay categorías disponibles para este tipo de transacción.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ========================================
       UPLOAD STATEMENT - INSTITUTIONAL
       ======================================== */

    .upload-layout {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      margin-bottom: var(--space-6);
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: transparent;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-back:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
      border-color: var(--color-slate-500);
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .page-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: var(--space-1) 0 0;
    }

    /* Stepper */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: var(--space-8);
      padding: var(--space-5);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .step-number {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-elevated);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.875rem;
      border: var(--border-subtle);
      transition: all var(--transition-fast);
    }

    .step.active .step-number {
      background: var(--color-accent);
      color: var(--color-slate-950);
      border-color: var(--color-accent);
    }

    .step.completed .step-number {
      background: var(--color-positive);
      color: white;
      border-color: var(--color-positive);
    }

    .step-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .step.active .step-label {
      color: var(--color-accent);
      font-weight: 600;
    }

    .step-line {
      width: 80px;
      height: 1px;
      background: var(--color-slate-700);
      transition: all var(--transition-fast);
    }

    .step-line.completed {
      background: var(--color-positive);
    }

    /* Step Content */
    .step-content {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--space-8);
      border: var(--border-subtle);
    }

    .step-actions {
      display: flex;
      justify-content: center;
      gap: var(--space-4);
      margin-top: var(--space-6);
    }

    /* Upload Error Banner */
    .upload-error-banner {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      background: rgba(202, 53, 33, 0.06);
      border: 1px solid rgba(202, 53, 33, 0.25);
      border-left: 3px solid var(--color-negative);
      border-radius: var(--radius-md);
      padding: var(--space-4) var(--space-5);
      margin-top: var(--space-5);
      color: var(--color-negative);
    }

    .upload-error-text {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .upload-error-text strong {
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .upload-error-text span {
      font-size: 0.8125rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Processing Step */
    .processing-step {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .processing-container {
      text-align: center;
      max-width: 400px;
    }

    .processing-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid var(--color-slate-700);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-6);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .processing-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .processing-description {
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: var(--space-6);
    }

    .processing-file-info {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      border: var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    /* Review Layout */
    .review-step {
      padding: 0;
      overflow: hidden;
    }

    .review-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      min-height: 600px;
    }

    /* Sidebar */
    .summary-sidebar {
      background: var(--bg-elevated);
      padding: var(--space-5);
      border-right: var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      overflow-y: auto;
    }

    .summary-card,
    .warnings-card,
    .account-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border: var(--border-subtle);
    }

    .summary-title,
    .warnings-title,
    .account-title {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0 0 var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bank-name {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-accent);
      margin-bottom: var(--space-4);
      padding: var(--space-3);
      background: var(--color-accent-subtle);
      border-radius: var(--radius-md);
    }

    .period-info {
      text-align: center;
      padding: var(--space-4);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      border: var(--border-subtle);
    }

    .period-info strong {
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .titular-name {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
    }

    .summary-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .summary-value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-data);
    }

    .summary-item.income .summary-value {
      color: var(--color-positive);
    }

    .summary-item.expense .summary-value {
      color: var(--color-negative);
    }

    .summary-item.balance {
      padding-top: var(--space-4);
      border-top: var(--border-subtle);
    }

    .summary-item.balance .summary-label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .summary-item.balance .summary-value {
      font-size: 1.125rem;
      color: var(--color-accent);
    }

    .summary-divider {
      height: 1px;
      background: var(--color-slate-700);
      margin: var(--space-3) 0;
    }

    /* Warnings Card */
    .warnings-card {
      border-left: 3px solid var(--color-warning);
      background: rgba(217, 119, 6, 0.1);
    }

    .warnings-title {
      color: var(--color-warning);
    }

    .warnings-list {
      margin: 0;
      padding-left: var(--space-5);
      color: var(--color-warning);
    }

    .warnings-list li {
      margin-bottom: var(--space-2);
      font-size: 0.8125rem;
      line-height: 1.5;
    }

    /* Account Card */
    .account-select {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: 0.875rem;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      color: var(--text-primary);
      cursor: pointer;
      transition: border-color var(--transition-fast);
    }

    .account-select:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .account-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0 0 var(--space-3);
      line-height: 1.4;
    }

    .account-help {
      font-size: 0.6875rem;
      color: var(--color-negative);
      margin: var(--space-2) 0 0;
    }

    /* Main Review Area */
    .review-main {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
    }

    .table-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .table-actions {
      display: flex;
      gap: var(--space-3);
    }

    .btn-select-all {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      font-size: 0.8125rem;
      font-weight: 500;
      background: transparent;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-select-all:hover {
      background: var(--bg-elevated);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    /* Table */
    .transactions-table-container {
      flex: 1;
      overflow-x: auto;
      border: var(--border-subtle);
      border-radius: var(--radius-lg);
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-card);
    }

    .transactions-table thead {
      background: var(--bg-elevated);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .transactions-table th {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: var(--border-subtle);
    }

    .transactions-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-slate-700);
      font-size: 0.8125rem;
      color: var(--text-primary);
    }

    .transactions-table tbody tr {
      transition: background var(--transition-fast);
    }

    .transactions-table tbody tr:hover {
      background: var(--bg-elevated);
    }

    .transactions-table tbody tr.selected {
      background: var(--color-accent-subtle);
    }

    .date-cell {
      font-size: 0.8125rem;
      color: var(--text-muted);
      white-space: nowrap;
      font-family: var(--font-data);
    }

    .description-cell {
      max-width: 300px;
    }

    .description-main {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .description-original {
      font-size: 0.75rem;
      color: var(--text-faint);
    }

    .btn-inline-edit {
      margin-left: var(--space-1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-inline-edit:hover {
      background: var(--bg-elevated);
      color: var(--color-accent);
      border-color: var(--color-accent);
    }

    .description-edit {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .desc-input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      font-size: 0.875rem;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      color: var(--text-primary);
      outline: none;
      transition: border-color var(--transition-fast);
    }

    .desc-input:focus {
      border-color: var(--color-accent);
    }

    .desc-actions {
      display: flex;
      gap: var(--space-3);
    }

    .btn-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-link.save { color: var(--color-positive); }
    .btn-link.cancel { color: var(--color-negative); }

    .category-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      background: var(--bg-elevated);
      color: var(--text-muted);
      border: var(--border-subtle);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .category-badge.editable {
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .category-badge.editable:hover {
      background: var(--bg-hover);
      border-color: var(--color-slate-500);
    }

    .category-badge.uncategorized {
      background: rgba(217, 119, 6, 0.1);
      color: var(--color-warning);
      border: 1px dashed var(--color-warning);
    }

    .category-badge.uncategorized:hover {
      background: rgba(217, 119, 6, 0.2);
    }

    .amount-cell {
      font-weight: 600;
      font-size: 0.9375rem;
      text-align: right;
      white-space: nowrap;
      font-family: var(--font-data);
    }

    .amount-cell.income {
      color: var(--color-positive);
    }

    .amount-cell.expense {
      color: var(--color-negative);
    }

    .type-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .type-badge.income {
      background: rgba(34, 160, 107, 0.1);
      color: var(--color-positive);
      border: 1px solid rgba(34, 160, 107, 0.2);
    }

    .type-badge.expense {
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
      border: 1px solid rgba(202, 53, 33, 0.2);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-10);
      color: var(--text-muted);
    }

    .empty-state svg {
      margin-bottom: var(--space-4);
      opacity: 0.5;
      color: var(--text-faint);
    }

    /* Footer */
    .review-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--bg-elevated);
      border-top: var(--border-subtle);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }

    .btn-primary:disabled {
      background: var(--color-slate-600);
      color: var(--text-faint);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: var(--border-subtle);
    }

    .btn-secondary:hover {
      background: var(--bg-elevated);
      border-color: var(--color-slate-500);
      color: var(--text-primary);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 17, 32, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      max-width: 500px;
      width: 90%;
      border: var(--border-subtle);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5);
      border-bottom: var(--border-subtle);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .modal-close {
      background: none;
      border: none;
      padding: var(--space-1);
      cursor: pointer;
      color: var(--text-muted);
      transition: color var(--transition-fast);
    }

    .modal-close:hover {
      color: var(--text-primary);
    }

    .modal-body {
      padding: var(--space-5);
    }

    .modal-body p {
      margin: 0 0 var(--space-4);
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.6;
    }

    .modal-account-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      border: var(--border-subtle);
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-5);
      border-top: var(--border-subtle);
    }

    .saving-modal {
      text-align: center;
      padding: var(--space-6);
    }

    .saving-modal h3 {
      margin: var(--space-4) 0 var(--space-2);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .saving-modal p {
      color: var(--text-muted);
      margin-bottom: var(--space-5);
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--color-slate-700);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-accent);
      transition: width 0.3s ease;
    }

    .success-message {
      text-align: center;
      padding: var(--space-4) 0;
    }

    .success-icon {
      margin: 0 auto var(--space-4);
      animation: successPulse 0.6s ease-out;
      color: var(--color-positive);
    }

    @keyframes successPulse {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .success-message h3 {
      color: var(--color-positive);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-2);
    }

    .success-message p {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      border-top: var(--border-subtle);
      background: var(--bg-elevated);
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      font-size: 0.8125rem;
      font-weight: 500;
      background: transparent;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Category Modal */
    .category-modal {
      max-width: 500px;
    }

    .category-modal-description {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: var(--space-4);
    }

    .transaction-preview {
      background: var(--bg-elevated);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-5);
      border-left: 3px solid var(--color-accent);
    }

    .preview-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 600;
      margin-bottom: var(--space-2);
      letter-spacing: 0.05em;
    }

    .preview-description {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      font-size: 0.875rem;
    }

    .preview-amount {
      font-size: 1rem;
      font-weight: 600;
      font-family: var(--font-data);
    }

    .preview-amount.income {
      color: var(--color-positive);
    }

    .preview-amount.expense {
      color: var(--color-negative);
    }

    .loading-categories,
    .error-categories,
    .empty-categories {
      text-align: center;
      padding: var(--space-6);
      color: var(--text-muted);
    }

    .small-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-slate-700);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }

    .error-categories {
      color: var(--color-negative);
    }

    .error-categories svg {
      margin-bottom: var(--space-2);
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 400px;
      overflow-y: auto;
    }

    .category-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;
      font-size: 0.875rem;
    }

    .category-option:hover {
      background: var(--bg-hover);
      border-color: var(--color-accent);
      transform: translateX(4px);
    }

    .category-option-name {
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .review-layout {
        grid-template-columns: 1fr;
      }

      .summary-sidebar {
        border-right: none;
        border-bottom: var(--border-subtle);
      }
    }
  `]
})
export class UploadStatementComponent implements OnInit {
  // Signals para el estado
  currentStep = signal<UploadStep>('upload');
  selectedFile = signal<File | null>(null);
  uploadResponse = signal<UploadResponse | null>(null);
  selectedAccountId = signal<string | null>(null);
  accounts = signal<Account[]>([]);
  showConfirmModal = signal(false);
  isSaving = signal(false);
  savingProgress = signal(0);
  savingSuccess = signal(false);
  
  // Paginación
  currentPage = signal(1);
  pageSize = 7;
  
  // Editor de categorías
  showCategoryModal = signal(false);
  editingTransaction = signal<ProcessedTransaction | null>(null);
  availableCategories = signal<Category[]>([]);
  loadingCategories = signal(false);
  categoriesError = signal<string | null>(null);
  
  // Edición de descripción
  editingDescription = signal<ProcessedTransaction | null>(null);
  tempDescription = signal<string>('');

  // Error de carga/IA (reemplaza el alert genérico)
  uploadError = signal<string | null>(null);

  // Computed signals
  transactions = computed(() => {
    const response = this.uploadResponse();
    if (!response) return [];
    
    // Marcar todas como seleccionadas por defecto y ordenar por fecha
    return response.data.transacciones
      .map(t => ({
        ...t,
        selected: t.selected ?? true
      }))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  });

  // Transacciones paginadas
  paginatedTransactions = computed(() => {
    const trans = this.transactions();
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return trans.slice(start, end);
  });

  totalPages = computed(() => 
    Math.ceil(this.transactions().length / this.pageSize)
  );

  selectedCount = computed(() => 
    this.transactions().filter(t => t.selected).length
  );

  allSelected = computed(() => {
    const trans = this.transactions();
    return trans.length > 0 && trans.every(t => t.selected);
  });

  canSaveTransactions = computed(() => {
    const accountId = this.selectedAccountId();
    return accountId !== null && accountId !== undefined && this.selectedCount() > 0;
  });

  private logger = inject(LoggerService);
  private aiQuotaService = inject(AIQuotaService);

  constructor(
    private router: Router,
    private uploadService: UploadService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.accounts.set(accounts);
      },
      error: () => {
        this.logger.error('Error loading accounts');
      }
    });
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.uploadError.set(null);
  }

  startProcessing(): void {
    const file = this.selectedFile();
    if (!file) return;

    // Guard: verificar cuota de IA antes de subir el archivo
    if (!this.aiQuotaService.canMakeAIRequest()) {
      const info = this.aiQuotaService.quotaInfo();
      this.uploadError.set(
        info?.message || 'Has alcanzado el límite de consultas de IA. Por favor, intenta más tarde.'
      );
      return;
    }

    this.uploadError.set(null);
    this.currentStep.set('processing');

    this.uploadService.uploadStatement(file).subscribe({
      next: (response: UploadResponse) => {
        this.uploadResponse.set(response);
        this.currentStep.set('review');
      },
      error: (error: any) => {
        this.logger.error('Upload failed');
        const message = error?.error?._userMessage
          || error?.error?.detail?.message
          || 'No se pudo procesar el extracto. Por favor, inténtalo de nuevo.';
        this.uploadError.set(message);
        this.currentStep.set('upload');
      }
    });
  }

  cancelUpload(): void {
    this.selectedFile.set(null);
  }

  discardAndReset(): void {
    this.resetState();
  }

  saveTransactions(): void {
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  confirmSaveTransactions(): void {
    this.showConfirmModal.set(false);
    this.isSaving.set(true);
    this.savingProgress.set(0);

    const selectedTransactions = this.transactions().filter(t => t.selected);
    const accountId = this.selectedAccountId()!;

    let savedCount = 0;

    // Guardar transacciones secuencialmente
    const saveNext = (index: number) => {
      if (index >= selectedTransactions.length) {
        // Todas guardadas - mostrar éxito en el modal
        this.isSaving.set(false);
        this.showSuccessInModal(savedCount);
        setTimeout(() => {
          this.closeConfirmModal();
          this.resetState();
        }, 2000);
        return;
      }

      const transaction = selectedTransactions[index];
      const dto: CreateTransactionDto = {
        date: transaction.fecha,
        amount: Math.abs(transaction.cantidad), // Siempre positivo
        description: transaction.descripcion_nlp,
        category_id: transaction.categoria, // El backend acepta nombre de categoría
        type: transaction.tipo,
        notes: '',
        tags: [],
        account_id: accountId
      };

      this.transactionService.createTransaction(dto).subscribe({
        next: () => {
          savedCount++;
          this.savingProgress.set(savedCount);
          saveNext(index + 1);
        },
        error: (error: any) => {
          this.logger.error('Error guardando transacción');
          // Continuar con la siguiente aunque falle
          saveNext(index + 1);
        }
      });
    };

    saveNext(0);
  }

  toggleSelectAll(): void {
    const allCurrentlySelected = this.allSelected();
    const response = this.uploadResponse();
    if (!response) return;

    this.uploadResponse.set({
      ...response,
      data: {
        ...response.data,
        transacciones: response.data.transacciones.map(t => ({
          ...t,
          selected: !allCurrentlySelected
        }))
      }
    });
  }

  toggleTransaction(transaction: ProcessedTransaction): void {
    const response = this.uploadResponse();
    if (!response) return;

    // Buscar por fecha, cantidad y descripción para identificar la transacción
    this.uploadResponse.set({
      ...response,
      data: {
        ...response.data,
        transacciones: response.data.transacciones.map(t => 
          t.fecha === transaction.fecha && 
          t.cantidad === transaction.cantidad && 
          t.descripcion_nlp === transaction.descripcion_nlp
            ? { ...t, selected: !t.selected } 
            : t
        )
      }
    });
  }

  getSelectedAccountName(): string {
    const account = this.accounts().find(a => a.id === this.selectedAccountId());
    return account?.name || account?.account_name || '';
  }

  resetState(): void {
    this.currentStep.set('upload');
    this.selectedFile.set(null);
    this.uploadResponse.set(null);
    this.selectedAccountId.set(null);
    this.savingProgress.set(0);
    this.savingSuccess.set(false);
    this.currentPage.set(1);
  }

  showSuccessInModal(count: number): void {
    this.savingSuccess.set(true);
  }

  // Paginación
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // Editor de categorías
  openCategoryEditor(transaction: ProcessedTransaction): void {
    this.editingTransaction.set(transaction);
    this.showCategoryModal.set(true);
    this.loadCategoriesForType(transaction.tipo);
  }

  closeCategoryModal(): void {
    this.showCategoryModal.set(false);
    this.editingTransaction.set(null);
    this.availableCategories.set([]);
    this.categoriesError.set(null);
  }

  loadCategoriesForType(type: 'expense' | 'income'): void {
    this.loadingCategories.set(true);
    this.categoriesError.set(null);

    this.categoryService.getAllAvailableCategories(type).subscribe({
      next: (categories: Category[]) => {
        this.availableCategories.set(categories);
        this.loadingCategories.set(false);
      },
      error: (err: any) => {
        this.logger.error('Error loading categories');
        this.categoriesError.set('Error al cargar las categorías. Por favor, intenta de nuevo.');
        this.loadingCategories.set(false);
      }
    });
  }

  selectCategory(category: Category): void {
    const transaction = this.editingTransaction();
    if (!transaction) return;

    // Actualizar la categoría de la transacción
    const response = this.uploadResponse();
    if (!response) return;

    const updatedTransactions = response.data.transacciones.map(t => {
      if (t.fecha === transaction.fecha && t.descripcion_nlp === transaction.descripcion_nlp) {
        return { ...t, categoria: category.name };
      }
      return t;
    });

    this.uploadResponse.set({
      ...response,
      data: {
        ...response.data,
        transacciones: updatedTransactions
      }
    });

    this.closeCategoryModal();
  }

  // Editor de descripción inline
  isEditingDescription(transaction: ProcessedTransaction): boolean {
    const current = this.editingDescription();
    return !!current &&
      current.fecha === transaction.fecha &&
      current.cantidad === transaction.cantidad &&
      current.descripcion_nlp === transaction.descripcion_nlp;
  }

  openDescriptionEditor(transaction: ProcessedTransaction): void {
    this.editingDescription.set(transaction);
    this.tempDescription.set(transaction.descripcion_nlp || '');
  }

  cancelDescriptionEdit(): void {
    this.editingDescription.set(null);
    this.tempDescription.set('');
  }

  confirmDescriptionEdit(): void {
    const editing = this.editingDescription();
    const newDesc = (this.tempDescription() || '').trim();
    if (!editing) return;

    // Si no hay cambios, solo cerrar
    if (newDesc === (editing.descripcion_nlp || '')) {
      this.cancelDescriptionEdit();
      return;
    }

    const response = this.uploadResponse();
    if (!response) return;

    // Actualizar descripción en la lista principal
    const updated = response.data.transacciones.map(t =>
      t.fecha === editing.fecha && t.cantidad === editing.cantidad && t.descripcion_nlp === editing.descripcion_nlp
        ? { ...t, descripcion_nlp: newDesc }
        : t
    );

    this.uploadResponse.set({
      ...response,
      data: { ...response.data, transacciones: updated }
    });

    this.cancelDescriptionEdit();
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  isStepCompleted(step: UploadStep): boolean {
    const steps: UploadStep[] = ['upload', 'processing', 'review'];
    const currentIndex = steps.indexOf(this.currentStep());
    const stepIndex = steps.indexOf(step);
    return currentIndex > stepIndex;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}
