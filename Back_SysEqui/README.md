# Back_SysEqui

Proyecto de automatización y gestión de sistemas de equivalencias de materias

## Instalación

Para instalar las dependencias de este proyecto, ejecutar el siguiente comando en la terminal:

```bash
pnpm install
```

## Configuración

Para configurar el servidor de desarrollo, ejecutar el siguiente comando en la terminal:

```bash
cp .env.example .env
```

Editar el archivo `.env` con las credenciales necesarias para acceder a la base de datos.

## Ejecución

Para ejecutar el servidor de desarrollo, ejecutar el siguiente comando en la terminal:

```bash
pnpm dev
```

## Opcional para usar Redis con Docker

### Usando Docker-Compose

Debes ejecutar el siguiente comando en la terminal:

```bash
docker-compose -f docker/docker-compose.redis.yml up -d
```

Esto iniciará un contenedor de Redis y Redis Insight.

Solo nececsitas abrir Docker Desktop para que el contenedor de Redis se ejecute automáticamente.

## Opcional para usar Mongo con Docker solo para testear en local

### Usando Docker-Compose

Debes ejecutar el siguiente comando en la terminal:

```bash
docker-compose -f docker/docker-compose.mongo.yml up -d
```

para conectarte a la bdd puedes usar la siguiente variable de entorno:
MONGO_URI=mongodb://localhost:27017/sysequi

Esto iniciará un contenedor de Mongo y Mongo Express.

Solo nececsitas abrir Docker Desktop para que el contenedor de Mongo se ejecute automáticamente.

## Para iniciar el proyecto desde cero

Crear un usuario y modificarlo a administrador desde la bdd

Luego pasar a ruta pública POST /users/unauth para activar la cuenta

Volver a dejar privada POST /users/unauth
