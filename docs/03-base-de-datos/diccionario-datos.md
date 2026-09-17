# Diccionario de Datos

Este documento detalla la estructura física de las tablas principales en PostgreSQL, especificando los tipos de datos, restricciones y el propósito de cada campo.

### 1. Tabla: `users` (Usuarios y Personal)
Gestiona la autenticación y los roles dentro de la plataforma.

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único del registro. |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico usado para el login. |
| `password_hash` | VARCHAR(255) | NOT NULL | Contraseña encriptada con Bcrypt. |
| `role` | ENUM | DEFAULT 'CLIENT' | Rol del usuario: ADMIN, SELLER, CLIENT. |
| `first_name` | VARCHAR(100) | NOT NULL | Nombre del usuario. |
| `last_name` | VARCHAR(100) | NOT NULL | Apellido del usuario. |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación de la cuenta. |

### 2. Tabla: `products` (Catálogo Base)
Almacena la información general de la prenda de ropa.

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único del producto. |
| `category_id` | UUID | FK | Referencia a la tabla `categories`. |
| `name` | VARCHAR(200) | NOT NULL | Nombre comercial de la prenda. |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL amigable (ej. `blusa-cuello-v`). |
| `is_active` | BOOLEAN | DEFAULT TRUE | Define si el producto es visible en la tienda. |

### 3. Tabla: `product_variants` (Variantes Físicas)
Es el corazón del inventario. Representa la combinación física exacta que el cliente compra.

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único de la variante. |
| `product_id` | UUID | FK | Referencia a la tabla `products`. |
| `size` | VARCHAR(10) | NOT NULL | Talla de la prenda (S, M, L, XL, Unitalla). |
| `color` | VARCHAR(50) | NOT NULL | Color de la prenda. |
| `sku` | VARCHAR(100) | UNIQUE, NOT NULL | Código de barras o identificador de almacén. |
| `price` | DECIMAL(10,2) | NOT NULL | Precio específico de esta variante. |
| `stock` | INTEGER | DEFAULT 0, >= 0 | Cantidad actual disponible físicamente. |
| `image_url` | VARCHAR(255) | NULL | Enlace al storage (S3) de la foto en este color. |

### 4. Tabla: `orders` (Pedidos)
Registra la transacción general de la compra.

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único del pedido. |
| `user_id` | UUID | FK, NOT NULL | Referencia al cliente que compró. |
| `total_amount`| DECIMAL(10,2) | NOT NULL | Costo total del pedido incluyendo impuestos y envío. |
| `status` | ENUM | DEFAULT 'PENDING' | Estado logístico (PENDING, PAID, SHIPPED...). |
| `tracking_num`| VARCHAR(100) | NULL | Número de guía de la paquetería. |

### 5. Tabla: `order_items` (Detalle de Pedidos)
Congela el estado de la compra en el tiempo (evita que cambios futuros de precio afecten el histórico).

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único de la línea de compra. |
| `order_id` | UUID | FK | Referencia a la tabla `orders`. |
| `variant_id` | UUID | FK | Referencia a la prenda exacta comprada. |
| `quantity` | INTEGER | NOT NULL, > 0 | Cantidad comprada de esta variante. |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Precio de la prenda en el momento de la compra. |

### 6. Tabla: `stock_movements` (Kardex / Auditoría)
Registra cada entrada o salida de inventario para fines contables.

| Campo | Tipo (PostgreSQL) | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador del movimiento. |
| `variant_id` | UUID | FK | Variante afectada. |
| `user_id` | UUID | FK | Empleado/Admin que registró el movimiento. |
| `quantity` | INTEGER | NOT NULL | Cantidad (+ para ingresos, - para ventas/pérdidas). |
| `type` | ENUM | NOT NULL | Origen: PURCHASE, SALE, ADJUSTMENT, RETURN. |