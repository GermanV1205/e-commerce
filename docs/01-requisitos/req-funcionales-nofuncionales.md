# Requerimientos del Sistema (E-commerce)

## 1. Requerimientos Funcionales (RF)
Son las funciones específicas que el sistema debe realizar para satisfacer las necesidades del negocio (basado en las Historias de Usuario).

* **RF01 - Autenticación y Autorización:** El sistema debe permitir el registro e inicio de sesión de usuarios, emitiendo tokens JWT (Access y Refresh). Debe restringir el acceso a rutas administrativas mediante validación de roles (Admin, Vendedor, Cliente).
* **RF02 - Gestión de Catálogo:** El sistema debe permitir la creación de productos con atributos complejos (categorías) y variantes (tallas, colores, stock individual y precio específico por variante).
* **RF03 - Carrito Persistente:** El sistema debe permitir almacenar el carrito de compras en la base de datos para usuarios autenticados, y en *Local Storage* para usuarios invitados.
* **RF04 - Flujo de Checkout y Pedidos:** El sistema debe procesar el checkout, descontar el inventario de manera transaccional (evitando sobreventas) y generar un ID de orden único.
* **RF05 - Panel Administrativo:** El sistema debe proveer una interfaz para que los administradores gestionen stock, actualicen el estado de los pedidos (Pendiente, Enviado, Entregado) y visualicen métricas de ventas.
* **RF06 - Auditoría y Notas:** El sistema debe registrar un historial de cambios en el stock y permitir al personal interno agregar notas privadas a los pedidos de los clientes.

## 2. Requerimientos No Funcionales (RNF)
Son los atributos de calidad, seguridad, desempeño y arquitectura que el sistema debe cumplir.

### 2.1. Seguridad
* **RNF01 - Encriptación:** Todas las contraseñas deben ser hasheadas usando `bcrypt` antes de almacenarse en PostgreSQL.
* **RNF02 - Protección de API:** La API en NestJS debe implementar `Rate-Limiting` para prevenir ataques de fuerza bruta, y configurar correctamente CORS y CSRF para peticiones desde el frontend (React).
* **RNF03 - Manejo de Tokens:** El *Access Token* (JWT) debe tener un tiempo de vida corto (ej. 15 min), mientras que el *Refresh Token* se almacenará de forma segura (HttpOnly Cookies) para mantener la sesión.

### 2.2. Desempeño y Escalabilidad
* **RNF04 - Tiempos de Respuesta:** Las consultas al catálogo público (lecturas) deben resolverse en menos de 2 segundos (<2s) en condiciones normales de red.
* **RNF05 - Optimización de Consultas:** Se debe utilizar Prisma ORM con cargas selectivas (*select/include*) para evitar el problema de consultas N+1, especialmente al cargar productos con múltiples variantes.
* **RNF06 - Carga de Imágenes:** Las imágenes de los productos deben almacenarse en un servicio compatible con S3 (ej. AWS S3, MinIO o Cloudinary), guardando únicamente la URL en la base de datos.

### 2.3. Arquitectura y Mantenibilidad
* **RNF07 - Modularidad (DDD Ligero):** El backend debe estructurarse en módulos independientes (Users, Products, Orders), aplicando inyección de dependencias y separando controladores, servicios y repositorios.
* **RNF08 - Despliegue en Contenedores:** Toda la infraestructura (Frontend, Backend, Base de Datos) debe estar contenerizada utilizando Docker, gestionada localmente mediante `docker-compose.yml`.
* **RNF09 - Calidad de Código:** El proyecto debe contar con linters (`ESLint`, `Prettier`), y mantener una cobertura de pruebas unitarias y de integración (Jest/Playwright) en flujos críticos como el Checkout.

### 2.4. Interfaz y Experiencia de Usuario (UX/UI)
* **RNF10 - Diseño Responsivo:** El frontend debe ser completamente utilizable en dispositivos móviles (*Mobile First*), tablets y pantallas de escritorio.
* **RNF11 - Accesibilidad:** La interfaz gráfica debe cumplir con las normativas básicas de accesibilidad WCAG nivel AA (contraste de colores, uso de etiquetas ARIA y navegación por teclado).