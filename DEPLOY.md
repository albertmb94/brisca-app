# 🚀 Guía de Despliegue: BriscaApp

Esta guía te lleva paso a paso desde el código local hasta la app funcionando en producción con **Vercel** (frontend) y **Supabase** (base de datos).

---

## Parte 1: Configurar Supabase (Base de Datos)

### Paso 1.1 — Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión (puedes usar GitHub).
2. Haz clic en **"New Project"**.
3. Selecciona tu organización (por defecto tu usuario).
4. Configura el proyecto:
   - **Name**: `brisca-app` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y guárdala (la necesitarás para conexiones directas)
   - **Region**: Elige la región más cercana a tus jugadores (ej: `West Europe (London)` para España)
5. Espera ~2 minutos a que se cree el proyecto.

### Paso 1.2 — Ejecutar el schema SQL

1. En el dashboard de tu proyecto Supabase, ve a la pestaña **"SQL Editor"** (en el menú lateral izquierdo).
2. Haz clic en **"New query"**.
3. Borra el contenido por defecto y **pega TODO el contenido** del archivo `supabase/schema.sql` de este proyecto.
4. Haz clic en el botón **"Run"** (▶️) arriba a la derecha.
5. Verás un mensaje de éxito. Las tablas y funciones han sido creadas.

**Tablas creadas:**
- `games` — Partidas
- `game_players` — Jugadores en cada partida
- `rounds` — Rondas jugadas
- `round_scores` — Puntuaciones por ronda
- `transactions` — Registro de pagos económicos

**Función creada:**
- `process_round_end` — Lógica de reenganche (opcional, ya que la lógica principal está en los Server Actions)

### Paso 1.3 — Obtener credenciales de API

Necesitas dos valores para conectar tu app con Supabase:

1. En el dashboard de Supabase, ve a **Project Settings** (icono de engranaje ⚙️ abajo a la izquierda).
2. Selecciona **"API"** en el menú lateral.
3. Copia estos dos valores:
   - **URL** (ej: `https://abcdefgh12345678.supabase.co`)
   - **anon public** (ej: `eyJhbGciOiJIUzI1NiIs...`)

Guárdalos, los necesitarás en el siguiente paso.

---

## Parte 2: Configurar variables de entorno local

1. En tu proyecto local, copia el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```

2. Abre `.env.local` y rellena con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
```

3. **Prueba localmente** que todo funciona:
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) y prueba crear una partida. Si ves la partida en Supabase → SQL Editor → Table Editor → `games`, ¡todo funciona!

---

## Parte 3: Subir a GitHub

Vercel se conecta directamente a tu repositorio Git.

### Si ya tienes el proyecto en un repo:
Asegúrate de hacer push de todos los cambios:
```bash
git add .
git commit -m "feat: mvp brisca app completo"
git push origin main
```

### Si NO tienes repo aún:
1. Ve a [https://github.com/new](https://github.com/new) y crea un repositorio nuevo (ej: `brisca-app`).
2. En tu carpeta local, ejecuta:
```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/brisca-app.git
git push -u origin main
```

---

## Parte 4: Desplegar en Vercel

### Paso 4.1 — Importar proyecto

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** → **"Project"**.
3. En la lista de repositorios, busca y selecciona `brisca-app`.
4. Haz clic en **"Import"**.

### Paso 4.2 — Configurar variables de entorno

Antes de hacer deploy, debes añadir las variables de entorno de Supabase:

1. En la pantalla de configuración del proyecto, busca la sección **"Environment Variables"**.
2. Añade dos variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL` | **Value**: `https://TU-PROYECTO.supabase.co`
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Value**: `TU-ANON-KEY`
3. Asegúrate de que el entorno esté en **"Production"** (o añádelo a los 3: Production, Preview, Development).

### Paso 4.3 — Deploy

1. Haz clic en **"Deploy"**.
2. Espera ~1-2 minutos a que se compile y despliegue.
3. Cuando termine, verás una pantalla de éxito con tu URL (ej: `https://brisca-app.vercel.app`).

---

## Parte 5: Verificación post-despliegue

### 5.1 — Probar la app en producción

1. Abre tu URL de Vercel.
2. Crea una partida de prueba:
   - Nombre: "Test"
   - Jugadores: Ana, Luis, Pepe
   - Precios: puedes dejarlos en 0 para probar
3. Inicia la partida.
4. Registra 2-3 rondas con puntuaciones variadas.
5. Verifica que:
   - El marcador se actualiza correctamente
   - Si alguien pasa de 150 y quedan 2+ vivos, se reengancha
   - Si queda 1 solo vivo, la partida finaliza
   - El resumen de pagos aparece al finalizar

### 5.2 — Verificar datos en Supabase

1. Ve al dashboard de Supabase → **Table Editor**.
2. Comprueba que las tablas `games`, `game_players`, `rounds`, etc. tienen datos.
3. Esto confirma que la conexión entre Vercel y Supabase funciona.

---

## 🔧 Solución de problemas comunes

### Error: "Supabase URL o Anon Key no configuradas"
**Causa**: Las variables de entorno no están definidas o tienen un nombre incorrecto.
**Solución**: Verifica en Vercel → Project Settings → Environment Variables que ambas variables existen exactamente así:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recuerda que las variables con `NEXT_PUBLIC_` deben estar definidas **antes** del build. Si las añades después, haz un redeploy.

### Error: "relation 'games' does not exist"
**Causa**: No has ejecutado el schema SQL en Supabase.
**Solución**: Ve a Supabase → SQL Editor y ejecuta el contenido de `supabase/schema.sql`.

### Error 500 al crear partida
**Causa**: Posiblemente un problema con las políticas RLS (Row Level Security).
**Solución**: El schema SQL ya incluye políticas permisivas (`allow_all_*`). Si modificaste algo, verifica en Supabase → Authentication → Policies que las tablas permitan INSERT/SELECT.

### Los datos no persisten entre recargas
**Causa**: La app está usando un mock o las Server Actions no se ejecutan correctamente.
**Solución**: Verifica los logs de Vercel (Deployments → tu deploy → Functions) para ver errores de Supabase.

---

## 🔄 Redeploy tras cambios

Cada vez que hagas `git push` a la rama `main`, Vercel **reconstruirá y redeployará automáticamente** la app.

Si cambias variables de entorno, debes hacer un redeploy manual:
Vercel Dashboard → tu proyecto → Deployments → ... (tres puntos) → **"Redeploy"**.

---

## 📱 Acceso desde móvil

Una vez desplegada, cualquiera con el URL puede usar la app desde el móvil. Para una experiencia tipo app nativa:

1. Abre la URL en Safari (iOS) o Chrome (Android).
2. Añade a pantalla de inicio:
   - **iOS**: Compartir → "Añadir a pantalla de inicio"
   - **Android**: Menú → "Añadir a pantalla de inicio"
3. La app se abrirá en pantalla completa sin la barra del navegador.

---

## ✅ Checklist final

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado correctamente
- [ ] Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` copiadas
- [ ] `.env.local` configurado localmente
- [ ] App funciona en `localhost:3000`
- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno añadidas en Vercel
- [ ] Deploy exitoso
- [ ] Partida de prueba creada y funcionando en producción

---

¿Problemas? Revisa los logs en **Vercel Dashboard → tu proyecto → Deployments → (último deploy) → Functions** para ver errores específicos del servidor.
