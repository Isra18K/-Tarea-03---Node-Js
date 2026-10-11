# FERROTEC - Sistema de Gestión de Ferretería (Node.js & Express)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-black.svg?logo=express)](https://expressjs.com/)
[![SQLite3](https://img.shields.io/badge/SQLite-3-blue.svg?logo=sqlite)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?logo=javascript)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

Plataforma web integral para la administración comercial y control de existencias de **FERROTEC**, desarrollada sobre el entorno de ejecución **Node.js**. El proyecto implementa una arquitectura desacoplada basada en servicios **RESTful**, persistencia relacional local con **SQLite3**, soporte para **transacciones ACID manuales** y un cliente web interactivo servido de forma nativa.

---

## 📋 Tabla de Contenidos

1. [Descripción y Propósito](#-descripción-y-propósito)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Documentación de la API REST](#-documentación-de-la-api-rest)
7. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
8. [Pruebas de Transaccionalidad](#-pruebas-de-transaccionalidad-acid)
9. [Licencia](#-licencia)

---

## 📖 Descripción y Propósito

Este proyecto demuestra las capacidades de **Node.js** para construir soluciones de servidor eficientes, ligeras y concurrentes mediante su modelo asíncrono no bloqueante (*Event Loop*). Administra el ciclo completo del catálogo ferretero (consultas, altas, modificaciones) y la salida de existencias mediante compras atómicas por carrito.

---

## 🚀 Características Principales

* **Control de Inventario (CRUD):** Endpoints REST para listar, registrar y actualizar precios o niveles de existencias.
* **Transacciones ACID en SQLite:** Ejecución controlada con `BEGIN TRANSACTION`, `COMMIT` y `ROLLBACK` para evitar ventas parciales si no hay existencias disponibles.
* **Persistencia Relacional Embebida:** Archivo local de base de datos (`ferreteria.db`) generado y poblado automáticamente al arrancar.
* **Frontend Servido Estáticamente:** Dashboard y catálogo estilo e-commerce usando HTML5, CSS3 y Vanilla JavaScript (`fetch` nativo) servidos mediante el middleware `express.static`.
* **Cero dependencias pesadas:** No requiere motores externos como PostgreSQL ni contenedores Docker.

---

## 🛠️ Stack Tecnológico

* **Runtime:** Node.js (v18 o superior recomendado)
* **Framework Backend:** Express.js (v4.x)
* **Motor de Persistencia:** SQLite3 (`sqlite3`)
* **Cliente Web:** HTML5, CSS3, Vanilla JavaScript (ES6+), FontAwesome
* **Gestor de Paquetes:** npm

---

## 🏛️ Arquitectura del Sistema

El backend sigue un patrón cliente-servidor desacoplado y orientado a eventos:

```
[ Cliente Web / Navegador ]
            │
      HTTP (JSON / Fetch)
            ▼
[ Middleware Express (express.json, express.static) ]
            │
            ▼
[ Rutas REST en index.js ]
            │
            ├── Operaciones Simples ────► SQLite3 (db.all, db.run)
            │
            └── Operaciones Complejas ──► Transacción ACID
                                          ├── BEGIN TRANSACTION
                                          ├── Verificación de Stock
                                          ├── UPDATE / INSERT
                                          └── COMMIT / ROLLBACK
```

1. **`database.js`:** Encapsula la apertura de la base de datos `ferreteria.db`, la inicialización de tablas mediante `db.serialize()` y la inserción de registros semilla.
2. **`index.js`:** Punto de entrada; configura middlewares, expone la API REST y sirve la interfaz ubicada en la carpeta `public/`.
3. **`public/index.html`:** Interfaz gráfica que interactúa asíncronamente con los endpoints REST.

---

## 📁 Estructura del Proyecto

```
ferreteria-nodejs/
├── database.js          # Configuración, DDL y carga de datos semilla SQLite
├── index.js             # Servidor Express y controladores de rutas REST
├── package.json         # Metadatos del proyecto y dependencias (express, sqlite3)
├── ferreteria.db        # Archivo de base de datos relacional (autogenerado)
└── public/
    └── index.html       # Cliente web estático (interfaz e-commerce / dashboard)
```

---

## 📡 Documentación de la API REST

### 1. Catálogo de Productos

| Método | Endpoint | Descripción | Código Éxito |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Obtiene todos los productos registrados | `200 OK` |
| `POST` | `/api/productos` | Da de alta un nuevo producto | `201 Created` |
| `PUT` | `/api/productos/:id` | Modifica stock, precio u otros datos | `200 OK` |

#### Payload de ejemplo para `POST /api/productos`:
```json
{
  "nombre": "Taladro Percutor 650W",
  "categoria": "Herramientas",
  "precio": 425.00,
  "stock": 6
}
```

---

### 2. Transacción de Ventas (Carrito de Compras)

| Método | Endpoint | Descripción | Códigos |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ventas/carrito` | Procesa la venta en bloque con transacción atómica | `200 OK` / `400 Bad Request` |

#### Payload de ejemplo para `POST /api/ventas/carrito`:
```json
{
  "items": [
    { "id": 1, "cantidad": 2 },
    { "id": 3, "cantidad": 1 }
  ]
}
```

#### Respuesta exitosa:
```json
{
  "mensaje": "Venta procesada con éxito",
  "articulosVendidos": 2,
  "totalPagar": 108.00
}
```

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos

* Tener instalado **Node.js** (v18+) y **npm**. Verifica con:
  ```bash
  node -v
  npm -v
  ```

### Pasos de ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Isra18K/-Tarea-03---Node-Js.git
   cd -Tarea-03---Node-Js
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   # O directamente:
   node index.js
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador en:
   ```text
   http://localhost:3000/
   ```

---

## 🛡️ Pruebas de Transaccionalidad (ACID)

Para comprobar el manejo de transacciones en Node.js y SQLite:

1. **Venta Exitosa:** Al procesar un pedido donde todos los artículos tienen existencia disponible, la transacción ejecuta `COMMIT` y actualiza el stock en `ferreteria.db`.
2. **Rollback Automático:** Si se solicita una cantidad superior al stock de cualquiera de los artículos incluidos, el backend dispara `ROLLBACK`, cancelando de inmediato toda la operación sin dejar registros corruptos o inconsistencias en inventario.

---

## 📄 Licencia

Este proyecto se encuentra bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.