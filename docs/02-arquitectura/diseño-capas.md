# Arquitectura del Sistema y Patrones de Diseño

El backend del E-commerce está diseñado sobre **NestJS**, utilizando una arquitectura modular basada en un enfoque de **Domain-Driven Design (DDD) ligero** y el patrón de **Arquitectura en Capas (Layered Architecture)**. Esto garantiza la separación de responsabilidades, facilita las pruebas unitarias y permite la escalabilidad del proyecto.

## 1. Diagrama de Arquitectura de Capas (Backend)

```mermaid
graph TD
    Client[Cliente: React / Navegador / Postman] -->|HTTP / REST| API[Capa de Presentación - Controllers]
    
    subgraph NestJS Backend
        API -->|DTOs / Validaciones| Services[Capa de Negocio - Services]
        Services -->|Lógica de Dominio| Core[Capa de Dominio - Entidades / Interfaces]
        Services -->|Consultas ORM| DataAccess[Capa de Acceso a Datos - Prisma Repository]
    end
    
    DataAccess -->|TCP / IP| DB[(PostgreSQL)]
    Services -->|AWS SDK| S3[Storage: S3 / Cloudinary]