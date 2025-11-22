import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    
    const ivaId = parseInt(params.iva_id);
    
    if (isNaN(ivaId)) {
      return NextResponse.json(
        { message: "ID de IVA inválido" },
        { status: 400 }
      );
    }

    const ivaExiste = await conn.query(
      "SELECT iva_id FROM Iva WHERE iva_id = ? AND activo = TRUE",
      [ivaId]
    );

    if (ivaExiste.length === 0) {
      return NextResponse.json(
        { message: "IVA no encontrado o ya está inactivo" },
        { status: 404 }
      );
    }

    const productosConIva = await conn.query(
      "SELECT COUNT(*) as total FROM Productos WHERE ivaP_id = ?",
      [ivaId]
    );

    if (productosConIva[0].total > 0) {
      return NextResponse.json(
        { 
          message: "No se puede eliminar. Hay productos asociados a este IVA",
          productos_asociados: productosConIva[0].total
        },
        { status: 409 }
      );
    }

    await conn.query(
      "UPDATE Iva SET activo = ? WHERE iva_id = ?",
      [false, ivaId]
    );

    return new Response(null, { status: 204 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al eliminar el IVA" },
      { status: 500 }
    );
  }
}