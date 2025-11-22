import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    try {
      const result = await conn.query(
        "UPDATE Proveedores SET estado = ? WHERE proveedor_id = ?",
        ['inactivo', params.proveedor_id]
      );
  
      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            message: "Proveedor no encontrado",
          },
          {
            status: 404,
          }
        );
      }

      return new Response(null, { status: 204 });
    } catch (error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 500 }
      );
    }
  }

  export async function PUT(request, { params }) {
  try {

    const proveedorId = parseInt(params.proveedor_id);
    
    if (isNaN(proveedorId)) {
      return NextResponse.json(
        { message: "ID de proveedor inválido" },
        { status: 400 }
      );
    }

    const requestData = await request.json();
    const { nombre, vendedor, email, telefono, direccion } = requestData;

    if (nombre !== undefined) {
      if (nombre.trim() === '') {
        return NextResponse.json(
          { message: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }

      if (nombre.trim().length > 200) {
        return NextResponse.json(
          { message: "El nombre no puede exceder 200 caracteres" },
          { status: 400 }
        );
      }
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: "El formato del email no es válido" },
          { status: 400 }
        );
      }
    }

    if (telefono !== undefined && telefono !== null && telefono !== '' && telefono.trim().length > 20) {
      return NextResponse.json(
        { message: "El teléfono no puede exceder 20 caracteres" },
        { status: 400 }
      );
    }

    if (nombre) {
      const nombreDuplicado = await conn.query(
        "SELECT proveedor_id FROM Proveedores WHERE nombre = ? AND proveedor_id != ? AND estado = 'activo'",
        [nombre.trim(), proveedorId]
      );

      if (nombreDuplicado.length > 0) {
        return NextResponse.json(
          { message: "Ya existe otro proveedor con este nombre" },
          { status: 409 }
        );
      }
    }

    const query = "UPDATE Proveedores SET nombre = ?, vendedor = ?, email = ?, telefono = ?, direccion = ? WHERE proveedor_id = ?";
    const values = [
      nombre ? nombre.trim() : nombre,
      vendedor ? vendedor.trim() : vendedor,
      email ? email.trim().toLowerCase() : email,
      telefono ? telefono.trim() : telefono,
      direccion ? direccion.trim() : direccion,
      proveedorId
    ];

    const result = await conn.query(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar el proveedor" },
      { status: 500 }
    );
  }
}