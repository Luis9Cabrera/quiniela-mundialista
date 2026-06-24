# Quiniela Mundialista - FIFA World Cup 2026

Aplicación web para crear quinielas del Mundial 2026 con amigos. Construida con Vue 3, Tailwind CSS v4, Firebase Auth (Google), Firestore y desplegable en GitHub Pages.

## User Review Required

> [!IMPORTANT]
> **Credenciales de Firebase**: Para que la app funcione, necesitarás un proyecto de Firebase con Authentication (Google provider habilitado) y Firestore Database. Yo crearé el archivo `.env.local.example` con las variables necesarias, pero tú deberás crear tu propio proyecto en [Firebase Console](https://console.firebase.google.com/) y llenar las credenciales.

> [!IMPORTANT]
> **Datos del torneo**: El Mundial 2026 tiene 48 equipos en 12 grupos (A–L). Algunos grupos aún tienen equipos de playoff por definir. Incluiré los equipos confirmados y placeholders para los que están pendientes.

## Open Questions

> [!IMPORTANT]
> **Nombre del repositorio en GitHub**: Para configurar el `base` path en Vite para GitHub Pages, necesito saber el nombre del repositorio. Por ahora usaré `/quiniela-mundialista/` como base. ¿Es correcto?

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|:--|:--|:--|
| Vue 3 | ^3.5 | Framework frontend (Composition API + `<script setup>`) |
| Vue Router | ^4 | Ruteo SPA con `createWebHashHistory` (GitHub Pages) |
| Pinia | ^2 | Estado global (auth, quinielas, partidos) |
| Tailwind CSS | v4 | Estilos con `@tailwindcss/vite` plugin |
| Firebase | ^11 | Auth (Google) + Firestore |
| VueFire | ^3 | Bindings reactivos Firebase ↔ Vue |
| Vite | ^6 | Bundler y dev server |
| gh-pages | npm | Deploy a GitHub Pages |

## Proposed Changes

### Fase 1: Scaffolding del Proyecto

#### [NEW] Scaffolding Vite + Vue 3
- Crear proyecto con `npm create vite@latest ./ -- --template vue`
- Instalar dependencias:
  - `tailwindcss @tailwindcss/vite` (dev)
  - `vue-router pinia firebase vuefire`
  - `gh-pages` (dev)

#### [NEW] [vite.config.js](file:///d:/vue_dev/quiniela-mundialista/vite.config.js)
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/quiniela-mundialista/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' }
  }
})
```

#### [NEW] [.env.local.example](file:///d:/vue_dev/quiniela-mundialista/.env.local.example)
Variables de entorno necesarias para Firebase.

#### [NEW] [public/.nojekyll](file:///d:/vue_dev/quiniela-mundialista/public/.nojekyll)
Archivo vacío para GitHub Pages.

---

### Fase 2: Sistema de Diseño (Tailwind v4 CSS-first)

#### [NEW] [src/style.css](file:///d:/vue_dev/quiniela-mundialista/src/style.css)
Sistema de diseño con Tailwind v4 usando CSS-first configuration:
- **Tema**: Dark mode por defecto, con acentos en verde esmeralda y dorado (#C4A35A) para sensación premium mundialista
- **Tipografía**: Google Font "Inter" + "Outfit" para headings
- **Glassmorphism**: Cards con backdrop-blur
- **Gradientes**: Fondo con gradiente sutil de azul oscuro a negro
- **Animaciones**: Transiciones suaves, fade-in, hover effects

---

### Fase 3: Firebase Configuration

#### [NEW] [src/firebase.js](file:///d:/vue_dev/quiniela-mundialista/src/firebase.js)
Inicialización de Firebase con variables de entorno `VITE_*`:
- `initializeApp()` con config desde env vars
- Exportar `auth` (getAuth) y `db` (getFirestore)

#### [NEW] [src/main.js](file:///d:/vue_dev/quiniela-mundialista/src/main.js)
Setup de la app Vue con:
- VueFire + VueFireAuth
- Pinia
- Vue Router
- Import global de `style.css`

---

### Fase 4: Router & Layout

#### [NEW] [src/router/index.js](file:///d:/vue_dev/quiniela-mundialista/src/router/index.js)
Rutas con `createWebHashHistory`:

| Ruta | Componente | Guard |
|:--|:--|:--|
| `/` | `HomeView` | Público |
| `/login` | `LoginView` | Solo no-auth |
| `/dashboard` | `DashboardView` | Auth requerida |
| `/quiniela/create` | `CreateQuinielaView` | Auth requerida |
| `/quiniela/:id` | `QuinielaDetailView` | Auth requerida |
| `/quiniela/:id/predict` | `PredictView` | Auth requerida |
| `/quiniela/:id/leaderboard` | `LeaderboardView` | Auth requerida |
| `/admin/:id` | `AdminView` | Auth + owner |

#### [NEW] [src/App.vue](file:///d:/vue_dev/quiniela-mundialista/src/App.vue)
Layout principal con:
- Navbar responsive con avatar del usuario y navegación
- RouterView con transiciones
- Footer con créditos

---

### Fase 5: Stores (Pinia)

#### [NEW] [src/stores/auth.js](file:///d:/vue_dev/quiniela-mundialista/src/stores/auth.js)
Estado de autenticación:
- `user` (objeto del usuario Firebase)
- `isAuthenticated` (computed)
- `signInWithGoogle()` - Login con popup Google
- `signOut()`
- `onAuthStateChanged` listener

#### [NEW] [src/stores/quiniela.js](file:///d:/vue_dev/quiniela-mundialista/src/stores/quiniela.js)
Estado de quinielas:
- `myQuinielas` - quinielas donde participo
- `createQuiniela({ name })` → genera código de invitación único (6 chars)
- `joinQuiniela(code)` → unirse por código
- `getQuinielaById(id)`

#### [NEW] [src/stores/matches.js](file:///d:/vue_dev/quiniela-mundialista/src/stores/matches.js)
Datos de partidos del mundial (hardcoded inicialmente):
- `groups` - 12 grupos con equipos y banderas (emoji flags)
- `matches` - 104 partidos del mundial con fecha/hora/sede
- `getMatchesByGroup(group)`
- `getMatchesByPhase(phase)` (groups/r32/r16/qf/sf/3rd/final)

---

### Fase 6: Datos del Mundial 2026

#### [NEW] [src/data/worldcup2026.js](file:///d:/vue_dev/quiniela-mundialista/src/data/worldcup2026.js)
Archivo de datos con los 48 equipos, 12 grupos y partidos clave:

```
Grupo A: México 🇲🇽, Sudáfrica 🇿🇦, Corea del Sur 🇰🇷, Dinamarca 🇩🇰
Grupo B: Canadá 🇨🇦, Italia 🇮🇹, Qatar 🇶🇦, Suiza 🇨🇭
Grupo C: Brasil 🇧🇷, Marruecos 🇲🇦, Haití 🇭🇹, Escocia 🏴
Grupo D: Estados Unidos 🇺🇸, Paraguay 🇵🇾, Australia 🇦🇺, Turquía 🇹🇷
Grupo E: Alemania 🇩🇪, Curazao 🇨🇼, Costa de Marfil 🇨🇮, Ecuador 🇪🇨
Grupo F: Países Bajos 🇳🇱, Japón 🇯🇵, Ucrania 🇺🇦, Túnez 🇹🇳
Grupo G: Bélgica 🇧🇪, Egipto 🇪🇬, Irán 🇮🇷, Nueva Zelanda 🇳🇿
Grupo H: España 🇪🇸, Cabo Verde 🇨🇻, Arabia Saudita 🇸🇦, Uruguay 🇺🇾
Grupo I: Francia 🇫🇷, Senegal 🇸🇳, Bolivia 🇧🇴, Noruega 🇳🇴
Grupo J: Argentina 🇦🇷, Argelia 🇩🇿, Austria 🇦🇹, Jordania 🇯🇴
Grupo K: Portugal 🇵🇹, Jamaica 🇯🇲, Uzbekistán 🇺🇿, Colombia 🇨🇴
Grupo L: Inglaterra 🏴, Croacia 🇭🇷, Ghana 🇬🇭, Panamá 🇵🇦
```

> [!NOTE]
> Algunos equipos aún no están definidos (playoffs europeos/intercontinentales). Usaré los equipos más probables/confirmados. Se pueden actualizar después fácilmente.

---

### Fase 7: Vistas (Views)

#### [NEW] [src/views/HomeView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/HomeView.vue)
Landing page espectacular con:
- Hero section con animación de balón/trofeo
- Nombre de la app con gradiente dorado
- CTA "Iniciar sesión con Google"
- Features cards con glassmorphism
- Info del mundial 2026

#### [NEW] [src/views/LoginView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/LoginView.vue)
Página de login minimalista:
- Botón grande de "Iniciar sesión con Google"
- Redirect al dashboard después del login

#### [NEW] [src/views/DashboardView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/DashboardView.vue)
Panel principal del usuario:
- Bienvenida personalizada con avatar
- Mis quinielas (lista)
- Botones: Crear nueva quiniela / Unirse con código
- Estadísticas rápidas (puntos totales, posición promedio)

#### [NEW] [src/views/CreateQuinielaView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/CreateQuinielaView.vue)
Formulario para crear quiniela:
- Nombre de la quiniela
- Se genera automáticamente un código de invitación
- Seleccionar fases a predecir (grupos, eliminatoria, todo)

#### [NEW] [src/views/QuinielaDetailView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/QuinielaDetailView.vue)
Vista detallada de una quiniela:
- Info de la quiniela + código para compartir
- Lista de participantes
- Navegación: Mis predicciones / Tabla de posiciones
- Acceso rápido a partidos por grupo/fase

#### [NEW] [src/views/PredictView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/PredictView.vue)
Vista para hacer predicciones:
- Tabs por grupo (A–L) y fases eliminatorias
- Card por partido con: banderas, nombres de equipos, inputs de goles
- Indicador de si ya predijiste o no
- Botón guardar predicciones
- Bloqueo de predicciones después de que inicie el partido

#### [NEW] [src/views/LeaderboardView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/LeaderboardView.vue)
Tabla de posiciones:
- Ranking con avatar, nombre, puntos
- Highlight del usuario actual
- Desglose de puntos (exactos, ganador, etc.)
- Animación de posición subiendo/bajando

#### [NEW] [src/views/AdminView.vue](file:///d:/vue_dev/quiniela-mundialista/src/views/AdminView.vue)
Panel de admin (solo el creador de la quiniela):
- Ingresar resultados reales de partidos
- Al guardar resultado → se calculan puntos automáticamente
- Ver predicciones de todos los participantes

---

### Fase 8: Componentes Reutilizables

#### [NEW] [src/components/Navbar.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/Navbar.vue)
Barra de navegación con glassmorphism, logo, links y avatar del usuario.

#### [NEW] [src/components/MatchCard.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/MatchCard.vue)
Card de partido con banderas (emojis), nombre de equipos, inputs de goles y estado (pendiente/jugado/resultado).

#### [NEW] [src/components/GroupTable.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/GroupTable.vue)
Tabla de grupo con los 4 equipos y sus stats (PJ, PG, PE, PP, GF, GC, Pts).

#### [NEW] [src/components/LeaderboardTable.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/LeaderboardTable.vue)
Tabla de clasificación con ranking, avatar, nombre y puntos.

#### [NEW] [src/components/JoinModal.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/JoinModal.vue)
Modal para unirse a una quiniela con código.

#### [NEW] [src/components/GoogleLoginButton.vue](file:///d:/vue_dev/quiniela-mundialista/src/components/GoogleLoginButton.vue)
Botón estilizado de login con Google.

---

### Fase 9: Firestore Schema

```
Colecciones en Firestore:

📁 quinielas/{quinielaId}
  ├── name: string
  ├── code: string (6 chars, unique)
  ├── ownerId: string (uid)
  ├── ownerName: string
  ├── createdAt: timestamp
  ├── phases: string[] (["groups", "r32", "r16", "qf", "sf", "final"])
  ├── members: string[] (uids)
  └── memberNames: map { uid: displayName }

📁 quinielas/{quinielaId}/predictions/{oddsId}
  ├── oddsId: string (oddsId)
  ├── oddsName: string
  ├── matches: map { matchId: { home: number, away: number } }
  └── updatedAt: timestamp

📁 quinielas/{quinielaId}/results/{resultId}
  └── matches: map { matchId: { home: number, away: number } }

📁 quinielas/{quinielaId}/scores/{oddsId}
  ├── oddsId: string
  ├── oddsName: string
  ├── totalPoints: number
  ├── exactMatches: number
  └── correctWinners: number
```

### Sistema de Puntos

| Acierto | Puntos |
|:--|:--|
| Resultado exacto | **5 pts** |
| Acertar ganador/empate (sin resultado exacto) | **2 pts** |
| Fallo total | **0 pts** |
| **Bonus fase eliminatoria** | x1.5 multiplicador |

---

### Fase 10: Despliegue a GitHub Pages

#### [MODIFY] [package.json](file:///d:/vue_dev/quiniela-mundialista/package.json)
Agregar script `"deploy": "npm run build && gh-pages -d dist"`.

#### [NEW] [.github/workflows/deploy.yml](file:///d:/vue_dev/quiniela-mundialista/.github/workflows/deploy.yml)
GitHub Action opcional para deploy automático en push a `main`.

---

## Arquitectura de Archivos

```
quiniela-mundialista/
├── public/
│   ├── .nojekyll
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.vue
│   │   ├── MatchCard.vue
│   │   ├── GroupTable.vue
│   │   ├── LeaderboardTable.vue
│   │   ├── JoinModal.vue
│   │   └── GoogleLoginButton.vue
│   ├── composables/
│   │   └── useQuiniela.js
│   ├── data/
│   │   └── worldcup2026.js
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   ├── auth.js
│   │   ├── quiniela.js
│   │   └── matches.js
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── CreateQuinielaView.vue
│   │   ├── QuinielaDetailView.vue
│   │   ├── PredictView.vue
│   │   ├── LeaderboardView.vue
│   │   └── AdminView.vue
│   ├── App.vue
│   ├── firebase.js
│   ├── main.js
│   └── style.css
├── .env.local.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Verification Plan

### Automated Tests
- `npm run build` — Verificar que la app compila sin errores

### Manual Verification
- `npm run dev` — Verificar que la app arranca y se ve correctamente
- Probar login con Google (requiere configurar Firebase)
- Probar crear quiniela y hacer predicciones
- Verificar responsive design en mobile
- Verificar que GitHub Pages deployment funciona
