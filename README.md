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

## Crear el usuario administrador

El proyecto incluye el script `Back_SysEqui/scripts/create-admin.js`. Este script crea el
administrador inicial en MongoDB y guarda su contraseña cifrada. Si el usuario ya existe,
actualiza sus datos, su rol y su contraseña sin crear un duplicado.

### Cuándo ejecutarlo

Ejecutar el script:

- Después de configurar una base de datos nueva o vacía.
- Al instalar el proyecto en otra computadora.
- Después de eliminar el volumen o los datos de MongoDB.
- Cuando sea necesario cambiar o restablecer la contraseña del administrador.

No es necesario ejecutarlo cada vez que se inicia el sistema.

### 1. Iniciar MongoDB

Con Docker:

```bash
docker start sysequi-mongodb
docker ps
```

El contenedor `sysequi-mongodb` debe aparecer con estado `Up`. Si se utiliza MongoDB sin
Docker, comprobar que el servicio `MongoDB Server` esté iniciado.

### 2. Preparar el backend

Desde la carpeta raíz del proyecto:

```bash
cd Back_SysEqui
npm install
```

`npm install` solo es necesario la primera vez o cuando cambian las dependencias.

### 3. Configurar las variables del administrador

Crear `Back_SysEqui/.env` a partir de `.env.example`, si todavía no existe:

```powershell
Copy-Item .env.example .env
```

Abrir el archivo:

```powershell
notepad .env
```

Configurar la conexión y los datos del administrador. Usar una contraseña propia y segura:

```env
MONGO_URI=mongodb://localhost:27017/sysequi

ADMIN_DNI=22222222
ADMIN_PASSWORD=CAMBIAR_POR_UNA_CONTRASENA_SEGURA
ADMIN_EMAIL=admin@sysequi.local
ADMIN_NAME=Administrador
ADMIN_LASTNAME=Sistema
ADMIN_CELLPHONE=1111222233
```

No dejar espacios alrededor del signo `=`. Comprobar que `MONGO_URI` aparezca una sola vez
en el archivo.

> El archivo `.env` contiene información privada y no debe subirse a GitHub.

### 4. Crear o actualizar el administrador

Con MongoDB activo y estando dentro de `Back_SysEqui`, ejecutar:

```bash
npm run seed:admin
```

El resultado esperado es:

```text
Usuario administrador creado/actualizado correctamente.
```

El administrador podrá iniciar sesión con el DNI y la contraseña configurados en `.env`.

### Cambiar una contraseña olvidada

Modificar `ADMIN_PASSWORD` en `Back_SysEqui/.env` y volver a ejecutar:

```bash
npm run seed:admin
```

El script cifrará la nueva contraseña y actualizará el mismo administrador.

## Orden recomendado para ejecutar el proyecto

1. Iniciar MongoDB con Docker o instalación local.
2. En una base nueva, crear el administrador con `npm run seed:admin`.
3. Iniciar backend:

```bash
cd Back_SysEqui
npm run dev
```

4. Iniciar frontend en otra terminal:

```bash
cd Front_SysEqui
npm run dev
```

5. Abrir:

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

