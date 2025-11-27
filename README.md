# 🏪 Sistema de Gestión de Inventario - Demo
- 👤 **Autor:** [Axel Oreamuno](https://github.com/AxelOreamuno)

---
Sistema web completo para control de inventario empresarial con carga automática de 
facturas XML, desarrollado como solución freelance real para optimizar la gestión de 
productos y proveedores.


> **Nota:** Esta es una versión demo del proyecto original (Junio 2024 - Noviembre 2024), 
> con ajustes para despliegue público y exclusión del módulo de usuarios por privacidad.
> 
> Este sistema está enfocado en inventario y control de repuestos; no incluye módulo de ventas.

---

## 🚀 Demo en Vivo
[Ver Demo →] https://demo-inventario-de-repuestos.vercel.app

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
- 📈 **Historial de movimientos**: Trazabilidad completa de entradas y salidas.  
- 🔄 **Gestión de movimientos**: Registro de entradas, salidas y ajustes de inventario.  
- 📋 **Control de repuestos**: Sistema especializado para gestión de repuestos automotrices.
- 🖨️ **Exportación a PDF**: Generación automática de reportes PDF del inventario.

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

### Login
<img width="1352" height="712" alt="image" src="https://github.com/user-attachments/assets/4184b4f0-565f-45c2-b3f1-622614832bbc" />

### Dashboard principal
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/0e838916-9d82-4c05-83d5-10e61d54d962" />

### Inventario de productos
<img width="1900" height="913" alt="image" src="https://github.com/user-attachments/assets/e2bb0f48-de74-44d7-aacc-990bec1b473e" />

### Factura XML procesada
<img width="1904" height="919" alt="image" src="https://github.com/user-attachments/assets/4263d935-76cc-41ca-b8b8-12c4d22ba771" />

### Movimientos de facturas ingresas con los productos ingresados
<img width="1904" height="916" alt="image" src="https://github.com/user-attachments/assets/eceb3531-0ddb-44a5-90af-3feb267abb24" />


**Funcionalidades destacadas para explorar:**
- Dashboard con estadísticas en tiempo real
- Gestión completa de productos y proveedores
- Carga automática de facturas XML
- Historial de movimientos con filtros
