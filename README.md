# Ecommerce

### 1. Resumen Ejecutivo y Alcance
El proyecto consiste en el desarrollo end-to-end de una plataforma de comercio electrónico modular orientada a una boutique de ropa. La solución no solo facilitará la experiencia de compra B2C, sino que proveerá un panel de administración integral para gestionar la complejidad del inventario físico (tallas, colores, stock) y el seguimiento de ventas. Su diseño basado en un DDD ligero y su despliegue mediante contenedores garantizarán una alta disponibilidad y servirán como una pieza de grado profesional para tu portafolio.

### 2. Actores y Metas
* **Cliente Final:** Su meta es explorar el catálogo con alta velocidad de respuesta (<2s), gestionar su carrito de forma persistente y completar procesos de checkout intuitivos y seguros.
* **Administrador (Dueño):** Requiere control total sobre el negocio, incluyendo la creación de productos, asignación de roles, revisión de reportes de ventas y auditoría de inventario.
* **Vendedor/Operador:** Necesita herramientas rápidas para procesar pedidos entrantes, aprobar devoluciones, consultar stock en tiempo real y dejar notas de soporte interno.
* **Sistema Automático:** Encargado de la infraestructura en segundo plano, ejecutando respaldos de la base de datos, invalidando tokens JWT y limpiando carritos abandonados.

### 3. Plan de Acción (Semanas 1-10)
Para mantener un ritmo metódico y asegurar entregables claros semana a semana, seguiremos este cronograma macro:

* **Semanas 1-2:** Requerimientos (Gherkin), diseño de arquitectura por capas, modelado de Base de Datos (ER) y configuración inicial de infraestructura local (Docker Compose).

* **Semanas 3-4:** Core del Backend (NestJS), Autenticación segura (Access/Refresh JWT), gestión de Usuarios, Roles y el módulo de Catálogo.

* **Semanas 5-6:** Lógica de Carrito, flujos de Checkout, Pedidos, e integración del servicio de storage compatible con S3 para imágenes.

* **Semanas 7-8:** Consumo de APIs en Frontend (React/Vite), desarrollo de pantallas responsivas y el Panel de Administración.

* **Semanas 9-10:** Cobertura de pruebas (Jest/Playwright), pipelines de CI/CD en GitHub Actions, métricas de observabilidad y documentación técnica final.

1. Diccionario de Datos (Entidades Clave)
User (Usuarios): Centraliza el acceso. El campo role permite aislar los permisos mediante Guards en NestJS.

Product & ProductVariant: Arquitectura clave para ropa. Product guarda la información general (ej. "Camiseta Básica"), mientras que ProductVariant guarda la combinación física exacta (ej. "Talla M, Color Blanco") con su propio inventario (stock) y código de barras/identificador (sku).

Cart & CartItem: Persistencia del carrito. Si el usuario abandona la sesión, al volver a loguearse su carrito sigue intacto.

Order & OrderItem: Registro inmutable. OrderItem copia el unit_price en el momento de la compra para que si el producto cambia de precio en el futuro, el histórico del pedido no se altere.

StockMovement: Tabla de auditoría (Kardex). Cada vez que entra mercadería (tu mamá compra más ropa) o sale (venta o ajuste por defecto), se inserta un registro aquí. Esto permite rastrear faltantes y generar reportes financieros.

OrderNote: Comunicación interna. Permite al personal de soporte dejar anotaciones que el cliente no ve.

2. Descripción de las Capas
2.1. Capa de Presentación (Controllers)
Responsabilidad: Manejar las peticiones HTTP (GET, POST, PUT, DELETE), gestionar los códigos de estado, interceptar errores a nivel de red y retornar las respuestas al cliente.

Implementación: Controladores de NestJS (@Controller()).

Validación: Uso de class-validator y class-transformer mediante DTOs (Data Transfer Objects) para asegurar que la data entrante sea correcta antes de tocar la lógica de negocio.

2.2. Capa de Lógica de Negocio (Services)
Responsabilidad: Contiene el "Core" del e-commerce. Aquí se toman decisiones (ej. verificar si hay stock antes de crear un pedido, calcular el total del carrito, hashear contraseñas).

Implementación: Proveedores inyectables de NestJS (@Injectable()).

Regla estricta: Un servicio nunca debe interactuar directamente con el objeto Request o Response de HTTP. Todo entra y sale como parámetros y retornos puros.

2.3. Capa de Acceso a Datos (Prisma / Repositories)
Responsabilidad: Abstraer las consultas directas a la base de datos PostgreSQL.

Implementación: Prisma ORM actúa como nuestro Data Mapper y Query Builder. NestJS interactuará con Prisma a través de un PrismaService global.

3. Modularidad (DDD Ligero)
Para mantener el código ordenado, el proyecto no estará agrupado por su tipo de archivo (todos los controllers juntos), sino por su Dominio de Negocio (Contextos Delimitados).

Estructura de carpetas en src/:

/auth: Lógica de JWT, Guards, Strategies de login.

/users: Gestión de perfiles, roles y direcciones.

/catalog: Productos, Categorías y Variantes (Tallas/Colores).

/orders: Carrito, Checkout, Pedidos e Historial.

/inventory: Movimientos de stock (Kardex).

/common: Excepciones globales, decoradores personalizados e interceptores.

4. Patrones de Diseño Aplicados
Inyección de Dependencias (DI): Manejado nativamente por el contenedor de IoC de NestJS para acoplamiento débil.

Singleton: El servicio de conexión a base de datos (PrismaService) existirá como una única instancia compartida.

Repository (Abstracción): Prisma encapsula la complejidad de SQL, permitiendo tratar la base de datos como una colección de objetos.

Guard / Interceptor Pattern: Uso de Guards en NestJS para la autorización (roles) y validación de tokens JWT en rutas protegidas.