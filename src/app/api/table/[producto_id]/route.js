import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { producto_id } = params;

    const producto = await conn.query(
      "SELECT producto_id FROM Productos WHERE producto_id = ?",
      [producto_id]
    );

    if (producto.length === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    await conn.query(
      "DELETE FROM Productos WHERE producto_id = ?",
      [producto_id]
    );

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    return new Response(null, { status: 204 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { producto_id } = params;
    const { codigo, nombre, stock, proveedor_id, categoria_id } = await request.json();

    if (!codigo || !nombre || !proveedor_id || !categoria_id) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (codigo.trim() === '' || nombre.trim() === '') {
      return NextResponse.json(
        { message: "El código y nombre no pueden estar vacíos" },
        { status: 400 }
      );
    }

    const stockNum = parseFloat(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { message: "El stock debe ser un número mayor o igual a 0" },
        { status: 400 }
      );
    }

    const productoExiste = await conn.query(
      "SELECT producto_id FROM Productos WHERE producto_id = ?",
      [producto_id]
    );

    if (productoExiste.length === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const codigoDuplicado = await conn.query(
      "SELECT producto_id FROM Productos WHERE codigo = ? AND producto_id != ?",
      [codigo.trim(), producto_id]
    );

    if (codigoDuplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe otro producto con este código" },
        { status: 409 }
      );
    }

    const [proveedor, categoria] = await Promise.all([
      conn.query("SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?", [proveedor_id]),
      conn.query("SELECT categoria_id FROM Categorias WHERE categoria_id = ?", [categoria_id])
    ]);

    if (proveedor.length === 0) {
      return NextResponse.json(
        { message: "El proveedor no existe" },
        { status: 400 }
      );
    }

    if (categoria.length === 0) {
      return NextResponse.json(
        { message: "La categoría no existe" },
        { status: 400 }
      );
    }

    await conn.query(
      `UPDATE Productos 
       SET codigo = ?, nombre = ?, stock = ?, proveedorP_id = ?, categoriaP_id = ?
       WHERE producto_id = ?`,
      [codigo.trim(), nombre.trim(), stockNum, proveedor_id, categoria_id, producto_id]
    );

    const updatedList = await conn.query(`
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

    return NextResponse.json(updatedList);

  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}