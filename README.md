# UI de Ruteando

Frontend desarrollado con React y Vite.

## Funcionalidades

- registro e inicio de sesión
- visualización de lugares en mapa
- bitácora de lugares del usuario autenticado
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

## Rutas principales

- `/`: autenticación
- `/home`: mapa y lugares
- `/support`: tickets y métricas

## Uso de IA en UI

Prompts aplicados en frontend:

- mejora de experiencia visual con modales propios en lugar de `alert/prompt/confirm`
- definición de flujo para soporte y métricas consumiendo la API
- ajuste de UX para fallback de ubicación manual cuando el navegador entrega geolocalización imprecisa

Prompt representativo:

```text
Reemplaza modales nativos de navegador por modales visualmente consistentes con la app, centrados, con overlay y animación suave, manteniendo los flujos de confirmación y edición.
```

## Nota

La documentación completa del proyecto se encuentra en `../README.md`.

Para la parte de API y scripts de backend, ver `../backend/README.md`.
