# UI de Ruteando

Frontend desarrollado con React y Vite.

## Funcionalidades

- registro e inicio de sesión
- visualización de lugares en mapa
- bitácora de lugares del usuario autenticado
- **categorización de lugares** (Casa, Restaurante, Parque, Museo, Tienda, Playa, Montaña, Otro)
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
- Casa 🏠
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

## Cobertura de consigna

### 1. Pre-desarrollo con IA

La definición del producto también se documenta aquí para que el repositorio frontend sea autosuficiente en la entrega.

Identidad del producto:

- Nombre: Ruteando
- Descripción: bitácora personal de exploración física
- Público objetivo: personas que recorren la ciudad y quieren guardar lugares favoritos desde el celular
- Propuesta de valor: registrar lugares reales al instante y revisarlos luego en un mapa propio

Prompt base usado en pre-desarrollo:

```text
Quiero una idea de app mobile-first para registrar lugares reales visitados por una persona. Necesito nombre, público objetivo, propuesta de valor y una identidad simple.
```

Iteración 1 del prompt:

```text
Quiero una idea de app mobile-first enfocada en exploración urbana. Debe sentirse personal, simple y útil para registrar lugares favoritos desde el celular. Dame nombre, descripción, público objetivo, propuesta de valor y tono de marca. Evita una red social y prioriza una bitácora personal con mapa.
```

Iteración 2 del prompt:

```text
Sobre la propuesta anterior, ajusta la identidad para que sea clara para Argentina: define nombre final, slogan corto, perfil de usuario principal, problema concreto que resuelve en salidas diarias y 3 diferenciales frente a usar notas del celular.
```

### 2. Desarrollo

Requisitos cubiertos por este repositorio:

- interfaz para consumir la API
- login y registro
- mapa y bitácora de lugares
- soporte visual para tickets y métricas
- documentación del uso de IA para UI, debugging y decisiones de UX

### 3. Post-desarrollo

Requisitos cubiertos por este repositorio:

- vista para crear y visualizar tickets
- vista para consultar métricas operativas
- soporte visual para simular la etapa posterior al lanzamiento

Prompt usado para análisis post-desarrollo:

```text
Con estas métricas de soporte: tickets por estado, tickets por prioridad, errores en 7 días y fallos de login, redacta conclusiones breves sobre estabilidad del producto y próximas mejoras recomendadas.
```

### Entregables y bonus cubiertos

- repositorio frontend
- README con descripción, ejecución y uso de IA
- deploy productivo en Vercel
- bonus: autenticación integrada con JWT
- bonus: dashboard simple de métricas

## Nota

La documentación completa del proyecto se encuentra en `../README.md`.

Para la parte de API y scripts de backend, ver `../backend/README.md`.
