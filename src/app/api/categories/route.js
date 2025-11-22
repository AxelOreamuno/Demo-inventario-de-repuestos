import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query(
      "SELECT categoria_id, nombre_categoria FROM Categorias ORDER BY nombre_categoria ASC"
    );
    
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });
    
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener las categorías"
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { nombre_categoria } = await request.json();
    
    if (!nombre_categoria || nombre_categoria.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre de la categoría es requerido"
        },
        { status: 400 }
      );
    }
    
    const nombreLimpio = nombre_categoria.trim();
    
    if (nombreLimpio.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre debe tener al menos 2 caracteres"
        },
        { status: 400 }
      );
    }
    
    if (nombreLimpio.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre no puede exceder 100 caracteres"
        },
        { status: 400 }
      );
    }
    
    const existente = await conn.query(
      "SELECT categoria_id FROM Categorias WHERE LOWER(nombre_categoria) = LOWER(?)",
      [nombreLimpio]
    );
    
    if (existente.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe una categoría con este nombre"
        },
        { status: 409 }
      );
    }
    
    const result = await conn.query(
      "INSERT INTO Categorias (nombre_categoria) VALUES (?)",
      [nombreLimpio]
    );
    
    return NextResponse.json(
      {
        success: true,
        message: "Categoría creada exitosamente",
        data: {
          categoria_id: result.insertId,
          nombre_categoria: nombreLimpio
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error al crear categoría:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe una categoría con este nombre"
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear la categoría"
      },
      { status: 500 }
    );
  }
}