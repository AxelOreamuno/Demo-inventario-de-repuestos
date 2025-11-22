import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const facturaId = parseInt(params.factura_id);
    
    if (isNaN(facturaId)) {
      return NextResponse.json(
        { message: "ID de factura inválido" },
        { status: 400 }
      );
    }

    const result = await conn.query(
      "SELECT * FROM DetalleFacturasCompra WHERE factura_id = ?",
      [facturaId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Factura no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los detalles de la factura" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { factura, detalles } = await request.json();

    if (!factura) {
      return NextResponse.json(
        { message: "Los datos de la factura son requeridos" },
        { status: 400 }
      );
    }

    if (!factura.fecha || !factura.total || !factura.proveedor_id) {
      return NextResponse.json(
        { message: "Faltan campos requeridos en la factura (fecha, total, proveedor_id)" },
        { status: 400 }
      );
    }

    const total = parseFloat(factura.total);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json(
        { message: "El total debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json(
        { message: "Debe incluir al menos un detalle de factura" },
        { status: 400 }
      );
    }

    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      
      if (!detalle.nombreProducto || detalle.nombreProducto.trim() === '') {
        return NextResponse.json(
          { message: `Detalle ${i + 1}: El nombre del producto es requerido` },
          { status: 400 }
        );
      }

      const cantidad = parseFloat(detalle.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        return NextResponse.json(
          { message: `Detalle ${i + 1}: La cantidad debe ser un número mayor a 0` },
          { status: 400 }
        );
      }

      const precioCompra = parseFloat(detalle.precio_compra);
      if (isNaN(precioCompra) || precioCompra < 0) {
        return NextResponse.json(
          { message: `Detalle ${i + 1}: El precio de compra debe ser un número mayor o igual a 0` },
          { status: 400 }
        );
      }
    }

    const proveedorExiste = await conn.query(
      "SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?",
      [factura.proveedor_id]
    );

    if (proveedorExiste.length === 0) {
      return NextResponse.json(
        { message: "El proveedor especificado no existe" },
        { status: 400 }
      );
    }

    await conn.query("START TRANSACTION");

    try {

      const facturaResult = await conn.query(
        "INSERT INTO FacturasCompra (fecha, total, proveedor_id, codigoFactura) VALUES (?, ?, ?, ?)",
        [factura.fecha, total, factura.proveedor_id, factura.codigoFactura || null]
      );

      const facturaId = facturaResult.insertId;

      for (const detalle of detalles) {
        await conn.query(
          "INSERT INTO DetalleFacturasCompra (factura_id, nombreProducto, cantidad, precio_compra) VALUES (?, ?, ?, ?)",
          [
            facturaId,
            detalle.nombreProducto.trim(),
            parseFloat(detalle.cantidad),
            parseFloat(detalle.precio_compra)
          ]
        );
      }

      await conn.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Factura y detalles insertados correctamente",
        data: {
          facturaId: facturaId,
          detalles_insertados: detalles.length
        }
      });

    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }

  } catch (error) {
    return NextResponse.json(
      { message: "Error al procesar la factura" },
      { status: 500 }
    );
  }
}