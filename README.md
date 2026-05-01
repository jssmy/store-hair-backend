# Store Hair CRM — Backend

API REST para el CRM de gestión de tienda de peluquería. Construida con NestJS 11, TypeORM y autenticación JWT.

## Stack

- **Runtime:** Node.js 24
- **Framework:** NestJS 11
- **ORM:** TypeORM 0.3
- **Base de datos:** PostgreSQL / MySQL (configurable via `DB_DRIVER`)
- **Auth:** JWT + Passport

## Módulos

| Módulo | Ruta base | Descripción |
|---|---|---|
| Auth | `/auth` | Registro, login y usuario por defecto |
| Supplier | `/supplier` | CRUD de proveedores (requiere JWT) |

### Endpoints Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | No | Login, retorna JWT |
| POST | `/auth/register` | No | Registro de usuario |
| GET | `/auth/default` | No | Crea usuario de prueba |

### Endpoints Supplier

> Todos requieren header `Authorization: Bearer <token>`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/supplier` | Crear proveedor |
| GET | `/supplier` | Listar todos |
| GET | `/supplier/:id` | Obtener por ID |
| PATCH | `/supplier/:id` | Actualizar |
| DELETE | `/supplier/:id` | Eliminar |

## Variables de entorno

Copia `env.example` a `.env` y completa los valores:

```bash
cp env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_DRIVER` | Motor de base de datos | `postgres` o `mysql` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto | `5432` |
| `DB_USERNAME` | Usuario | `pos_user` |
| `DB_PASSWORD` | Contraseña | `123456` |
| `DB_NAME` | Nombre de la base de datos | `crm_db` |
| `JWT_SECRET` | Secreto para firmar tokens | `change_me_in_production` |
| `PORT` | Puerto del servidor (opcional) | `3000` |

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Docker

```bash
# Levantar con docker compose (lee el .env automáticamente)
docker compose up --build

# Detener
docker compose down
```

El contenedor se llama `store-hair-back-crm` y expone el puerto `3000`.

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Cobertura
npm run test:cov
```
