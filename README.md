# SysEqui

Sistema de equivalencias con frontend React/Vite y backend Node.js/Express.

## Estructura del proyecto

```text
SysEqui/
+-- Front_SysEqui
+-- Back_SysEqui
```

- `Front_SysEqui`: aplicación frontend.
- `Back_SysEqui`: API backend.
- La base de datos usada por defecto es MongoDB.

## Requisitos

- Node.js 22 o superior.
- npm.
- MongoDB local, usando Docker o instalación directa.
- Git.

## Configuración del backend

Entrar a la carpeta del backend:

```bash
cd Back_SysEqui
npm install
```

Crear un archivo `.env` dentro de `Back_SysEqui` tomando como referencia `.env.example`.

Ejemplo para desarrollo local:

```env
MONGO_URI=mongodb://localhost:27017/sysequi
PORT=5000
NODE_ENV=development
HEADER_EXECUTION_TIME=false
ATOMIC_BDD=false
ENDPOINT_LOGS=false
JWT_SECRET=clave_secreta_local
REDIS_PORT=6379
REDIS_HOST=localhost
FRONTEND_URL=localhost:5173
DOTENV_CONFIG_QUIET=true
```

Iniciar backend:

```bash
npm run dev
```

El backend debería quedar disponible en:

```text
http://localhost:5000
```

Swagger:

```text
http://localhost:5000/api-docs
```

## Configuración del frontend

Entrar a la carpeta del frontend:

```bash
cd Front_SysEqui
npm install
```

Crear un archivo `.env` dentro de `Front_SysEqui` tomando como referencia `.env.example`.

Contenido recomendado:

```env
VITE_URL_BACK=http://localhost:5000
```

Iniciar frontend:

```bash
npm run dev
```

El frontend normalmente queda disponible en:

```text
http://localhost:5173
```

## Opción 1: usar MongoDB con Docker

Abrir Docker Desktop y verificar que esté funcionando:

```bash
docker --version
docker info
```

Crear un contenedor de MongoDB:

```bash
docker run -d --name sysequi-mongodb -p 27017:27017 -v sysequi-mongodb-data:/data/db --restart unless-stopped mongo:8
```

Verificar que esté activo:

```bash
docker ps
docker logs sysequi-mongodb
```

En los logs debería aparecer un mensaje similar a:

```text
Waiting for connections
```

Con esta opción, el backend debe usar:

```env
MONGO_URI=mongodb://localhost:27017/sysequi
```

Comandos útiles:

```bash
docker start sysequi-mongodb
docker stop sysequi-mongodb
docker logs sysequi-mongodb
```

Entrar a MongoDB desde consola:

```bash
docker exec -it sysequi-mongodb mongosh sysequi
```

## Opción 2: usar MongoDB sin Docker

Instalar MongoDB Community Server desde la web oficial:

```text
https://www.mongodb.com/try/download/community
```

Durante la instalación, seleccionar la opción para instalar MongoDB como servicio de Windows.

Verificar que MongoDB esté ejecutándose:

```bash
mongosh
```

O conectarse directamente a la base del proyecto:

```bash
mongosh mongodb://localhost:27017/sysequi
```

Con esta opción, el backend también debe usar:

```env
MONGO_URI=mongodb://localhost:27017/sysequi
```

Si MongoDB no inicia, revisar el servicio de Windows llamado MongoDB Server desde `services.msc`.

## Orden recomendado para ejecutar el proyecto

1. Iniciar MongoDB con Docker o instalación local.
2. Iniciar backend:

```bash
cd Back_SysEqui
npm run dev
```

3. Iniciar frontend en otra terminal:

```bash
cd Front_SysEqui
npm run dev
```

4. Abrir:

```text
http://localhost:5173
```

## Variables de entorno

Los archivos `.env` no se suben al repositorio porque pueden contener claves o datos privados.

Cada entorno debe crear sus propios archivos:

```text
Back_SysEqui/.env
Front_SysEqui/.env
```

Usar como guía:

```text
Back_SysEqui/.env.example
Front_SysEqui/.env.example
```

## Notas

- No subir `node_modules`.
- No subir archivos `.env`.
- Si el frontend muestra una URL con `undefined`, revisar `Front_SysEqui/.env`.
- Si aparece `ERR_CONNECTION_REFUSED` al hacer login, revisar que el backend esté corriendo en `localhost:5000`.
- Si el backend no conecta a la base, revisar que MongoDB esté activo.
