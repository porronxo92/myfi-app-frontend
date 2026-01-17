/**
 * Chart Wrapper Service
 * =====================
 * 
 * Servicio para configurar y gestionar Chart.js con configuraciones base reutilizables.
 */

import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Injectable({
  providedIn: 'root'
})
export class ChartWrapperService {

  // Paleta de colores consistente
  private colorPalette = [
    '#6366f1', // Índigo
    '#10b981', // Verde
    '#ef4444', // Rojo
    '#f59e0b', // Naranja
    '#3b82f6', // Azul
    '#8b5cf6', // Púrpura
    '#ec4899', // Rosa
    '#14b8a6', // Teal
    '#f97316', // Naranja oscuro
    '#06b6d4', // Cyan
  ];

  constructor() {}

  /**
   * Configuración base para pie/doughnut charts
   */
  getPieChartConfig(data: any, title: string = ''): ChartConfiguration {
    return {
      type: 'doughnut' as ChartType,
      data: {
        labels: data.labels || [],
        datasets: [{
          data: data.data || [],
          backgroundColor: data.backgroundColor || this.colorPalette,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#111827'
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              color: '#6b7280',
              usePointStyle: true
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: €${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          duration: 800
        }
      }
    };
  }

  /**
   * Configuración base para line charts
   */
  getLineChartConfig(data: any, title: string = ''): ChartConfiguration {
    return {
      type: 'line' as ChartType,
      data: {
        labels: data.labels || [],
        datasets: data.datasets?.map((dataset: any, index: number) => ({
          ...dataset,
          borderColor: dataset.borderColor || this.colorPalette[index],
          backgroundColor: dataset.backgroundColor || 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false
        })) || []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#111827'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              color: '#6b7280',
              usePointStyle: true
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: €${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              callback: function(value: any) {
                return '€' + value.toLocaleString();
              }
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        }
      }
    };
  }

  /**
   * Configuración base para bar charts
   */
  getBarChartConfig(data: any, title: string = '', horizontal: boolean = false): ChartConfiguration {
    return {
      type: (horizontal ? 'bar' : 'bar') as ChartType,
      data: {
        labels: data.labels || [],
        datasets: data.datasets?.map((dataset: any, index: number) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || this.generateGradient(index),
          borderColor: dataset.borderColor || this.colorPalette[index],
          borderWidth: 0,
          borderRadius: 8
        })) || []
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#111827'
          },
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.x || context.parsed.y || 0;
                return `Total: €${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              callback: function(value: any) {
                return horizontal ? '€' + value.toLocaleString() : value;
              }
            }
          },
          y: {
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              callback: function(value: any) {
                return !horizontal ? '€' + value.toLocaleString() : value;
              }
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        }
      }
    };
  }

  /**
   * Genera un gradiente de color
   */
  private generateGradient(index: number): string {
    return this.colorPalette[index % this.colorPalette.length];
  }

  /**
   * Obtiene un color de la paleta
   */
  getColor(index: number): string {
    return this.colorPalette[index % this.colorPalette.length];
  }

  /**
   * Obtiene toda la paleta de colores
   */
  getColorPalette(): string[] {
    return [...this.colorPalette];
  }

  /**
   * Configuración específica para Doughnut Charts con mejor presentación
   */
  getDoughnutChartConfig(data: any, title: string = ''): ChartConfiguration {
    return {
      type: 'doughnut' as ChartType,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 14,
              weight: 'bold'
            },
            color: '#111827'
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 12,
              font: {
                size: 11
              },
              color: '#6b7280',
              usePointStyle: true,
              generateLabels: (chart: any) => {
                const datasets = chart.data.datasets;
                return chart.data.labels.map((label: string, i: number) => ({
                  text: label,
                  fillStyle: datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const dataset = context.dataset.data;
                const total = dataset.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: €${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        }
      }
    };
  }

  /**
   * Destruye un chart de forma segura
   */
  destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }
}
