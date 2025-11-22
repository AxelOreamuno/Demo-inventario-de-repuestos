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
    const {
      codigo,
      nombre,
      precioVenta,
      stock,
      proveedorP_id,
      categoriaP_id,
      ivaP_id,
      utilidadP_id
    } = await request.json();

    if (!codigo || !nombre || !proveedorP_id || !categoriaP_id || !ivaP_id || !utilidadP_id) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (codigo.trim() === '') {
      return NextResponse.json(
        { message: "El código no puede estar vacío" },
        { status: 400 }
      );
    }

    if (nombre.trim() === '') {
      return NextResponse.json(
        { message: "El nombre no puede estar vacío" },
        { status: 400 }
      );
    }

    const precio = parseFloat(precioVenta);
    if (isNaN(precio) || precio < 0) {
      return NextResponse.json(
        { message: "El precio debe ser un número mayor o igual a 0" },
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

    const codigoDuplicado = await conn.query(
      "SELECT producto_id FROM Productos WHERE codigo = ?",
      [codigo.trim()]
    );

    if (codigoDuplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe un producto con este código" },
        { status: 409 }
      );
    }

    const [proveedor, categoria, iva, utilidad] = await Promise.all([
      conn.query("SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?", [proveedorP_id]),
      conn.query("SELECT categoria_id FROM Categorias WHERE categoria_id = ?", [categoriaP_id]),
      conn.query("SELECT iva_id FROM Iva WHERE iva_id = ?", [ivaP_id]),
      conn.query("SELECT utilidad_id FROM Utilidad WHERE utilidad_id = ?", [utilidadP_id])
    ]);

    if (proveedor.length === 0) {
      return NextResponse.json({ message: "El proveedor no existe" }, { status: 400 });
    }
    if (categoria.length === 0) {
      return NextResponse.json({ message: "La categoría no existe" }, { status: 400 });
    }
    if (iva.length === 0) {
      return NextResponse.json({ message: "El IVA no existe" }, { status: 400 });
    }
    if (utilidad.length === 0) {
      return NextResponse.json({ message: "La utilidad no existe" }, { status: 400 });
    }

    const result = await conn.query("INSERT INTO Productos SET ?", {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      precioVenta: precio,
      stock: stockNum,
      proveedorP_id,
      categoriaP_id,
      ivaP_id,
      utilidadP_id
    });

    return NextResponse.json({
      success: true,
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      precioVenta: precio,
      stock: stockNum,
      proveedorP_id,
      categoriaP_id,
      ivaP_id,
      utilidadP_id,
      id: result.insertId
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear el producto" },
      { status: 500 }
    );
  }
}