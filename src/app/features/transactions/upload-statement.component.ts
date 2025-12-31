import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FileUploadZoneComponent } from '../../shared/components/file-upload-zone.component';
import { UploadService } from '../../core/services/upload.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
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
                        <div class="description-main">{{ transaction.descripcion_nlp }}</div>
                        <div class="description-original">{{ transaction.descripcion_original }}</div>
                      </td>
                      <td class="category-cell">
                        <span 
                          class="category-badge" 
                          [class.editable]="transaction.categoria === 'Sin Categorizar'"
                          [attr.data-category]="transaction.categoria"
                          (click)="transaction.categoria === 'Sin Categorizar' && openCategoryEditor(transaction)"
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
    .upload-layout {
      min-height: 100vh;
      background: #f8fafc;
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.9375rem;
      color: #64748b;
      margin: 0.25rem 0 0;
    }

    /* Stepper */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .step-number {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #e2e8f0;
      color: #94a3b8;
      font-weight: 600;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: #3b82f6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #0f172a;
      font-weight: 600;
    }

    .step-line {
      width: 100px;
      height: 2px;
      background: #e2e8f0;
      transition: all 0.3s;
    }

    .step-line.completed {
      background: #10b981;
    }

    /* Step Content */
    .step-content {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .step-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
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
      width: 60px;
      height: 60px;
      border: 4px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 2rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .processing-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 1rem;
    }

    .processing-description {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .processing-file-info {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      border-radius: 8px;
      color: #475569;
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
      background: #f8fafc;
      padding: 2rem;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      overflow-y: auto;
    }

    .summary-card,
    .warnings-card,
    .account-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .summary-title,
    .warnings-title,
    .account-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bank-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #eff6ff;
      border-radius: 8px;
    }

    .period-info {
      text-align: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .period-info strong {
      display: block;
      font-size: 1.125rem;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .titular-name {
      font-size: 0.875rem;
      color: #64748b;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .summary-value {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .summary-item.income .summary-value {
      color: #10b981;
    }

    .summary-item.expense .summary-value {
      color: #ef4444;
    }

    .summary-item.balance {
      padding-top: 1rem;
      border-top: 2px solid #e2e8f0;
    }

    .summary-item.balance .summary-label {
      font-weight: 600;
      color: #0f172a;
    }

    .summary-item.balance .summary-value {
      font-size: 1.25rem;
      color: #3b82f6;
    }

    .summary-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.75rem 0;
    }

    /* Warnings Card */
    .warnings-card {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
    }

    .warnings-title {
      color: #f59e0b;
    }

    .warnings-list {
      margin: 0;
      padding-left: 1.25rem;
      color: #92400e;
    }

    .warnings-list li {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Account Card */
    .account-select {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .account-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .account-hint {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0 0 0.75rem;
      line-height: 1.4;
    }

    .account-help {
      font-size: 0.75rem;
      color: #ef4444;
      margin: 0.5rem 0 0;
    }

    /* Main Review Area */
    .review-main {
      padding: 2rem;
      display: flex;
      flex-direction: column;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .table-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .table-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-select-all {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-select-all:hover {
      background: #f1f5f9;
      border-color: #3b82f6;
      color: #3b82f6;
    }

    /* Table */
    .transactions-table-container {
      flex: 1;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .transactions-table thead {
      background: #f8fafc;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .transactions-table th {
      padding: 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .transactions-table td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .transactions-table tbody tr:hover {
      background: #f8fafc;
    }

    .transactions-table tbody tr.selected {
      background: #eff6ff;
    }

    .date-cell {
      font-size: 0.875rem;
      color: #64748b;
      white-space: nowrap;
    }

    .description-cell {
      max-width: 300px;
    }

    .description-main {
      font-weight: 500;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .description-original {
      font-size: 0.8125rem;
      color: #94a3b8;
    }

    .category-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 6px;
      background: #e0e7ff;
      color: #4338ca;
    }

    .category-badge.editable {
      cursor: pointer;
      background: #fef3c7;
      color: #92400e;
      border: 1px dashed #f59e0b;
      transition: all 0.2s;
    }

    .category-badge.editable:hover {
      background: #fde68a;
      border-color: #d97706;
      transform: translateY(-1px);
    }

    .amount-cell {
      font-weight: 600;
      font-size: 1rem;
      text-align: right;
      white-space: nowrap;
    }

    .amount-cell.income {
      color: #10b981;
    }

    .amount-cell.expense {
      color: #ef4444;
    }

    .type-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .type-badge.income {
      background: #d1fae5;
      color: #065f46;
    }

    .type-badge.expense {
      background: #fee2e2;
      color: #991b1b;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Footer */
    .review-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      border-radius: 0 0 12px 12px;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-secondary {
      background: white;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .btn-secondary:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }

    .modal-close {
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #475569;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0 0 1rem;
      color: #475569;
      line-height: 1.6;
    }

    .modal-account-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-radius: 8px;
      font-weight: 500;
      color: #0f172a;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .saving-modal {
      text-align: center;
      padding: 2rem;
    }

    .saving-modal h3 {
      margin: 1rem 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }

    .saving-modal p {
      color: #64748b;
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
    }

    .success-message {
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon {
      margin: 0 auto 1rem;
      animation: successPulse 0.6s ease-out;
    }

    @keyframes successPulse {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .success-message h3 {
      color: #10b981;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .success-message p {
      color: #475569;
      font-size: 1rem;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: white;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Category Modal */
    .category-modal {
      max-width: 500px;
    }

    .category-modal-description {
      color: #64748b;
      margin-bottom: 1rem;
    }

    .transaction-preview {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 3px solid #3b82f6;
    }

    .preview-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }

    .preview-description {
      font-weight: 500;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .preview-amount {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .preview-amount.income {
      color: #10b981;
    }

    .preview-amount.expense {
      color: #ef4444;
    }

    .loading-categories,
    .error-categories,
    .empty-categories {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .small-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .error-categories {
      color: #ef4444;
    }

    .error-categories svg {
      margin-bottom: 0.5rem;
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .category-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #0f172a;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      font-size: 0.9375rem;
    }

    .category-option:hover {
      background: #f8fafc;
      border-color: #3b82f6;
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
        border-bottom: 1px solid #e2e8f0;
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
    console.log('🔍 Cargando cuentas del usuario...');
    this.accountService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        console.log('✅ Cuentas cargadas:', accounts);
        console.log('📊 Total de cuentas:', accounts.length);
        this.accounts.set(accounts);
        
        // Verificar que el signal se actualizó
        console.log('🔄 Signal actualizado. Cuentas en signal:', this.accounts());
      },
      error: (err: any) => {
        console.error('❌ Error loading accounts', err);
        console.error('📍 Detalles del error:', err.error);
        console.error('🔢 Status code:', err.status);
      }
    });
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  startProcessing(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.currentStep.set('processing');

    this.uploadService.uploadStatement(file).subscribe({
      next: (response: UploadResponse) => {
        console.log('✅ Upload successful:', response);
        this.uploadResponse.set(response);
        this.currentStep.set('review');
      },
      error: (error: any) => {
        console.error('❌ Upload failed:', error);
        alert('Error al procesar el extracto: ' + (error.message || 'Error desconocido'));
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
          console.error(`Error guardando transacción ${index + 1}:`, error);
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
        console.error('Error loading categories:', err);
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
