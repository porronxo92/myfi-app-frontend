import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

console.log('🎬 [MAIN.TS] Iniciando aplicación...');
console.log('  - Environment production:', environment.production);
console.log('  - Environment apiUrl:', environment.apiUrl);
console.log('  - Environment apiBaseUrl:', environment.apiBaseUrl);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
