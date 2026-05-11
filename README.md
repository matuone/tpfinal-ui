# UI de Ruteando

Frontend desarrollado con React y Vite.

## Funcionalidades

- registro e inicio de sesión
- visualización de lugares en mapa
- bitácora de lugares del usuario autenticado
- **categorización de lugares** (CASA, Restaurante, Parque, Museo, Tienda, Playa, Montaña, Otro)
- **dirección legible** obtenida automáticamente desde coordenadas (geocodificación inversa)
- **filtrado avanzado** de lugares por nombre y categoría
- **navegación rápida al mapa** desde la bitácora con acción por ícono (avión)
- vista de soporte con tickets y métricas
- modales personalizados centrados para feedback, confirmaciones y edición

## Mejora de modales

Se reemplazaron los modales nativos del navegador (`alert`, `prompt`, `confirm`) por un modal propio de la app para mantener consistencia visual con Ruteando.

Características implementadas:

- modal centrado con overlay y blur de fondo
- animación de entrada (fade + pop)
- variantes de uso: informativo, confirmación y edición con input
- cierre por click fuera del modal y por tecla `Escape`

Archivos involucrados:

- `src/components/AppModal.jsx`
- `src/App.jsx`
- `src/views/Auth.jsx`
- `src/views/Support.jsx`
- `src/styles/index.css`

## Nuevas características: Categorías, Dirección y Filtrado

### Categorías

Cada lugar puede tener una categoría:
- CASA 🏠
- Restaurante 🍽️
- Parque 🌳
- Museo 🎨
- Tienda 🏪
- Playa 🏖️
- Montaña ⛰️
- Otro 📍

Archivos involucrados:

- `src/App.jsx` - dropdown de categorías al crear lugar
- `src/services/placesService.js` - función `getCategories()` y soporte en `addPlace()`
- `src/context/PlacesContext.jsx` - actualización de `addNewPlace()` para pasar categoría

### Dirección legible

Al crear o editar un lugar, la API obtiene automáticamente la dirección usando OpenStreetMap Nominatim. Ejemplo:

- Coordenadas: `-34.6037, -58.3816`
- Dirección: `Calle Florida, Buenos Aires`

Se muestra en la bitácora con ícono 🏠.

### Filtrado avanzado

La sección de filtros permite:
- **Búsqueda por nombre**: text input que filtra en tiempo real
- **Filtrar por categoría**: dropdown con todas las categorías disponibles
- Vista contraída/expandida (botón toggle)
- Contador de resultados

Archivos involucrados:

- `src/App.jsx` - UI de filtros y lógica de filtrado
- `src/services/placesService.js` - función `getPlaces()` con query params

### Navegar desde bitácora al mapa

- Cada tarjeta de la bitácora incluye una acción con ícono de avión para centrar el mapa en ese lugar.
- Al usarla, la pantalla hace scroll suave hacia el mapa para confirmar visualmente el foco.

Archivos involucrados:

- `src/App.jsx` - acción de navegación y foco por coordenadas
- `src/components/Map.jsx` - consumo de `focusedCoords` para recentrar mapa

### Estabilidad de mapa (Leaflet)

- Se desactivaron animaciones de zoom/transición que en Safari/iOS podían disparar errores internos de Leaflet.
- El recentrado del mapa ahora valida contenedor antes de aplicar `setView`.

Archivos involucrados:

- `src/components/Map.jsx`

## Ejecución

```bash
cd ui
npm install
npm run dev
```

La API debe estar levantada en `http://localhost:3000`.

## Variables de entorno

Crear `ui/.env` desde `ui/.env.example`.

```env
VITE_API_URL=http://localhost:3000
```

Para producción (Vercel), usar la URL pública de Render:

```env
VITE_API_URL=https://tu-backend-en-render.onrender.com
```

Además, para SPA en Vercel se utiliza `vercel.json` con rewrites hacia `index.html`.

## Rutas principales

- `/`: autenticación
- `/home`: mapa y lugares
- `/support`: tickets y métricas

## Uso de IA en UI

Prompts aplicados en frontend:

- mejora de experiencia visual con modales propios en lugar de `alert/prompt/confirm`
- definición de flujo para soporte y métricas consumiendo la API
- ajuste de UX para fallback de ubicación manual cuando el navegador entrega geolocalización imprecisa
- **implementación de categorías, dirección legible y filtrado avanzado** para organizar y buscar lugares

Prompts representativos:

```text
Reemplaza modales nativos de navegador por modales visualmente consistentes con la app, centrados, con overlay y animación suave, manteniendo los flujos de confirmación y edición.
```

```text
Agrega selector de categorías al crear lugares, muestra dirección legible en lugar de coordenadas, e implementa filtrado por nombre y categoría con UI colapsable.
```

## Nota

La documentación completa del proyecto se encuentra en `../README.md`.

Para la parte de API y scripts de backend, ver `../backend/README.md`.
