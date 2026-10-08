
# Sistema de Gestión de Biblioteca

**Estudiante:** Jorge Daniel Achij López

## Descripción

Sistema de gestión de biblioteca desarrollado con NestJS y React + TypeScript.

El proyecto permite registrar, consultar, modificar y eliminar libros mediante una API REST. También incluye un laboratorio interactivo para visualizar las solicitudes HTTP, sus códigos de estado y las respuestas del servidor.

Los datos se almacenan temporalmente en memoria, sin utilizar una base de datos.

## Tecnologías

- NestJS: backend y API REST.
- React + TypeScript: interfaz de usuario.
- Vite: entorno de desarrollo del frontend.
- Swagger/OpenAPI: documentación de la API.
- class-validator y class-transformer: validación de datos.

## Estructura del proyecto

```text
BibliotecaJorge/
├── backend/
├── frontend/
└── README.md
```

## Requisitos previos

- Node.js compatible con las versiones instaladas de NestJS y Vite.
- npm.
- Visual Studio Code (opcional).

## Ejecución del backend

Abrir una terminal:

```bash
cd backend
npm install
npm run start:dev
```

API disponible en:

http://localhost:3000

Documentación Swagger:

http://localhost:3000/api

## Ejecución del frontend

Abrir otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Interfaz disponible en:

http://localhost:5173

El backend debe estar ejecutándose para que React pueda consultar y modificar los libros.

## Rutas de la API

| Método | Ruta | Descripción | Código de éxito |
|---|---|---|---|
| GET | /libros | Consultar todos los libros | 200 |
| GET | /libros/:id | Consultar un libro por ID | 200 |
| POST | /libros | Registrar un libro | 201 |
| PATCH | /libros/:id | Modificar parcialmente un libro | 200 |
| DELETE | /libros/:id | Eliminar un libro | 204 |

## Datos de un libro

| Campo | Tipo | Validación |
|---|---|---|
| titulo | string | Entre 2 y 100 caracteres |
| autor | string | Entre 2 y 100 caracteres |
| isbn | string | Exactamente 13 caracteres |
| anio | number | Número entero entre 1450 y 2100 |
| cantidad | number | Número entero mayor o igual a 0 |

Ejemplo de solicitud POST:

```json
{
  "titulo": "El Principito",
  "autor": "Antoine de Saint-Exupéry",
  "isbn": "9780156012195",
  "anio": 1943,
  "cantidad": 8
}
```

## Códigos de estado HTTP

| Código | Significado | Ejemplo |
|---|---|---|
| 200 OK | Solicitud exitosa | Consultar o modificar libros |
| 201 Created | Recurso creado | Registrar un libro |
| 204 No Content | Eliminación exitosa sin cuerpo | Eliminar un libro |
| 400 Bad Request | Solicitud inválida | Cantidad negativa o propiedad desconocida |
| 404 Not Found | Recurso inexistente | Consultar un ID que no existe |
| 409 Conflict | Conflicto con los datos existentes | Registrar un ISBN duplicado |

## Validación de solicitudes

La API utiliza ValidationPipe global con:

- whitelist: true
- forbidNonWhitelisted: true
- transform: true

Esto permite rechazar propiedades desconocidas y validar los datos recibidos.

Los errores HTTP se generan mediante las excepciones estándar de NestJS.

## Configuración de CORS

El backend permite solicitudes desde el origen exacto:

http://localhost:5173

## Laboratorio HTTP

La interfaz React incluye un monitor de solicitudes que permite observar:

- Método HTTP utilizado.
- Ruta solicitada.
- Código de estado recibido.
- Duración de la solicitud.
- JSON enviado.
- Respuesta del servidor.

También permite demostrar errores de validación, recursos inexistentes y conflictos por ISBN duplicado.

Para observar las solicitudes directamente en el navegador, abrir las herramientas de desarrollador con F12 y seleccionar la pestaña Network.

## Almacenamiento

Los libros se almacenan en un arreglo en memoria dentro del servicio de NestJS.

Los registros se pierden cuando se reinicia el backend, porque el proyecto no utiliza una base de datos.

## Compilación

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

## Autor

Jorge Daniel Achij López

Proyecto académico para demostrar arquitectura de software, API REST, semántica HTTP, validación de datos y manejo de errores con NestJS y React.
