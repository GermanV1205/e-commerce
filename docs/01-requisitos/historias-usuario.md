### Módulo 1: Clientes y Autenticación (Usuarios y Roles)
*Este módulo es crucial para la seguridad (JWT) y para diferenciar si quien entra es tu mamá (Admin), un vendedor, o un cliente.*

#### Historia de Usuario 1 (HU01): Registro de Clientes
* **Como** cliente nuevo,
* **Quiero** registrarme en la plataforma usando mi correo electrónico y una contraseña segura,
* **Para** tener un perfil donde pueda ver mi historial de compras y guardar mis direcciones.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que soy un visitante en la página de registro,
  * **When** ingreso un correo válido y una contraseña que cumpla las políticas de seguridad (ej. 8 caracteres, números, símbolos),
  * **Then** el sistema crea mi cuenta, encripta mi contraseña (bcrypt), me envía un correo de bienvenida y me redirige al catálogo.

#### Historia de Usuario 2 (HU02): Inicio de Sesión basado en Roles
* **Como** usuario registrado (Cliente, Vendedor o Administrador),
* **Quiero** iniciar sesión con mis credenciales,
* **Para** acceder a las funcionalidades correspondientes a mi rol.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy en la pantalla de Login,
  * **When** ingreso mis credenciales correctas,
  * **Then** el backend valida los datos, genera los tokens JWT (Access y Refresh), y el frontend me redirige: si soy Administrador al Dashboard interno, y si soy Cliente a la página principal.


### Módulo 2: Catálogo y Variantes
*Aquí entra la complejidad del e-commerce de ropa: una misma blusa puede tener distintas tallas y colores, y cada variante puede tener un stock distinto.*

#### Historia de Usuario 3 (HU03): Exploración del Catálogo de Ropa
* **Como** cliente potencial,
* **Quiero** ver el catálogo de prendas filtrable por categorías (ej. Blusas, Pantalones, Vestidos),
* **Para** encontrar fácilmente la ropa que me interesa comprar.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que ingreso a la tienda online,
  * **When** selecciono la categoría "Vestidos",
  * **Then** el sistema carga la lista de productos de esa categoría en menos de 2 segundos (<2s desempeño), mostrando la imagen principal, el nombre y el precio base.

#### Historia de Usuario 4 (HU04): Visualización de Variantes (Tallas y Colores)
* **Como** cliente interesado en una prenda,
* **Quiero** seleccionar el color y la talla específica antes de agregarla al carrito,
* **Para** asegurarme de que pido exactamente lo que me queda bien y verificar si hay inventario.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy en la página de detalles de una "Chaqueta de Cuero",
  * **When** selecciono el color "Negro" y la talla "M",
  * **Then** el sistema actualiza la imagen de la prenda al color negro, me muestra el precio específico de esa variante y me indica si está "En Stock" o "Agotado".

#### Historia de Usuario 5 (HU05): Gestión de Productos (Vista Admin/Mamá)
* **Como** administrador de la tienda,
* **Quiero** crear, editar y eliminar prendas de ropa junto con sus variantes,
* **Para** mantener el catálogo actualizado según la mercadería que llega a la tienda física.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que tengo sesión iniciada como Administrador,
  * **When** lleno el formulario de "Nuevo Producto", añado imágenes (que se subirán al storage S3) y defino las variantes (Talla S/M/L, colores),
  * **Then** el sistema guarda el producto en la base de datos de PostgreSQL y lo hace visible inmediatamente en el frontend público.


  ### Módulo 3: Carrito de Compras y Checkout
*Este módulo gestiona la intención de compra del cliente y el proceso de recolección de datos para el pago y envío.*

#### Historia de Usuario 6 (HU06): Agregar productos al carrito
* **Como** cliente (autenticado o invitado),
* **Quiero** agregar prendas específicas (talla y color) a mi carrito de compras,
* **Para** agrupar los artículos que deseo comprar antes de pagar.

* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy viendo el detalle de un producto con stock disponible,
  * **When** selecciono la talla, el color y la cantidad, y presiono "Agregar al carrito",
  * **Then** el sistema añade el ítem al carrito, actualiza el contador de artículos en la barra de navegación y me muestra una notificación de éxito.
  * **And** si soy un usuario autenticado, el carrito se guarda en la base de datos (PostgreSQL) para persistir entre sesiones; si soy invitado, se guarda en el *Local Storage*.

#### Historia de Usuario 7 (HU07): Gestión del Carrito
* **Como** cliente con artículos en el carrito,
* **Quiero** ver el resumen de mi carrito, modificar cantidades o eliminar productos,
* **Para** tener control sobre mi compra antes de proceder al pago.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que accedo a la vista de "Mi Carrito",
  * **When** cambio la cantidad de un ítem a "0" o presiono el botón de "Eliminar",
  * **Then** el sistema remueve el ítem, recalcula el subtotal, los impuestos y el total en tiempo real.
  * **And** valida automáticamente si la nueva cantidad solicitada supera el stock actual, mostrando un mensaje de error si es así.

#### Historia de Usuario 8 (HU08): Proceso de Checkout (Pago y Envío)
* **Como** cliente listo para comprar,
* **Quiero** ingresar mi dirección de envío y seleccionar un método de pago,
* **Para** finalizar mi compra de forma segura.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que presiono "Proceder al pago" en el carrito,
  * **When** completo el formulario de dirección de envío y selecciono el método de pago (ej. Transferencia bancaria o Tarjeta simulada),
  * **Then** el sistema genera un resumen final del pedido con los costos de envío calculados.
  * **And** al confirmar, el sistema vacía el carrito, descuenta el stock de manera transaccional y genera un número de orden único.


### Módulo 4: Pedidos y Devoluciones
*Este módulo permite el seguimiento post-venta tanto para el cliente como para la administración de la tienda.*

#### Historia de Usuario 9 (HU09): Historial y Seguimiento de Pedidos (Cliente)
* **Como** cliente registrado,
* **Quiero** ver una lista de mis pedidos anteriores y su estado actual,
* **Para** saber cuándo llegará mi ropa o revisar qué he comprado en el pasado.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que navego a la sección "Mis Pedidos" en mi perfil,
  * **When** la página carga,
  * **Then** veo una lista ordenada por fecha descendente de mis órdenes, mostrando el ID del pedido, fecha, total y estado actual (Pendiente, Procesando, Enviado, Entregado, Cancelado).

#### Historia de Usuario 10 (HU10): Gestión de Pedidos (Admin/Vendedor)
* **Como** administrador o vendedor,
* **Quiero** ver todos los pedidos entrantes y poder actualizar su estado,
* **Para** gestionar la logística de empaque y envío a los clientes.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que accedo al panel de administración en la sección de "Pedidos",
  * **When** selecciono un pedido con estado "Pendiente" y lo cambio a "Enviado" añadiendo un número de guía de paquetería,
  * **Then** el sistema actualiza el estado en la base de datos.
  * **And** dispara un evento asíncrono para enviar un correo electrónico al cliente notificando que su pedido está en camino con su número de guía.

#### Historia de Usuario 11 (HU11): Solicitud de Devolución
* **Como** cliente insatisfecho o con problemas de talla,
* **Quiero** solicitar la devolución de un producto específico de mi pedido,
* **Para** recibir un reembolso o un cambio de talla.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy viendo el detalle de un pedido con estado "Entregado" (hace menos de 15 días),
  * **When** presiono "Solicitar Devolución", selecciono el ítem y escribo el motivo,
  * **Then** el sistema crea un ticket de devolución con estado "Pendiente de revisión" y notifica al panel de administración para su aprobación.


  ### Módulo 5: Inventario y Compras (Ingreso de Mercadería)
*Este módulo permite controlar la entrada física de nuevas prendas a la tienda y la gestión de proveedores.*

#### Historia de Usuario 12 (HU12): Registro de Ingreso de Stock
* **Como** administrador de la tienda,
* **Quiero** registrar el ingreso de nueva mercadería para productos existentes (ej. llegaron 10 blusas rojas talla M),
* **Para** actualizar el stock disponible sin tener que crear el producto desde cero.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy en el panel de administración en la sección "Inventario",
  * **When** busco un producto existente, selecciono la variante específica y sumo "10" a la cantidad actual mediante un "Registro de Compra",
  * **Then** el sistema actualiza el stock total de esa variante.
  * **And** guarda un registro histórico (log) de la fecha, cantidad ingresada y el usuario que realizó el movimiento.

#### Historia de Usuario 13 (HU13): Alertas de Stock Bajo
* **Como** administrador o vendedor,
* **Quiero** visualizar visualmente qué productos o variantes están próximos a agotarse,
* **Para** saber qué prendas debo volver a comprar o pedir a los proveedores.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que ingreso al panel de administración,
  * **When** navego a la pestaña de "Alertas de Inventario",
  * **Then** veo una lista de las variantes cuyo stock es menor a 3 unidades (umbral configurable), resaltadas en color rojo o amarillo.


### Módulo 6: Administración, Reportes y Roles de Equipo
*Este módulo es el centro de control del negocio, vital para medir el éxito financiero y gestionar al personal.*

#### Historia de Usuario 14 (HU14): Dashboard de Ventas y KPIs
* **Como** dueño/administrador,
* **Quiero** ver un panel de control con indicadores clave (KPIs) como ingresos totales, productos más vendidos y tickets promedio,
* **Para** tomar decisiones informadas sobre el negocio basándome en datos reales.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que inicio sesión como Administrador,
  * **When** el sistema carga la pantalla principal (Dashboard),
  * **Then** visualizo gráficos de barras/líneas mostrando las ventas de los últimos 7, 30 o 90 días, generados a partir de consultas SQL optimizadas (agregaciones).

#### Historia de Usuario 15 (HU15): Gestión de Cuentas del Personal (Vendedores)
* **Como** administrador (SuperAdmin),
* **Quiero** crear, suspender o editar cuentas para los empleados de la tienda, asignándoles el rol de "Vendedor",
* **Para** que puedan gestionar pedidos sin tener acceso a reportes financieros o eliminación de catálogos.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy en la sección de "Equipo/Usuarios" del panel admin,
  * **When** creo una cuenta nueva con el rol de "Vendedor",
  * **Then** el sistema guarda el usuario en la base de datos.
  * **And** cuando ese usuario inicia sesión (JWT), el backend (NestJS) restringe mediante Guards/Decorators su acceso a rutas protegidas (ej. `/api/reports`).


### Módulo 7: Soporte y Notas Internas
*Este módulo facilita la comunicación asíncrona del equipo y el registro de incidencias con clientes.*

#### Historia de Usuario 16 (HU16): Notas Internas en Pedidos
* **Como** vendedor o administrador,
* **Quiero** dejar comentarios internos en la ficha de un pedido específico,
* **Para** registrar novedades (ej. "El cliente llamó para cambiar la dirección de envío", o "El empaque tiene una nota de regalo").
* **Criterios de Aceptación (Gherkin):**
  * **Given** que estoy revisando los detalles de la Orden #1045,
  * **When** escribo un texto en el área de "Notas Internas" y presiono guardar,
  * **Then** el sistema adjunta la nota al pedido con mi nombre de usuario y la marca de tiempo (timestamp).
  * **And** estas notas son invisibles para el cliente final en su portal.

#### Historia de Usuario 17 (HU17): Historial de Cliente
* **Como** equipo de soporte/ventas,
* **Quiero** ver el perfil detallado de un cliente, incluyendo todas sus compras, devoluciones y notas previas,
* **Para** brindar una atención personalizada y entender su comportamiento de compra.
* **Criterios de Aceptación (Gherkin):**
  * **Given** que busco a un cliente por su nombre o correo en el panel de administración,
  * **When** abro su perfil,
  * **Then** visualizo una línea de tiempo consolidada (timeline) extrayendo datos relacionales (Prisma) de sus Órdenes, Devoluciones y Notas.