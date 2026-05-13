# 🚗 Parking Management System Web

Frontend desarrollado en **Angular** para el sistema de gestión de cochera **Parking Management System**.

Esta aplicación consume una API REST desarrollada en .NET 8 y permite operar visualmente los principales flujos del sistema: autenticación, dashboard, ingresos y salidas de vehículos, tickets, espacios, tarifas y abonados.

Este proyecto forma parte de un sistema completo compuesto por:

- **Backend:** ParkingManagementSystem
- **Frontend:** ParkingManagementSystemWeb

## 🧩 Tecnologías utilizadas

- Angular
- TypeScript
- SCSS
- Reactive Forms
- Angular Router
- Guards
- HTTP Interceptor
- Signals
- Consumo de API REST
- JWT Authentication

## ⚙️ Funcionalidades principales

- Login conectado a la API.
- Protección de rutas mediante Auth Guard.
- Envío automático del token JWT con HTTP Interceptor.
- Control visual de opciones según rol.
- Dashboard operativo con datos reales.
- Registro de ingreso de vehículos.
- Generación e impresión de ticket de ingreso.
- Consulta de monto estimado.
- Registro de salida de vehículos.
- Búsqueda de ticket.
- Historial de ingresos y salidas.
- Visualización de espacios de cochera.
- Gestión de tarifas para usuario `Admin`.
- Listado, creación, renovación, cancelación y procesamiento de abonados.

## 👤 Roles del sistema

### Admin

Usuario administrativo con acceso a funcionalidades como:

- Dashboard.
- Registro de ingresos y salidas.
- Consulta de tickets e historial.
- Gestión de espacios.
- Gestión de tarifas.
- Gestión de abonados.
- Cancelación de abonados.
- Procesamiento de abonados vencidos.

### Attendant

Usuario operativo encargado de la atención diaria de la cochera.

Puede realizar acciones como:

- Registrar ingreso de vehículos.
- Consultar monto estimado.
- Registrar salida.
- Buscar tickets.
- Consultar historial.
- Visualizar espacios.
- Crear y renovar abonados.

## 📦 Módulos principales

### Autenticación

- Login de usuario.
- Almacenamiento de sesión.
- Protección de rutas.
- Interceptor JWT para peticiones protegidas.
- Cierre de sesión.

### Dashboard

Muestra un resumen operativo del sistema:

- Total de espacios.
- Espacios disponibles.
- Espacios ocupados.
- Espacios reservados.
- Abonados activos.
- Abonados vencidos.
- Ingresos del día.
- Tickets cerrados del día.

### Parking Entries

Módulo encargado del flujo operativo de vehículos:

- Registrar ingreso.
- Mostrar e imprimir ticket.
- Consultar monto estimado.
- Registrar salida.
- Buscar ticket.
- Consultar historial.

### Parking Spaces

Permite visualizar el estado de los espacios de cochera:

- Disponible.
- Ocupado.
- Reservado.

### Rate Types

Permite administrar tarifas del sistema para usuario `Admin`:

- Listar tarifas.
- Crear tarifa.
- Editar tarifa.
- Desactivar tarifa.

### Subscriptions

Permite gestionar abonados:

- Listar abonados.
- Crear abonado.
- Renovar abonado.
- Cancelar abonado.
- Procesar abonados vencidos.

## 🔐 Seguridad en frontend

El frontend utiliza:

- `Auth Guard` para proteger rutas privadas.
- `Role Guard` para restringir pantallas según rol.
- `HTTP Interceptor` para enviar el token JWT en cada petición protegida.
- Validaciones en formularios reactivos alineadas con las reglas del backend.

## 🔗 API utilizada

El frontend consume una API REST local ubicada en:

```text
https://localhost:7066
