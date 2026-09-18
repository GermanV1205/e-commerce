# Diseño de API REST (Endpoints)

Este documento define los contratos de comunicación (Endpoints) para el E-commerce. La API base tendrá el prefijo `/api/v1`. Todas las peticiones protegidas requieren el envío de un token JWT en el header: `Authorization: Bearer <token>`.

## 1. Módulo de Autenticación (`/auth`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Público | Registra un nuevo cliente. | `{ email, password, firstName, lastName }` |
| `POST` | `/auth/login` | Público | Autentica al usuario. Retorna JWT. | `{ email, password }` |
| `POST` | `/auth/refresh` | Público | Refresca el Access Token usando la cookie. | Ninguno (usa HttpOnly Cookie) |
| `POST` | `/auth/logout` | Público | Invalida el token actual y limpia cookies. | Ninguno |

## 2. Módulo de Catálogo y Variantes (`/products`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `GET`  | `/products` | Público | Lista productos (Paginación, filtros). | Query: `?category=vestidos&size=M` |
| `GET`  | `/products/:slug` | Público | Detalle de un producto y sus variantes. | Ninguno |
| `POST` | `/products` | Admin | Crea un nuevo producto base. | `{ name, categoryId, description }` |
| `PUT`  | `/products/:id` | Admin | Actualiza información del producto. | `{ name, is_active... }` |
| `POST` | `/products/:id/variants` | Admin | Agrega una variante (talla/color) a un producto. | `{ size, color, sku, price, stock }` |

## 3. Módulo de Carrito (`/cart`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `GET`  | `/cart` | Cliente | Obtiene el carrito actual del usuario. | Ninguno |
| `POST` | `/cart/items` | Cliente | Agrega un producto (variante) al carrito. | `{ variantId, quantity }` |
| `PATCH`| `/cart/items/:id` | Cliente | Actualiza la cantidad de un ítem. | `{ quantity }` |
| `DELETE`| `/cart/items/:id`| Cliente | Elimina un ítem del carrito. | Ninguno |

## 4. Módulo de Checkout y Pedidos (`/orders`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/orders/checkout`| Cliente | Procesa el carrito, genera pedido y descuenta stock. | `{ shippingAddressId, paymentMethod }` |
| `GET`  | `/orders` | Cliente/Admin | Lista pedidos (Cliente ve los suyos, Admin todos). | Query: `?status=PENDING` |
| `GET`  | `/orders/:id` | Cliente/Admin | Detalle completo de un pedido. | Ninguno |
| `PATCH`| `/orders/:id/status`| Admin/Seller| Actualiza el estado logístico del pedido. | `{ status, trackingNumber }` |
| `POST` | `/orders/:id/notes` | Admin/Seller| Agrega una nota interna al pedido. | `{ content }` |

## 5. Módulo de Inventario (`/inventory`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/inventory/movements` | Admin | Registra un ingreso manual o ajuste de mercadería. | `{ variantId, quantity, type, reason }` |
| `GET`  | `/inventory/alerts` | Admin/Seller| Retorna variantes con stock por debajo del umbral. | Ninguno |

## 6. Módulo de Usuarios y Roles (`/users`)

| Método | Endpoint | Acceso | Descripción | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| `GET`  | `/users/me` | Autenticado | Obtiene el perfil del usuario actual. | Ninguno |
| `GET`  | `/users` | Admin | Lista todos los usuarios/clientes. | Ninguno |
| `POST` | `/users/staff` | Admin | Crea una cuenta para un Vendedor (Seller). | `{ email, password, role: 'SELLER' }` |