import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalProductsResult = await conn.query(
      "SELECT COUNT(*) AS totalProducts FROM Productos"
    );

    const totalProducts = totalProductsResult[0]?.totalProducts ?? 0;

    return NextResponse.json({
      success: true,
      data: { totalProducts }
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener el total de productos"
      },
      { status: 500 }
    );
  }
}
