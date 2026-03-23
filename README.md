# Shopping Cart Service

Microservicio para la gestión de carritos de compra persistentes antes de la creación de un pedido oficial.

## 📋 Características
-   🛒 **Persistencia**: Los carritos se almacenan en caché para acceso ultra rápido.
-   🔄 **Sincronización**: Informa cambios de stock mediante mensajería.

## 🛠️ Tecnologías
-   NestJS
-   TypeScript
-   Redis
-   RabbitMQ

## 🚀 Configuración
1.  **Variables de Entorno**:
    ```bash
    cp .env.example .env
    ```
2.  **Instalación**:
    ```bash
    pnpm install
    ```
3.  **Ejecución**:
    ```bash
    pnpm run start:dev
    ```

## 📡 Patrones de Mensajería
-   `get_cart`: Obtiene el carrito actual de un usuario.
-   `update_cart`: Agrega o modifica items en el carrito.
-   `clear_cart`: Limpia el carrito tras completar un pedido.
