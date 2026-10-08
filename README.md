# registro-canaco

## Descripción
Plataforma web oficial de registro para el Foro CANACO Monterrey. Este sistema está diseñado para gestionar el registro de asistentes al evento empresarial que se llevará a cabo el 5 de noviembre en Cintermex. Facilita la captura de datos y la administración de participantes mediante una interfaz moderna y responsiva.

## Stack Tecnológico
El proyecto está desarrollado utilizando tecnologías modernas enfocadas en un alto rendimiento y en facilitar la experiencia del usuario y del desarrollador:
- **Framework:** [Next.js](https://nextjs.org/) (versión 16.x) con *App Router*.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (versión 5.x) para garantizar tipado estricto y un código seguro y escalable.
- **Core UI:** [React](https://react.dev/) (versión 19.x) y React DOM.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (versión 4.x) para el desarrollo ágil de componentes visuales modernos.
- **Formularios y Validación:** [React Hook Form](https://react-hook-form.com/) en conjunto con [Zod](https://zod.dev/) para el manejo de estado de formularios complejos y la validación segura de datos ingresados por el usuario.
- **Base de Datos / Backend-as-a-Service:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`) para la persistencia de datos.
- **Envío de Correos:** [Nodemailer](https://nodemailer.com/) para el envío de notificaciones y confirmaciones de registro vía SMTP.

## Estructura del Proyecto
El código sigue una estructura basada en el paradigma de `src/` que facilita la organización modular:

```text
registro-canaco/
├── public/                 # Assets estáticos y recursos públicos.
├── src/                    # Código fuente principal de la aplicación.
│   ├── app/                # Rutas, páginas y layouts (Next.js App Router).
│   │   ├── actions/        # Server Actions (lógica segura del lado del servidor).
│   │   ├── globals.css     # Estilos globales (configuración de Tailwind).
│   │   ├── layout.tsx      # Layout base de la aplicación.
│   │   └── page.tsx        # Página principal (Home / Formulario).
│   ├── components/         # Componentes de interfaz de usuario reutilizables (ej. FormularioRegistro).
│   ├── lib/                # Configuración de clientes (Supabase, Nodemailer) y utilidades.
│   └── types/              # Definiciones de tipos e interfaces de TypeScript.
├── .env.local              # Archivo de variables de entorno (no incluido en git).
├── next.config.ts          # Configuración principal de Next.js.
├── package.json            # Dependencias principales y scripts del proyecto.
├── eslint.config.mjs       # Configuración del linter (ESLint).
└── postcss.config.mjs      # Configuración de PostCSS (necesario para Tailwind).
```

## Requisitos Previos
Para poder levantar el entorno de desarrollo en tu máquina local, es necesario contar con:
- **Node.js:** Versión 20.x o superior.
- **Gestor de paquetes:** `npm` (el proyecto utiliza y mantiene `package-lock.json`).
- **Git:** Para el control de versiones.

## Instalación y Configuración

Sigue estos pasos para clonar, instalar dependencias y levantar la aplicación en un entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd registro-canaco
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto. En la sección [Variables de Entorno](#variables-de-entorno) puedes ver la plantilla requerida. Pide a un administrador los valores de las credenciales.

4. **Levantar el servidor local:**
   ```bash
   npm run dev
   ```
   El sitio estará disponible por defecto en [http://localhost:3000](http://localhost:3000).

## Variables de Entorno
A continuación se muestra una plantilla formato `.env.example` con las variables detectadas en el proyecto. Debes crear tu propio archivo `.env.local` y asignar los valores correspondientes:

```env
# ==========================================
# Configuración de Supabase (Base de datos)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ==========================================
# API de Gestión de Socios (Impera)
# ==========================================
IMPERA_API_URL=
IMPERA_API_KEY=

# ==========================================
# Credenciales SMTP (Nodemailer)
# ==========================================
SMTP_USER=
SMTP_PASS=
```

## Scripts Disponibles
En el archivo `package.json` se definen los siguientes scripts que automatizan el flujo de trabajo:

- `npm run dev`: Inicia el servidor de desarrollo de Next.js con soporte de Hot-Module-Replacement (HMR) para actualizar automáticamente los cambios en el navegador.
- `npm run build`: Compila y empaqueta la aplicación generando una versión altamente optimizada lista para producción.
- `npm run start`: Inicia el servidor de producción usando los recursos generados previamente por `npm run build`.
- `npm run lint`: Ejecuta la herramienta ESLint sobre el código fuente para analizar la sintaxis y forzar las convenciones del código.
