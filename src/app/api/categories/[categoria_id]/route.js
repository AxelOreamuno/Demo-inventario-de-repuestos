import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const categoriaId = parseInt(params.categoria_id);
    
    if (isNaN(categoriaId)) {
      return NextResponse.json(
        { message: "ID de categoría inválido" },
        { status: 400 }
      );
    }

    const tareasAsociadas = await conn.query(
      "SELECT COUNT(*) as total FROM Productos WHERE categoriaP_id = ?",
      [categoriaId]
    );

    if (tareasAsociadas[0].total > 0) {
      return NextResponse.json(
        { 
          message: "No se puede eliminar. La categoría tiene tareas asociadas",
          tareas_asociadas: tareasAsociadas[0].total
        },
        { status: 409 }
      );
    }

    const result = await conn.query(
      "DELETE FROM Categorias WHERE categoria_id = ?",
      [categoriaId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    
    return NextResponse.json(
      { message: "Error al eliminar la categoría" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {

    const categoriaId = parseInt(params.categoria_id);
    
    if (isNaN(categoriaId)) {
      return NextResponse.json(
        { message: "ID de categoría inválido" },
        { status: 400 }
      );
    }

    const { nombre_categoria } = await request.json();

    if (!nombre_categoria || nombre_categoria.trim() === '') {
      return NextResponse.json(
        { message: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }

    const nombreLimpio = nombre_categoria.trim();
    
    if (nombreLimpio.length < 2) {
      return NextResponse.json(
        { message: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (nombreLimpio.length > 100) {
      return NextResponse.json(
        { message: "El nombre no puede exceder 100 caracteres" },
        { status: 400 }
      );
    }

    const categoriaExiste = await conn.query(
      "SELECT categoria_id FROM Categorias WHERE categoria_id = ?",
      [categoriaId]
    );

    if (categoriaExiste.length === 0) {
      return NextResponse.json(
        { message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const duplicado = await conn.query(
      "SELECT categoria_id FROM Categorias WHERE LOWER(nombre_categoria) = LOWER(?) AND categoria_id != ?",
      [nombreLimpio, categoriaId]
    );

    if (duplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe otra categoría con este nombre" },
        { status: 409 }
      );
    }

    const result = await conn.query(
      "UPDATE Categorias SET nombre_categoria = ? WHERE categoria_id = ?",
      [nombreLimpio, categoriaId]
    );

    return NextResponse.json({
      message: "Categoría actualizada exitosamente",
      data: {
        categoria_id: categoriaId,
        nombre_categoria: nombreLimpio
      }
    });

  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    
    return NextResponse.json(
      { message: "Error al actualizar la categoría" },
      { status: 500 }
    );
  }
}