# Modelo Entidad-Relación (ER) - E-commerce de Ropa

Este documento describe la estructura relacional de la base de datos (PostgreSQL), diseñada para soportar la complejidad de productos con múltiples variantes (tallas, colores), gestión de inventario, y flujos de compra seguros.

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    %% Módulo de Usuarios y Autenticación
    User {
        uuid id PK
        string email UK
        string password_hash
        enum role "ADMIN, SELLER, CLIENT"
        string first_name
        string last_name
        datetime created_at
    }
    
    Address {
        uuid id PK
        uuid user_id FK
        string street
        string city
        string state
        string zip_code
        boolean is_default
    }

    %% Módulo de Catálogo
    Category {
        uuid id PK
        string name
        string slug UK
    }

    Product {
        uuid id PK
        uuid category_id FK
        string name
        string description
        string slug UK
        boolean is_active
    }

    ProductVariant {
        uuid id PK
        uuid product_id FK
        string size "ej. S, M, L, XL"
        string color "ej. Rojo, Azul"
        string sku UK
        decimal price "Permite sobreprecio por variante"
        int stock
        string image_url
    }

    %% Módulo de Carrito
    Cart {
        uuid id PK
        uuid user_id FK "UK - 1 a 1"
        datetime updated_at
    }

    CartItem {
        uuid id PK
        uuid cart_id FK
        uuid product_variant_id FK
        int quantity
    }

    %% Módulo de Pedidos y Soporte
    Order {
        uuid id PK
        uuid user_id FK
        uuid shipping_address_id FK
        decimal total_amount
        enum status "PENDING, PAID, SHIPPED, DELIVERED, CANCELLED, REFUNDED"
        string tracking_number
        datetime created_at
    }

    OrderItem {
        uuid id PK
        uuid order_id FK
        uuid product_variant_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    OrderNote {
        uuid id PK
        uuid order_id FK
        uuid author_id FK "Vendedor o Admin"
        text content
        datetime created_at
    }

    %% Módulo de Inventario
    StockMovement {
        uuid id PK
        uuid product_variant_id FK
        uuid user_id FK "Admin que registró"
        int quantity "Positivo (entrada) o Negativo (salida)"
        enum type "PURCHASE, SALE, ADJUSTMENT, RETURN"
        string reason
        datetime created_at
    }

    %% Relaciones
    User ||--o{ Address : "tiene"
    User ||--o| Cart : "posee"
    User ||--o{ Order : "realiza"
    User ||--o{ OrderNote : "escribe"
    User ||--o{ StockMovement : "registra"

    Category ||--o{ Product : "agrupa"
    Product ||--|{ ProductVariant : "contiene"

    Cart ||--o{ CartItem : "contiene"
    ProductVariant ||--o{ CartItem : "añadida a"

    Order ||--|{ OrderItem : "compuesta por"
    ProductVariant ||--o{ OrderItem : "incluida en"
    Address ||--o{ Order : "enviado a"
    Order ||--o{ OrderNote : "tiene notas"

    ProductVariant ||--o{ StockMovement : "sufre cambios"