import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query(`
      SELECT
        p.producto_id,
        p.codigo,
        p.nombre,
        p.precioVenta,
        p.stock,
        pr.nombre AS proveedor_nombre,
        c.nombre_categoria AS categoria_nombre
      FROM Productos AS p
      LEFT JOIN Proveedores AS pr ON p.proveedorP_id = pr.proveedor_id
      LEFT JOIN Categorias AS c ON p.categoriaP_id = c.categoria_id
      ORDER BY p.nombre ASC
    `);
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const productos = await request.json();

    if (!Array.isArray(productos)) {
      return NextResponse.json(
        { message: "El formato debe ser un array de productos" },
        { status: 400 }
      );
    }

    if (productos.length === 0) {
      return NextResponse.json(
        { message: "Debe enviar al menos un producto" },
        { status: 400 }
      );
    }

    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      
      if (!producto.codigo || producto.codigo.trim() === '') {
        return NextResponse.json(
          { message: `Producto ${i + 1}: El código es requerido` },
          { status: 400 }
        );
      }

      if (!producto.nombre || producto.nombre.trim() === '') {
        return NextResponse.json(
          { message: `Producto ${i + 1}: El nombre es requerido` },
          { status: 400 }
        );
      }

      const precioVenta = parseFloat(producto.precioVenta);
      if (isNaN(precioVenta) || precioVenta < 0) {
        return NextResponse.json(
          { message: `Producto ${i + 1}: El precio debe ser un número válido mayor o igual a 0` },
          { status: 400 }
        );
      }

      const stock = parseFloat(producto.stock);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { message: `Producto ${i + 1}: El stock debe ser un número válido mayor o igual a 0` },
          { status: 400 }
        );
      }

      if (!producto.proveedorP_id || !producto.categoriaP_id || !producto.ivaP_id || !producto.utilidadP_id) {
        return NextResponse.json(
          { message: `Producto ${i + 1}: Faltan campos requeridos (proveedor, categoría, IVA o utilidad)` },
          { status: 400 }
        );
      }
    }

    const proveedorIds = [...new Set(productos.map(p => p.proveedorP_id))];
    const categoriaIds = [...new Set(productos.map(p => p.categoriaP_id))];

    const proveedoresExistentes = await conn.query(
      `SELECT proveedor_id FROM Proveedores WHERE proveedor_id IN (?)`,
      [proveedorIds]
    );

    const categoriasExistentes = await conn.query(
      `SELECT categoria_id FROM Categorias WHERE categoria_id IN (?)`,
      [categoriaIds]
    );

    if (proveedoresExistentes.length !== proveedorIds.length) {
      return NextResponse.json(
        { message: "Uno o más proveedores no existen" },
        { status: 400 }
      );
    }

    if (categoriasExistentes.length !== categoriaIds.length) {
      return NextResponse.json(
        { message: "Una o más categorías no existen" },
        { status: 400 }
      );
    }

    const codigos = productos.map(p => p.codigo);
    const productosExistentes = await conn.query(
      "SELECT codigo FROM Productos WHERE codigo IN (?)",
      [codigos]
    );

    const mapaProductosExistentes = new Set(
      productosExistentes.map(p => p.codigo)
    );

    await conn.query("START TRANSACTION");

    try {
      let creados = 0;
      let actualizados = 0;

      for (const producto of productos) {
        const { codigo, nombre, precioVenta, stock, proveedorP_id, categoriaP_id, ivaP_id, utilidadP_id } = producto;

        if (mapaProductosExistentes.has(codigo)) {
          await conn.query(
            "UPDATE Productos SET stock = stock + ? WHERE codigo = ?",
            [stock, codigo]
          );
          actualizados++;
        } else {
          await conn.query(
            "INSERT INTO Productos (codigo, nombre, precioVenta, stock, proveedorP_id, categoriaP_id, ivaP_id, utilidadP_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [codigo, nombre, precioVenta, stock, proveedorP_id, categoriaP_id, ivaP_id, utilidadP_id]
          );
          creados++;
        }
      }
      await conn.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Operación completada correctamente",
        productos_creados: creados,
        productos_actualizados: actualizados
      });

    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }

  } catch (error) {
    return NextResponse.json(
      { message: "Error al procesar los productos" },
      { status: 500 }
    );
  }
}