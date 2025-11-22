import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query(`
      SELECT 
        producto_id, 
        nombre, 
        stock, 
        precioVenta 
      FROM Productos 
      ORDER BY nombre ASC
    `);
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const ventas = await request.json();

    if (!Array.isArray(ventas)) {
      return NextResponse.json(
        { message: "El formato debe ser un array de ventas" },
        { status: 400 }
      );
    }

    if (ventas.length === 0) {
      return NextResponse.json(
        { message: "Debe enviar al menos una venta" },
        { status: 400 }
      );
    }

    for (let i = 0; i < ventas.length; i++) {
      const venta = ventas[i];
      
      const productoId = venta.productoId || venta.productId;
      
      if (!productoId) {
        return NextResponse.json(
          { message: `Venta ${i + 1}: El ID del producto es requerido` },
          { status: 400 }
        );
      }

      const cantidad = parseFloat(venta.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        return NextResponse.json(
          { message: `Venta ${i + 1}: La cantidad debe ser un número mayor a 0` },
          { status: 400 }
        );
      }
    }

    for (let i = 0; i < ventas.length; i++) {
      const venta = ventas[i];
      const productoId = venta.productoId || venta.productId;
      const cantidad = parseFloat(venta.cantidad);
      
      const producto = await conn.query(
        "SELECT producto_id, nombre, stock FROM Productos WHERE producto_id = ?",
        [productoId]
      );

      if (producto.length === 0) {
        return NextResponse.json(
          { message: `Producto con ID ${productoId} no existe` },
          { status: 400 }
        );
      }

      if (producto[0].stock < cantidad) {
        return NextResponse.json(
          { 
            message: `Stock insuficiente para ${producto[0].nombre}`,
            producto: producto[0].nombre,
            stock_disponible: producto[0].stock,
            cantidad_solicitada: cantidad
          },
          { status: 409 } // Conflict
        );
      }
    }

    await conn.query("START TRANSACTION");

    try {
      let productosActualizados = [];

      for (const venta of ventas) {
        const productoId = venta.productoId || venta.productId;
        const cantidad = parseFloat(venta.cantidad);
        
        await conn.query(
          "UPDATE Productos SET stock = stock - ? WHERE producto_id = ?",
          [cantidad, productoId]
        );

        productosActualizados.push({
          productoId: productoId,
          cantidad_vendida: cantidad
        });
      }

      await conn.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Stock actualizado correctamente",
        productos_actualizados: productosActualizados.length,
        detalles: productosActualizados
      });

    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }

  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar el stock" },
      { status: 500 }
    );
  }
}