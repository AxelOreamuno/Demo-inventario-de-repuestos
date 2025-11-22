import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const results = await conn.query("SELECT * FROM RegistroInventario");
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const {
      productoR_id,
      fecha,
      tipo_operacion,
      cantidad,
      nombre,
    } = await request.json();

    const result = await conn.query("INSERT INTO RegistroInventario SET ?", {
      productoR_id,
      fecha,
      tipo_operacion,
      cantidad,
      nombre,
    });
    return NextResponse.json({
      success: true,
      productoR_id,
      fecha,
      tipo_operacion,
      cantidad,
      nombre,
      id: result.insertId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
