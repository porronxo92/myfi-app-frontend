# Dashboard Redesign - Quick Integration Guide

## 🚀 Cómo Integrar los Nuevos Componentes

### Paso 1: Actualizar el Template Principal

Reemplaza el contenido del dashboard principal con la nueva estructura. En [dashboard.component.ts](../src/app/features/dashboard/dashboard.component.ts), importa los nuevos componentes:

```typescript
import { CategoryPieChartComponent } from './components/category-pie-chart.component';
import { MonthlyTrendChartComponent } from './components/monthly-trend-chart.component';
import { TopSpendingChartComponent } from './components/top-spending-chart.component';
import { FinancialChatbotComponent } from './components/financial-chatbot.component';
```

### Paso 2: Añadir Componentes al Array de Imports

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // ... otros imports existentes
    CategoryPieChartComponent,
    MonthlyTrendChartComponent,
    TopSpendingChartComponent,
    FinancialChatbotComponent
  ],
  // ...
})
```

### Paso 3: Usar los Nuevos Observables en el Template

Reemplaza las secciones existentes con la nueva estructura HTML que incluye:

#### Hero Section con Analytics
```html
<section class="hero-section">
  <div class="summary-cards" *ngIf="(dashboardData$ | async) as data">
    <div class="summary-card balance">
      <div class="card-content">
        <h3>Balance Total</h3>
        <p class="amount">€{{ data.summary?.total_balance | number:'1.2-2' }}</p>
        <span class="trend positive" *ngIf="data.summary?.balance_trend > 0">
          ↑ {{ data.summary?.balance_trend }}%
        </span>
      </div>
    </div>
    <!-- Similar para income y expenses -->
  </div>
</section>
```

#### Gráficos con Componentes
```html
<section class="charts-section">
  <div class="charts-grid" *ngIf="(dashboardData$ | async) as data">
    
    <div class="chart-container">
      <h3>Gastos por Categoría</h3>
      <app-category-pie-chart [data]="data.categoryBreakdown">
      </app-category-pie-chart>
    </div>

    <div class="chart-container">
      <h3>Tendencia Mensual</h3>
      <app-monthly-trend-chart [data]="data.trends">
      </app-monthly-trend-chart>
    </div>

    <div class="chart-container">
      <h3>Top Gastos</h3>
      <app-top-spending-chart 
        [data]="data.topMerchants"
        [type]="'merchants'">
      </app-top-spending-chart>
    </div>
    
  </div>
</section>
```

#### Chatbot
```html
<!-- Botón flotante -->
<button 
  class="chatbot-toggle" 
  (click)="toggleChatbot()"
  [class.active]="isChatbotOpen()">
  <svg>...</svg>
</button>

<!-- Sidebar -->
<app-financial-chatbot 
  *ngIf="isChatbotOpen()" 
  (close)="closeChatbot()">
</app-financial-chatbot>
```

### Paso 4: Verificar que los Estilos Estén Aplicados

Copia los estilos de [dashboard.component.html](../src/app/features/dashboard/dashboard.component.html) que se crearon previamente. Incluyen:

- CSS Variables
- Grid layouts responsive
- Animaciones (fadeInUp, fadeInDown, spin)
- Estilos para cards, charts, chatbot

### Paso 5: Probar la Integración

```bash
# Iniciar backend
cd backend
python -m app.main

# Iniciar frontend (otra terminal)
cd frontend
ng serve

# Navegar a http://localhost:4200/dashboard
```

---

## 🔍 Troubleshooting

### Problema: Charts no se muestran

**Solución**: Verificar que Chart.js esté instalado:
```bash
cd frontend
npm list chart.js
# Si no está: npm install chart.js
```

### Problema: Error "Cannot find module 'chart.js'"

**Solución**: Reiniciar el servidor de desarrollo:
```bash
# Ctrl+C para detener
ng serve
```

### Problema: Chatbot no responde

**Verificar**:
1. Backend corriendo en puerto 8000
2. Variable de entorno `GEMINI_API_KEY` configurada
3. Consola del navegador para errores de CORS

**Solución**:
```bash
# Verificar backend
curl http://localhost:8000/docs

# Verificar variable de entorno
cat backend/.env | grep GEMINI
```

### Problema: Filtros no actualizan datos

**Solución**: Verificar que el método `onFiltersChange` esté conectado:
```typescript
// En dashboard.component.ts
onFiltersChange(filters: any): void {
  this.dashboardState.updateFilters(filters);
}
```

---

## 📋 Checklist de Verificación

Antes de considerar la integración completa:

- [ ] Chart.js instalado (`npm list chart.js`)
- [ ] Todos los componentes importados en dashboard.component.ts
- [ ] Template actualizado con nuevas secciones
- [ ] Estilos SCSS aplicados
- [ ] Backend corriendo sin errores
- [ ] Variable GEMINI_API_KEY configurada
- [ ] Dashboard carga sin errores en consola
- [ ] Gráficos se renderizan correctamente
- [ ] Filtros actualizan datos
- [ ] Chatbot envía y recibe mensajes
- [ ] Responsive design funciona en mobile

---

## 🎯 Próximos Pasos

Una vez integrado, considera:

1. **Crear tests unitarios** para los nuevos servicios
2. **Añadir más preguntas sugeridas** al chatbot
3. **Personalizar paleta de colores** en ChartWrapperService
4. **Configurar notificaciones** para insights críticos
5. **Optimizar performance** con lazy loading de charts

---

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa la [documentación completa](./DASHBOARD_REDESIGN.md)
2. Verifica logs del backend: `backend/logsBackend/`
3. Inspecciona Network tab en DevTools
4. Revisa consola del navegador para errores JS

---

**¡Feliz integración! 🚀**
