# Walking Tracker - Background Tracking Implementation

## 📱 Resumen de Cambios

La funcionalidad de walking ha sido refactorizada para soportar **tracking en background** tanto en iOS como Android, utilizando módulos nativos personalizados.

### ✨ Características Nuevas

- ✅ **Tracking en background**: Continúa registrando pasos y ubicación cuando la app está en segundo plano
- ✅ **Persistencia de ubicaciones**: Guarda las posiciones GPS en background y las recupera al volver a foreground
- ✅ **Ruta completa en mapa**: Dibuja el trayecto completo incluyendo lo recorrido en background
- ✅ **Notificaciones persistentes** (Android): Muestra progreso en tiempo real en la barra de notificaciones
- ✅ **CMPedometer** (iOS): Contador de pasos preciso con Core Motion
- ✅ **FusedLocationProvider** (Android): Tracking de ubicación eficiente
- ✅ **Sensor de pasos** (Android): Contador de pasos del hardware del dispositivo
- ✅ **Persistencia automática**: La sesión se guarda y restaura si la app se cierra

## 🏗️ Arquitectura

### Módulos Nativos

#### iOS (`WalkingTrackingModule`)

- **Ubicación**: `ios/workoutpilot/WalkingTrackingModule.[h|m]`
- **Tecnologías**:
  - `CMPedometer` para contador de pasos
  - `CLLocationManager` para ubicación GPS con updates en background
  - `NSUserDefaults` para persistir ubicaciones mientras está en background
- **Permisos requeridos**:
  - `NSMotionUsageDescription`
  - `NSLocationWhenInUseUsageDescription`
  - `NSLocationAlwaysAndWhenInUseUsageDescription`
  - `UIBackgroundModes`: `location`

#### Android (`WalkingTrackingModule`)

- **Ubicación**: `android/app/src/main/java/com/anonymous/workoutpilot/WalkingTrackingModule.kt`
- **Lenguaje**: Kotlin (moderno, conciso, recomendado por Google)
- **Tecnologías**:
  - `Sensor.TYPE_STEP_COUNTER` para contar pasos
  - `FusedLocationProviderClient` para ubicación GPS
  - `SharedPreferences` para persistir ubicaciones mientras está en background
  - Foreground Service con notificación persistente
- **Permisos requeridos**:
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_BACKGROUND_LOCATION`
  - `ACTIVITY_RECOGNITION`
  - `FOREGROUND_SERVICE`
  - `FOREGROUND_SERVICE_LOCATION`
  - `POST_NOTIFICATIONS` (Android 13+)

### TypeScript Bridge

**Archivo**: `utils/WalkingTrackingService.ts`

Expone una API limpia para React Native:

```typescript
// Iniciar tracking
await WalkingTrackingService.startTracking();

// Detener tracking
await WalkingTrackingService.stopTracking();

// Recuperar posiciones guardadas en background
const positions = await WalkingTrackingService.getPendingPositions();

// Suscribirse a eventos
WalkingTrackingService.onStepUpdate((event) => {
  console.log(`Pasos: ${event.steps}`);
});

WalkingTrackingService.onLocationUpdate((event) => {
  console.log(`Lat: ${event.latitude}, Lng: ${event.longitude}`);
});
```

### Store Updates

**Archivo**: `stores/walkingSessionStore.ts`

Nuevos métodos agregados:

- `startActiveSession()`: Inicia una nueva sesión activa
- `updateActiveSession()`: Actualiza métricas en tiempo real (pasos, distancia)
- `addPositionToActiveSession()`: Agrega puntos GPS al trayecto (evita duplicados)
- `finalizeActiveSession()`: Guarda la sesión completada en el historial

**Estado persistido**: La sesión activa se guarda automáticamente en AsyncStorage para recuperarla si la app se cierra.

## �️ Persistencia de Ubicaciones en Background

### Problema Resuelto

Cuando la app pasa a background, los eventos de ubicación se envían pero pueden no ser procesados si React Native está pausado. Esto causaba que **la ruta en el mapa se cortara** cuando el usuario volvía a foreground.

### Solución Implementada

#### Caché Local de Posiciones

Ambas plataformas ahora **guardan las ubicaciones GPS localmente** cuando están en background:

**iOS**: Usa `NSUserDefaults` para almacenar un array de posiciones

```objc
// Guardar posición mientras está en background
- (void)savePendingPosition:(CLLocation *)location {
    NSMutableArray *pending = [[self loadPendingPositions] mutableCopy];
    NSDictionary *pos = @{
        @"latitude": @(location.coordinate.latitude),
        @"longitude": @(location.coordinate.longitude),
        @"altitude": @(location.altitude),
        @"accuracy": @(location.horizontalAccuracy),
        @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000)
    };
    [pending addObject:pos];

    // Limitar a 750 posiciones máximo
    if (pending.count > MAX_STORED_POSITIONS) {
        [pending removeObjectsInRange:NSMakeRange(0, pending.count - MAX_STORED_POSITIONS)];
    }

    [[NSUserDefaults standardUserDefaults] setObject:pending forKey:PENDING_POSITIONS_KEY];
}
```

**Android**: Usa `SharedPreferences` con serialización JSON

```kotlin
private fun savePendingPosition(location: Location) {
    val pending = loadPendingPositions().toMutableList()
    val position = mapOf(
        "latitude" to location.latitude,
        "longitude" to location.longitude,
        "altitude" to location.altitude,
        "accuracy" to location.accuracy.toDouble(),
        "timestamp" to location.time.toDouble()
    )
    pending.add(position)

    // Limitar a 750 posiciones máximo
    if (pending.size > MAX_STORED_POSITIONS) {
        pending.subList(0, pending.size - MAX_STORED_POSITIONS).clear()
    }

    val json = JSONArray(pending).toString()
    sharedPreferences.edit().putString(PENDING_POSITIONS_KEY, json).apply()
}
```

#### Método `getPendingPositions()`

Nuevo método nativo para recuperar ubicaciones guardadas:

```typescript
// utils/WalkingTrackingService.ts
getPendingPositions(): Promise<LocationData[]> {
  return WalkingTrackingModule.getPendingPositions();
}
```

Este método:

1. **Lee las posiciones** almacenadas en NSUserDefaults/SharedPreferences
2. **Las devuelve** como array de objetos `{latitude, longitude, altitude, accuracy, timestamp}`
3. **Limpia la caché** después de entregarlas (para evitar duplicados)

#### Sincronización Automática

Cuando la app vuelve a foreground, el componente automáticamente:

```typescript
// app/exercises/walking/index.tsx
const resumeTrackingIfNeeded = async () => {
  const isCurrentlyTracking = await WalkingTrackingService.isTracking();

  if (isCurrentlyTracking && activeSession) {
    console.log(
      "[WalkingTracker] Resuming tracking, syncing pending positions...",
    );

    // Recuperar posiciones guardadas en background
    const pendingPositions = await WalkingTrackingService.getPendingPositions();

    if (pendingPositions.length > 0) {
      console.log(
        `[WalkingTracker] Syncing ${pendingPositions.length} background positions`,
      );

      // Agregar cada posición al trayecto
      pendingPositions.forEach((pos) => {
        addPositionToActiveSession({
          latitude: pos.latitude,
          longitude: pos.longitude,
          altitude: pos.altitude || 0,
          accuracy: pos.accuracy || 0,
          timestamp: pos.timestamp || Date.now(),
        });
      });
    }
  }
};
```

#### Límite de Almacenamiento

**Máximo: 750 posiciones** (`MAX_STORED_POSITIONS`)

Si se superan 750 ubicaciones en background:

- Las posiciones **más antiguas** se eliminan (FIFO)
- Las **más recientes** se mantienen
- Esto previene consumo excesivo de memoria

### Flujo Completo

1. **Usuario inicia sesión** → tracking comienza
2. **App pasa a background** → ubicaciones se guardan localmente
3. **Usuario vuelve a foreground** → `resumeTrackingIfNeeded()` se ejecuta
4. **Llamada a `getPendingPositions()`** → recupera ubicaciones guardadas
5. **Posiciones se agregan a la sesión** → ruta se dibuja completa en el mapa
6. **Caché se limpia** → listo para próximo ciclo background/foreground

### Beneficios

✅ **Ruta completa**: El mapa muestra todo el trayecto, incluso lo recorrido en background  
✅ **Sin duplicados**: La lógica de `addPositionToActiveSession` previene puntos duplicados  
✅ **Eficiente**: Solo guarda lo necesario, limpia automáticamente  
✅ **Cross-platform**: Funciona igual en iOS y Android

## �🔧 Configuración de Permisos

### iOS (`Info.plist`)

Ya está configurado con:

```xml
<key>NSMotionUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your device motion</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Allow background location to keep tracking your walk when the app is not open.</string>

<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

### Android (`AndroidManifest.xml`)

Ya está configurado con:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

## 🚀 Instrucciones de Construcción

### Prerequisitos

```bash
yarn install
```

### iOS

1. **Instalar Pods**:

   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Construir para iOS**:

   ```bash
   yarn ios
   # o con Expo
   npx expo run:ios
   ```

3. **Probar en dispositivo real** (recomendado para testing de background):
   - Abre `ios/workoutpilot.xcworkspace` en Xcode
   - Selecciona tu dispositivo físico
   - Firma con tu Apple Developer account
   - Build & Run

### Android

1. **Construir para Android**:

   ```bash
   yarn android
   # o con Expo
   npx expo run:android
   ```

2. **Nota importante**: El tracking en background requiere un dispositivo real. Los emuladores pueden no soportar correctamente:
   - Sensor de pasos
   - Servicios de ubicación en background
   - Notificaciones persistentes

## 🧪 Testing

### Escenarios a Probar

#### ✅ Foreground Tracking

1. Iniciar sesión de caminata
2. Verificar que los pasos se actualizan
3. Verificar que la ruta se dibuja en el mapa
4. Verificar que el tiempo se actualiza

#### ✅ Background Tracking

1. Iniciar sesión de caminata
2. Minimizar la app (Home button)
3. Caminar unos pasos
4. Volver a la app
5. Verificar que los pasos continuaron contando
6. Verificar que la ruta continuó registrándose

#### ✅ App Kill & Resume

1. Iniciar sesión de caminata
2. Cerrar completamente la app (swipe up)
3. Reabrir la app
4. Verificar que la sesión se restaura automáticamente
5. Verificar que continúa el tracking

#### ✅ Permisos

1. Denegar permisos inicialmente
2. Verificar mensaje de error apropiado
3. Ir a Settings y habilitar permisos
4. Volver a la app e intentar nuevamente

### Esperado en Android

- Notificación persistente visible mientras está en tracking
- Notificación muestra: "X pasos • Y.YY km • HH:MM:SS"
- Notificación desaparece al detener tracking

### Esperado en iOS

- Indicador de ubicación activo en status bar
- Continúa tracking en background sin notificación visible

## 📝 Notas de Implementación

### Precisión de Pasos

**iOS**: CMPedometer es muy preciso y se actualiza en tiempo real.

**Android**:

- El sensor `TYPE_STEP_COUNTER` cuenta pasos desde el último reinicio del dispositivo
- Tomamos una "baseline" al iniciar la sesión
- Restamos la baseline para obtener pasos relativos de la sesión

### Cálculo de Distancia

Usamos dos fuentes:

1. **GPS-based**: Calculamos distancia entre puntos GPS (Haversine formula)
2. **Step-based**: Estimamos ~0.762m por paso

El sistema usa el **mayor** de los dos valores para mayor precisión.

### Actualizaciones

- **Pasos**: Cada actualización del sensor (iOS: ~1 seg, Android: en cada paso)
- **Ubicación**: Cada 5 metros o 3 segundos (lo que ocurra primero)
- **Notificación** (Android): Cada 10 pasos

### Limitaciones

1. **Web**: No soporta tracking en background (limitación del navegador)
2. **Emuladores**: No soportan sensores de movimiento ni ubicación precisa
3. **Batería**: El tracking en background consume más batería (es normal)
4. **Permisos estrictos**: iOS y Android 10+ requieren "Always Allow" para background

## 🐛 Troubleshooting

### Common Issues

**Problema**: La ruta no se dibuja cuando la app vuelve de background

**Causa raíz**: Discrepancia de campos entre posiciones guardadas en background vs posiciones enviadas en foreground

**Solución implementada** (v2.0):

- Antes: Las posiciones guardadas en SharedPreferences/UserDefaults solo incluían `latitude`, `longitude`, `accuracy`, `timestamp`
- Ahora: Se guardan **TODOS** los campos: `latitude`, `longitude`, `accuracy`, `altitude`, `speed`, `timestamp`
- Esto asegura que las posiciones recuperadas de background tengan la misma estructura que las posiciones en tiempo real

**Cómo verificar**:

```bash
# Android
adb logcat | grep WalkingTracking

# Deberías ver:
# Saved position X: lat, lon (con todos los campos)
# getPendingPositions called, found N positions
# (y luego en React Native)
# [WalkingSession] Retrieved pending positions: N
# [WalkingSession] Adding position 1/N: lat, lon
```

**Problema**: Posiciones duplicadas detectadas al volver de background

**Causa**: Posiciones se guardaban tanto en foreground como background

**Solución implementada** (v2.0):

- iOS: Solo guarda en UserDefaults cuando `_hasListeners == NO` (app en background)
- Android: Solo guarda en SharedPreferences cuando `hasActiveReactInstance() == false` (app en background)
- En foreground: Solo envía eventos, no guarda en persistent storage

### iOS

**Problema**: No se cuentan pasos

- Verificar que el dispositivo tiene acelerómetro (no funciona en iPad sin chip M)
- Verificar permisos de Motion en Settings > Privacy

**Problema**: No funciona en background

- Verificar `UIBackgroundModes` en Info.plist
- Verificar que se otorgó permiso "Always Allow" para ubicación

### Android

**Problema**: No se cuentan pasos

- Verificar que el dispositivo tiene sensor de pasos: `Sensor.TYPE_STEP_COUNTER`
- Algunos dispositivos antiguos no tienen este sensor

**Problema**: No aparece la notificación

- Verificar permisos de notificaciones en Android 13+
- Verificar que la app está en foreground service activo

**Problema**: Se detiene en background

- Verificar que se otorgó "Allow all the time" para ubicación
- Algunas ROMs (Xiaomi, Huawei) tienen aggressive battery optimization
  - Ir a Settings > Battery > App battery optimization
  - Excluir WorkoutPilot de la optimización

## 📦 Archivos Modificados/Creados

### Archivos Nuevos

- `ios/workoutpilot/WalkingTrackingModule.h`
- `ios/workoutpilot/WalkingTrackingModule.m`
- `android/app/src/main/java/com/anonymous/workoutpilot/WalkingTrackingModule.kt`
- `android/app/src/main/java/com/anonymous/workoutpilot/WalkingTrackingPackage.kt`
- `utils/WalkingTrackingService.ts`
- `app/exercises/walking/index.tsx.backup` (backup del original)

### Archivos Modificados

- `app/exercises/walking/index.tsx` (refactorizado completamente)
- `stores/walkingSessionStore.ts` (agregado estado de sesión activa)
- `android/app/src/main/java/com/anonymous/workoutpilot/MainApplication.kt` (registrado WalkingTrackingPackage)
- `android/app/src/main/AndroidManifest.xml` (permisos adicionales)
- `locales/en.json` (traducciones actualizadas)
- `locales/es.json` (traducciones actualizadas)

## 🎯 Próximos Pasos (Opcional)

- [ ] Agregar vibración al completar hitos (cada 1000 pasos, cada 1km)
- [ ] Permitir pausar/reanudar sin finalizar sesión
- [ ] Exportar ruta a GPX
- [ ] Integrar con Apple Health / Google Fit para sincronización
- [ ] Agregar estadísticas de velocidad promedio
- [ ] Agregar alertas de ritmo (demasiado rápido/lento)

---

**¿Dudas?** Consulta la documentación oficial:

- [iOS Core Motion](https://developer.apple.com/documentation/coremotion)
- [Android Step Counter](https://developer.android.com/guide/topics/sensors/sensors_motion)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-intro)
