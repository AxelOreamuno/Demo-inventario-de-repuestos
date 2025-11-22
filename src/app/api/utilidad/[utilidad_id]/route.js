import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { utilidad_id } = params;

    const utilidad = await conn.query(
      "SELECT utilidad_id FROM Utilidad WHERE utilidad_id = ? AND activo = TRUE",
      [utilidad_id]
    );

    if (utilidad.length === 0) {
      return NextResponse.json(
        { message: "Utilidad no encontrada o ya está inactiva" },
        { status: 404 }
      );
    }

    await conn.query(
      "UPDATE Utilidad SET activo = ? WHERE utilidad_id = ?",
      [0, utilidad_id]
    );

    return new Response(null, { status: 204 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al desactivar la utilidad" },
      { status: 500 }
    );
  }
}
