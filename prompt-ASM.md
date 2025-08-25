# Prompt profesional - Módulo 10 (Frontend: PositionPage + Kanban)

## Persona (Rol)
Actúa como un **frontend engineer senior** con experiencia en **React, TypeScript y drag & drop** (usando `@hello-pangea/dnd`).  
Conoces buenas prácticas de arquitectura en proyectos full-stack (React + Express + Prisma + PostgreSQL).

---

## Tarea
Implementar y mejorar la **nueva página de detalle de posición (`PositionPage.tsx`)** con tablero Kanban.  
La página debe mostrar candidatos por fases de entrevista, permitir arrastrarlos entre columnas y actualizar su estado en la BBDD vía API.  
Además, deben integrarse:
- Navegación entre páginas.
- Filtros en la lista de posiciones.
- Limpieza de mocks para usar datos reales.

---

## Contexto

### Proyecto
**LTI Talent Tracking System**  
- **Frontend**: React + TypeScript.  
- **Backend**: Node.js + Express + Prisma.  
- **BBDD**: PostgreSQL (Docker).  

### Endpoints disponibles
- `GET /position/:id/interviewflow` → devuelve fases del proceso de entrevistas.  
- `GET /position/:id/candidates` → devuelve candidatos y fase actual.  
- `PUT /candidates/:id` con body `{ applicationId, currentInterviewStep }` → actualiza la fase del candidato.  
- `GET /position` → listado de posiciones.

### Requerimientos de diseño
- Mostrar **título de la posición** en la parte superior.  
- Flecha para volver al listado de posiciones.  
- Columnas dinámicas según fases.  
- Tarjetas de candidatos con nombre y puntuación media.  
- Responsive: en móvil, columnas apiladas.  
- Listado de posiciones con filtros por:
  - Título (case-insensitive).  
  - Estado (con equivalencias ES↔EN: `Abierto→Open`, `Contratado→Filled`, `Cerrado→Closed`, `Borrador→Draft`).  
  - Fecha (deadline exacta en `YYYY-MM-DD`).  
  - Manager (dropdown temporal hardcodeado con “Manager 1/2/3”).  

### Código implementado
- `frontend/src/pages/PositionPage.tsx` (Kanban).  
- `App.js` → rutas `/positions`, `/position/:id`, `/add-candidate`.  
- Botones “Volver” en `AddCandidateForm.js` y `Positions.tsx`.  
- Backend:
  - Nuevo `GET /position` con `listPositionsService`, `listPositions` controller y `positionRoutes`.  
- Seeds (`seed.js`, `seed-incremental.js`) para poblar candidatos, entrevistas y scores.

---

## Problemas encontrados y soluciones

- **404 en rutas backend**  
  - Causa: diferencias entre enunciado y backend real.  
  - Solución: usar `/position/:id/interviewflow` y `/position/:id/candidates`.  

- **PUT de etapa de candidato (404)**  
  - Causa: el enunciado decía `/stage`, pero backend real expone `PUT /candidates/:id`.  
  - Solución: actualizar URL y body.  

- **Drag & drop roto con `react-beautiful-dnd`**  
  - Causa: incompatibilidad con React 18 y uso de `draggableId` numérico.  
  - Solución: migración a `@hello-pangea/dnd`, IDs string.  

- **Warnings (`defaultProps`) en Droppable**  
  - Causa: librería antigua.  
  - Solución: aceptado; se resuelve al migrar librería.  

- **Candidatos no visibles**  
  - Causa: seeds sin entrevistas/scores y columnas vacías.  
  - Solución: normalización de datos y `seed-incremental.js` para asignar scores.  

- **Errores al mezclar backend en frontend**  
  - Causa: código backend importado en `Positions.tsx`.  
  - Solución: limpieza → solo fetch desde frontend.  

- **Puertos ocupados (3000/3010)**  
  - Causa: procesos previos abiertos.  
  - Solución: localizar PID con `netstat`, matar con `taskkill`.  

- **node_modules corrupto y DnD inestable**  
  - Causa: dependencias rotas.  
  - Solución: reinstalación limpia y cambio a `@hello-pangea/dnd`.  

- **Respuesta anidada en `/interviewflow`**  
  - Causa: backend devuelve `{ interviewFlow: { … } }`.  
  - Solución: ajustar parsing en frontend.  

- **Problemas con Git (push a `main`, tags duplicados)**  
  - Causa: push a rama incorrecta.  
  - Solución: uso de rama `frontend-ASM`, nuevo tag `v0.2.1`.  

---

## Estado final

- **Kanban funcional** con arrastrar/soltar candidatos.  
- **Listado de posiciones** conectado a BBDD con filtros de título, estado, fecha y manager.  
- **Seeds funcionales** para pruebas locales.  
- **Rutas alineadas** con backend real.  
- **Manager** aún hardcodeado en frontend (pendiente de mejora en futuras iteraciones).

---

## Formato de salida esperado
- Código de componentes (`PositionPage.tsx`, rutas en `App.js`, botones “Volver”).
- Explicación clara de cada cambio.  
- Sugerencias de mejora si algo está incompleto.  
- Código listo para commit en rama `frontend-ASM`.  

---

## Nota final
Si falta alguna información (nombres exactos de props, estilos CSS/Tailwind, manejo de estado con hooks/context), **pregunta antes de inventar detalles**.  

