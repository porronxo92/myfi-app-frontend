# Solución: Error 431 (Request Header Fields Too Large) en Imágenes de Perfil

## 🔴 Problema

Al cargar o mostrar imágenes de perfil, se produce el error:
```
GET http://localhost:4200/9j/4AAQSkZJRgABAQAAAQABAAD/... 431 (Request Header Fields Too Large)
```

## 🔍 Causa Raíz

1. **Backend devuelve base64 puro**: El servidor envía la imagen sin el prefijo `data:image/jpeg;base64,`
2. **Angular asigna al src**: El valor base64 puro se asigna a `[src]` del `<img>`
3. **Navegador interpreta como URL**: El navegador intenta cargar `/9j/4AAQ...` como URL relativa
4. **Timing issue**: Angular renderiza ANTES de que el pipe se ejecute completamente
5. **Request gigante**: El navegador genera petición HTTP con la cadena base64 en la URL
6. **Headers demasiado grandes**: Los headers exceden el límite → Error 431

## ✅ Solución Implementada (Múltiples Capas de Protección)

### 1. Formateo Automático en Servicios (Capa Principal)

**user-profile.service.ts**:
```typescript
private formatProfilePicture(picture: string | undefined): string | undefined {
  if (!picture) return picture;
  
  // Si ya tiene prefijo correcto, devolver tal cual
  if (picture.startsWith('data:') || picture.startsWith('http://') || 
      picture.startsWith('https://') || picture.startsWith('/')) {
    return picture;
  }
  
  // Si es base64 puro, agregar prefijo
  if (/^[A-Za-z0-9+/=]+$/.test(picture.substring(0, 100))) {
    return `data:image/jpeg;base64,${picture}`;
  }
  
  return picture;
}

getCurrentProfile(): Observable<UserProfile> {
  return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
    tap(profile => {
      // ✅ FORMATEAR INMEDIATAMENTE al recibir del backend
      if (profile.profile_picture) {
        profile.profile_picture = this.formatProfilePicture(profile.profile_picture);
      }
    })
  );
}
```

**auth.service.ts** - Mismo formateo en:
- `handleAuthenticationSuccess()` - Cuando el usuario hace login
- `loadFromStorage()` - Cuando se carga desde localStorage
- `updateUserProfile()` - Cuando se actualiza el perfil

### 2. SafeImagePipe (Capa de Respaldo)

Si alguna imagen llega sin formatear, el pipe la corrige:

```typescript
@Pipe({ name: 'safeImage', standalone: true })
export class SafeImagePipe implements PipeTransform {
  transform(value: string | null | undefined): SafeUrl | null {
    if (!value) return null;
    
    if (value.startsWith('data:') || value.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }
    
    // Si es base64 puro, agregar prefijo
    if (/^[A-Za-z0-9+/=]+$/.test(value.substring(0, 100))) {
      return this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${value}`);
    }
    
    return null;
  }
}
```

### 3. Validación Estricta en Templates (Capa Extra)

**account-settings.component.html**:
```html
@if (userProfile()?.profile_picture && 
     (userProfile()!.profile_picture.startsWith('data:') || 
      userProfile()!.profile_picture.startsWith('http') || 
      userProfile()!.profile_picture.startsWith('/') || 
      userProfile()!.profile_picture.length > 100)) {
  <img [src]="userProfile()!.profile_picture | safeImage" alt="Foto de perfil">
}
```

Esto evita renderizar la imagen hasta que esté completamente formateada.

### 4. Compresión de Imágenes

```typescript
async compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir a JPEG con 80% de calidad
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

## 📊 Flujo de Datos Completo

```
Backend → user-profile.service.ts
          ↓ (formatProfilePicture)
          "data:image/jpeg;base64,..."
          ↓
          account-settings.component.ts
          ↓ (signal actualizado)
          Template HTML
          ↓ (@if validation)
          <img [src]="... | safeImage">
          ↓ (SafeImagePipe - por si acaso)
          Navegador renderiza correctamente
```

## 🧪 Cómo Verificar que Funciona

1. **Verificar en consola**:
```
👤 Perfil cargado. Formato de imagen: Base64 puro → Data URL (formateada)
✅ Backend devolvió imagen en formato: Base64 puro → Data URL (formateada)
```

2. **Inspeccionar elemento**:
```html
<!-- ✅ Correcto -->
<img src="data:image/jpeg;base64,/9j/4AAQ...">

<!-- ❌ Incorrecto (causaría error 431) -->
<img src="/9j/4AAQ...">
```

3. **Network tab**: No debe haber peticiones GET a rutas como `/9j/4AAQ...`

## 🔄 Capas de Protección Implementadas

1. **Servicios** (auth.service + user-profile.service): Formatean la imagen INMEDIATAMENTE al recibirla
2. **SafeImagePipe**: Corrige cualquier imagen que llegue sin formato
3. **Validación en Templates**: Evita renderizar hasta que esté lista
4. **Compresión**: Reduce el tamaño de imágenes (800x800px, 80% calidad JPEG)

## 📦 Archivos Modificados

- [user-profile.service.ts](../src/app/core/services/user-profile.service.ts) - Formateo en `getCurrentProfile()` y `updateProfilePicture()`
- [auth.service.ts](../src/app/core/services/auth.service.ts) - Formateo en login, storage y update
- [safe-image.pipe.ts](../src/app/shared/pipes/safe-image.pipe.ts) - Pipe para capa de respaldo
- [account-settings.component.ts](../src/app/features/account-settings/account-settings.component.ts) - Compresión y validaciones
- [account-settings.component.html](../src/app/features/account-settings/account-settings.component.html) - Validaciones @if
- [navbar.component.ts](../src/app/shared/components/navbar.component.ts) - Validaciones en avatares

## ⚠️ Importante

- **El backend NO necesita cambios**: La solución está 100% en el frontend
- **localStorage limpio**: Si persiste el error después de estos cambios, limpiar localStorage:
  ```javascript
  localStorage.clear();
  location.reload();
  ```
- **Las 3 capas trabajan juntas**: Servicios formatean, pipe corrige, templates validan

## 🎯 Por Qué Esta Solución es Robusta

1. **Prevención temprana**: El formateo en servicios evita que el problema llegue a los componentes
2. **Múltiples puntos de captura**: Si falla una capa, las otras lo corrigen
3. **Sin dependencia del backend**: No requiere cambios en el servidor
4. **Optimización incluida**: La compresión evita imágenes gigantes
5. **Fácil debugging**: Los logs muestran el estado en cada paso
