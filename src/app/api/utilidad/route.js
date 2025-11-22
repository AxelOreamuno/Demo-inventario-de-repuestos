import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { tasa } = await request.json();

    if (tasa === undefined || tasa === null) {
      return NextResponse.json(
        { message: "La tasa es requerida" },
        { status: 400 }
      );
    }

    const tasaNum = parseFloat(tasa);
    if (isNaN(tasaNum)) {
      return NextResponse.json(
        { message: "La tasa debe ser un número válido" },
        { status: 400 }
      );
    }

    if (tasaNum < 0 || tasaNum > 100) {
      return NextResponse.json(
        { message: "La tasa debe estar entre 0 y 100" },
        { status: 400 }
      );
    }

    const duplicado = await conn.query(
      "SELECT utilidad_id FROM Utilidad WHERE tasa = ? AND activo = TRUE",
      [tasaNum]
    );

    if (duplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe una utilidad con esta tasa" },
        { status: 409 }
      );
    }

    const result = await conn.query(
      "INSERT INTO Utilidad (tasa) VALUES (?)",
      [tasaNum]
    );

    return NextResponse.json({
      success: true,
      tasa: tasaNum,
      id: result.insertId,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear la utilidad" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {

    const results = await conn.query("SELECT * FROM Utilidad WHERE activo = TRUE");

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