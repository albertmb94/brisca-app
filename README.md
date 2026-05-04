# BriscaApp

Gestor de partidas de brisca física. Registra jugadores, puntuaciones por ronda, aplica las reglas de reenganche automáticamente y calcula los pagos al finalizar.

## Características

- **Jugadores sin registro**: Añade nombres directamente, sin emails ni contraseñas.
- **Reenganche automático**: Cuando un jugador supera los 150 puntos, se reengancha automáticamente al jugador vivo con mayor puntuación (mientras queden 2+ vivos).
- **Pagos por ronda**: Los perdedores de cada ronda pagan al ganador de esa ronda.
- **Liquidación final**: Al terminar la partida, se calcula automáticamente quién le debe qué a quién (partida + rondas + reenganches).
- **Historial y ranking**: Estadísticas de todas las partidas jugadas.

## Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js Server Actions + Supabase (PostgreSQL)
- **Despliegue**: Vercel (frontend) + Supabase (base de datos)

## Configuración local

1. Clona el repositorio e instala dependencias:
```bash
npm install
```

2. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta el schema:
   - Ve al SQL Editor de Supabase
   - Copia el contenido de `supabase/schema.sql`
   - Ejecútalo para crear las tablas y la función de reenganche

3. Copia las variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Rellena `.env.local` con tus credenciales de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

5. Ejecuta en modo desarrollo:
```bash
npm run dev
```

## Despliegue en Vercel

1. Sube el código a GitHub/GitLab/Bitbucket.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. Añade las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en la configuración del proyecto.
4. Despliega.

## Reglas de la Brisca (variante soportada)

- Los jugadores acumulan puntos por ronda.
- Gana la ronda quien **menos puntos** obtenga.
- Si un jugador supera los **150 puntos**, se **reengancha** al jugador vivo con **mayor** puntuación.
- Se puede reenganchar **tantas veces** como sea necesario mientras queden **2 o más jugadores vivos** (≤150).
- Cuando queda **1 solo jugador vivo** sin pasar de 150, ese jugador gana la partida.
- Al finalizar, cada jugador le paga al ganador:
  - El precio de la **partida**
  - El precio de la **última ronda**
  - El precio del **reenganche × número de reenganches** de ese jugador

## Estructura del proyecto

```
src/
  app/              # Rutas de Next.js (App Router)
  components/
    ui/             # Componentes shadcn/ui
    game/           # Componentes específicos del juego
    layout/         # Navegación y layout
  lib/
    actions/        # Server Actions (lógica de negocio)
    supabase/       # Clientes de Supabase
  types/            # Tipos TypeScript
```
