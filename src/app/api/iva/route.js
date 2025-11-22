import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query("SELECT * FROM Iva WHERE activo = TRUE");
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los IVAs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { tasa } = await request.json();

    if (tasa === undefined || tasa === null || tasa === '') {
      return NextResponse.json(
        { message: "La tasa de IVA es requerida" },
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
      "SELECT * FROM Iva WHERE tasa = ? AND activo = TRUE",
      [tasaNum]
    );

    if (duplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe un IVA con esta tasa" },
        { status: 409 }
      );
    }

    const result = await conn.query(
      "INSERT INTO Iva (tasa) VALUES (?)",
      [tasaNum]
    );

    return NextResponse.json({
      tasa: tasaNum,
      id: result.insertId
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear el IVA" },
      { status: 500 }
    );
  }
}