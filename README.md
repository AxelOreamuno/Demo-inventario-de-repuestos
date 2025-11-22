# 🏪 Sistema de Gestión de Inventario - Eligam

Sistema web completo para control de inventario empresarial con carga automática de facturas XML, desarrollado como solución real para optimizar la gestión de productos y proveedores.

---

## 🚀 Demo en Vivo
[Ver Demo →](#)  

**Credenciales de prueba:**  
- **Email:** demo@gmail.com  
- **Contraseña:** prueba

---

## ✨ Características Principales

- 📄 **Carga automática de facturas XML**: Parseo e importación masiva de productos desde facturas electrónicas.  
- 📦 **Gestión completa de inventario**: Control de productos, stock y movimientos.  
- 👥 **Gestión de proveedores**: Administración centralizada de información de proveedores.  
- 📊 **Dashboard con estadísticas**: Visualización en tiempo real de métricas clave.  
- 🔐 **Autenticación segura**: Sistema de login con NextAuth y encriptación bcrypt.  
- 📱 **Diseño responsivo**: Interfaz adaptable a dispositivos móviles y tablets.  
- 📈 **Historial de movimientos**: Trazabilidad completa de entradas y salidas.  
- 🔄 **Gestión de movimientos**: Registro de entradas, salidas y ajustes de inventario.  
- 📋 **Control de repuestos**: Sistema especializado para gestión de repuestos automotrices.

---

## 🛠️ Stack Tecnológico

**Frontend:**  
- Framework: Next.js 14 (App Router)  
- UI Library: React 18  
- Estilos: TailwindCSS  
- Componentes: Componentes personalizados + Headless UI  

**Backend:**  
- API: Next.js API Routes  
- ORM: Conexión directa con MySQL  
- Autenticación: NextAuth.js  
- Seguridad: bcrypt para hash de contraseñas  

**Base de Datos:**  
- DBMS: MySQL 8.0  
- Hosting: Aiven Cloud  
- Modelado: Base de datos relacional normalizada  

**Deployment:**  
- Frontend/Backend: Vercel  
- Base de Datos: Aiven (MySQL Cloud)  
- CI/CD: GitHub + Vercel (deploy automático)  

**Herramientas Adicionales:**  
- Procesamiento XML: Custom parser para facturas electrónicas costarricenses  
- Validación: Validación de formularios del lado cliente y servidor  
- Manejo de estado: React Hooks (`useState`, `useEffect`, `useContext`)  

---

## 📸 Capturas de Pantalla

**Dashboard Principal**  
Vista general con estadísticas en tiempo real  

**Gestión de Productos**  
Listado y administración de productos  

**Carga de Facturas XML**  
Importación automática desde facturas electrónicas
