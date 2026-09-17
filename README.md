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
