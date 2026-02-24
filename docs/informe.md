# Informe del Proyecto – TaskFlow

## 1. Arquitectura del Sistema

```
┌──────────────────────────────────────────────┐
│           Vercel (Hosting / CDN)             │
│  ┌──────────────────────────────────────┐    │
│  │      React SPA (Vite build)           │    │
│  │  Login │ Register │ Dashboard │ Tasks │    │
│  └──────────────────┬───────────────────┘    │
└───────────────────── │ ─────────────────────-┘
                       │ Firebase SDK (HTTPS)
┌──────────────────────▼───────────────────────┐
│          Firebase (Google Cloud)             │
│  ┌──────────────────┐  ┌───────────────────┐ │
│  │  Authentication  │  │  Firestore DB     │ │
│  │  (Email+Google)  │  │  /tasks  /users   │ │
│  └──────────────────┘  └───────────────────┘ │
└──────────────────────────────────────────────┘
```

## 2. Tecnologías Utilizadas

| Capa            | Tecnología                              |
|-----------------|-----------------------------------------|
| Frontend        | React 19 + Vite 6                       |
| Estilos         | Tailwind CSS v4                         |
| Base de datos   | Firebase Firestore (NoSQL en la nube)   |
| Autenticación   | Firebase Authentication                 |
| Tiempo real     | Firestore `onSnapshot`                  |
| Gráficas        | Recharts (AreaChart)                    |
| Iconos          | Lucide React                            |
| Notificaciones  | React Hot Toast                         |
| Hosting         | Vercel (deploy automático desde GitHub) |

## 3. Sincronización en Tiempo Real

La sincronización en tiempo real se implementa usando el método **`onSnapshot`** del SDK de Firebase Firestore. Cuando el usuario inicia sesión, la aplicación abre una **suscripción persistente** a la colección `tasks` filtrada por el `userId` del usuario autenticado:

```js
const q = query(
  collection(db, "tasks"),
  where("userId", "==", userId),
  orderBy("createdAt", "desc")
);

return onSnapshot(q, (snapshot) => {
  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  callback(tasks); // actualiza el estado de React
});
```

Cada vez que se agrega, edita o elimina una tarea desde **cualquier dispositivo**, Firestore notifica a todos los clientes suscritos de forma inmediata y la UI se actualiza automáticamente sin necesidad de refrescar la página.

## 4. Funcionalidades Adicionales Implementadas

- **Dashboard con estadísticas**: Contador de tareas totales, pendientes, completadas y vencidas. Gráfica de área con las tareas completadas en los últimos 7 días.
- **Sistema de gamificación**: Los usuarios ganan +10 XP al completar cada tarea. El XP acumula niveles (Beginner → Apprentice → Achiever → Master → Legend) con una barra de progreso visual.
- **Categorías**: Cada tarea tiene una etiqueta de categoría (Work, Personal, Study, Other) con chips de color diferente.
- **Fechas de vencimiento**: Tareas vencidas se resaltan en rojo automáticamente.
- **Búsqueda y filtrado**: Búsqueda por texto en título y descripción, filtros por estado (pendiente/completada) y por categoría.
- **Tema oscuro/claro**: Toggle persistido en `localStorage`.
- **Diseño responsivo**: Sidebar en desktop, barra de navegación inferior en móvil.

## 5. Dificultades Encontradas y Soluciones

| Dificultad | Solución |
|---|---|
| Reglas de seguridad en Firestore | Se configuraron reglas RLS equivalentes: solo el dueño (userId) puede leer/escribir sus tareas |
| Doble awardeado de XP | Se agregó el campo `xpAwarded` en cada tarea; el XP solo se otorga una vez usando este flag |
| Responsividad en diferentes pantallas | Sidebar oculto en móvil, reemplazado por BottomNav fijo usando clases `md:hidden` de Tailwind |
| Variables de entorno en Vercel | Se configuran en el dashboard de Vercel (Settings → Environment Variables) para no exponer keys reales |

## 6. Capturas de Pantalla

_(Agregar capturas de `http://localhost:5173` aquí antes de entregar)_

- `screenshot-login.png` – Página de login con glassmorphism
- `screenshot-dashboard.png` – Dashboard con stats y gráfica
- `screenshot-tasks.png` – Lista de tareas con filtros
- `screenshot-mobile.png` – Vista móvil con BottomNav
