# 🌿 Urtika · UAS7

> **Sistema clínico integral para el registro y monitorización de urticaria crónica y reacciones alérgicas.**
> Diseñado para pacientes y alergólogos: cálculo automático de la escala **UAS7**, mapa corporal interactivo, monitor ambiental de polen con navegación por gestos, sincronización en la nube con Google y exportación de informes médicos en PDF.

---

## ✨ Características Principales

### 🩺 Cálculo Clínico Oficial UAS & UAS7
* **Escala validada internacionalmente**: Registro diario de número de habones (0 a 3) e intensidad del prurito/picor (0 a 3), obteniendo una puntuación diaria de 0 a 6.
* **Suma semanal UAS7 (0 a 42)**: Clasificación clínica automática en rangos de severidad (*Controlada / Leve / Moderada / Severa*), lista para presentar en consulta médica.
* **Evolución temporal**: Gráficos de tendencia semanal y resumen estadístico de brotes.

### 🗺️ Mapa Corporal Anatómico Interactivo (BodyMap)
* Selector visual de zonas afectadas con visualización anatómica frontal y dorsal (cabeza, cara, cuello, tórax, abdomen, cintura/pelvis, brazos, manos, muslos, piernas y pies).
* Previsualización miniatura (*MiniBodyPreview*) en la línea de tiempo y en la vista de hoja de cálculo.

### 🌸 Monitor Ambiental de Polen y Alérgenos
* **Datos contextuales de 10 alérgenos botánicos y ambientales**: Parietaria, Gramíneas, Olivo, Plátano de sombra, Abedul, Ciprés/Arizónicas, Artemisia, Ácaros y Hongos.
* **Optimizado para móvil**: Navegación fluida por gestos táctiles (**Swipe** de un lado a otro), tarjeta al 100% de ancho sin flechas molestas e indicadores de puntos interactivos.
* **Buscador mundial**: Búsqueda en tiempo real de cualquier ciudad del mundo con geocodificación.

### 📄 Exportación Médica a PDF
* Generación de informes clínicos oficiales listos para imprimir o enviar al especialista por correo o WhatsApp.
* Tabla completa de registros, cálculo semanal UAS7, resumen de síntomas y **anexo fotográfico opcional** con las imágenes de los brotes.

### 📱 Progressive Web App (PWA) & Offline First
* Funciona **100% sin conexión a internet**: Los registros se guardan localmente en el dispositivo (`localStorage`) y se sincronizan con Firebase Firestore cuando vuelve la conexión.
* Instalable en la pantalla de inicio de iPhone (Safari -> Compartir -> Añadir a inicio) y Android (Chrome -> Instalar aplicación).

### 🌓 Modo Noche (Tema Azul Telegram)
* Interfaz conmutador Día / Noche con paleta oscura de bajo brillo inspirada en Telegram Desktop (`#17212b`, `#242f3d`, `#64b5f6`), ideal para personas con fotofobia o brotes nocturnos.

### 🔒 Privacidad y Multiusuario
* **Modo Local Anónimo**: Permite usar la aplicación de inmediato sin registrarse; los datos nunca salen del navegador.
* **Sincronización con Google**: Inicio de sesión seguro con Google y base de datos Firestore con reglas de seguridad estrictas que aíslan los datos de cada paciente por su identificador único (`request.auth.uid`).

---

## 🚀 Pila Tecnológica

* **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
* **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Iconografía**: [Lucide React](https://lucide.dev/)
* **Base de datos & Auth**: [Firebase v13](https://firebase.google.com/) (Firestore + Google Authentication)
* **Informes PDF**: [jsPDF](https://github.com/parallax/jsPDF) + `jspdf-autotable`
* **PWA & Offline**: `vite-plugin-pwa` + Workbox
* **Código QR**: `qrcode.react`

---

## 📁 Estructura del Código

```text
urtika/
├── public/                 # Recursos estáticos limpios (iconos, manifest PWA)
│   ├── favicon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo.svg
│   └── manifest.json
├── src/
│   ├── components/         # Componentes modulares de interfaz
│   │   ├── BodyMap.tsx             # Selector anatómico interactivo
│   │   ├── CardsTimelineView.tsx   # Vista de cronología por tarjetas
│   │   ├── ClinicalReportView.tsx  # Vista de informe clínico y cálculo UAS7
│   │   ├── MiniBodyPreview.tsx     # Miniatura anatómica de zonas
│   │   ├── MobileAccessModal.tsx   # Modal con código QR para abrir en móvil
│   │   ├── Navbar.tsx              # Barra de navegación principal y tema
│   │   ├── PollenWidget.tsx        # Widget de polen con swipe táctil
│   │   ├── ReactionDetailModal.tsx # Detalle ampliado de un brote
│   │   ├── ReactionModal.tsx       # Formulario guiado para añadir reacción
│   │   ├── SpreadsheetView.tsx     # Vista en tabla tipo hoja de cálculo
│   │   └── ViewTabs.tsx            # Selector de vistas (Hoja / Tarjetas / UAS7)
│   ├── firebase/           # Configuración, AuthContext y hook de Firestore
│   │   ├── AuthContext.tsx
│   │   ├── config.ts
│   │   ├── errorHandler.ts
│   │   └── useUserReactions.ts
│   ├── hooks/              # Hooks personalizados (PWA, estado online)
│   ├── theme/              # Contexto de tema Claro / Noche Azul Telegram
│   ├── types/              # Definiciones TypeScript de alergias y UAS7
│   ├── utils/              # Generador de PDF, cálculo de fechas y búsqueda geo
│   ├── App.tsx             # Componente raíz de la aplicación
│   └── main.tsx            # Punto de entrada React
├── firestore.rules         # Reglas de seguridad Firebase Firestore
├── wrangler.jsonc          # Configuración de despliegue para Cloudflare
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/wjoa97/urtika.git
cd urtika
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador: `http://localhost:3000`

### 4. Compilar para producción
```bash
npm run build
```
Los archivos optimizados para producción se generarán en la carpeta `dist/`.

---

## 🌐 Despliegue en Cloudflare Pages / Static Hosting

La aplicación es una Single Page Application (SPA) 100% estática que no requiere servidores backend Node.js en ejecución:

1. Ejecuta `npm run build`.
2. En el panel de **Cloudflare Pages** (o cualquier hosting como Vercel, Netlify o GitHub Pages):
   - Si usas subida directa: Arrastra el contenido de la carpeta `dist/` generada.
   - Si conectas tu repositorio de Git:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
3. ¡Listo! Tendrás tu aplicación en línea con HTTPS y CDN mundial gratuito.

---

## 📄 Licencia

Este proyecto está bajo la licencia **Apache 2.0**.
Desarrollado con enfoque en la accesibilidad, privacidad del paciente y utilidad médica.
