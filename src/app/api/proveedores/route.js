import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query(
      "SELECT * FROM Proveedores WHERE estado = 'activo' ORDER BY nombre ASC"
    );
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los proveedores" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const requestData = await request.json();
    const { nombre, vendedor, telefono, email, direccion } = requestData;

    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { message: "El nombre del proveedor es requerido" },
        { status: 400 }
      );
    }

    if (nombre.trim().length > 200) {
      return NextResponse.json(
        { message: "El nombre no puede exceder 200 caracteres" },
        { status: 400 }
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: "El formato del email no es válido" },
          { status: 400 }
        );
      }
    }

    if (telefono && telefono.trim().length > 20) {
      return NextResponse.json(
        { message: "El teléfono no puede exceder 20 caracteres" },
        { status: 400 }
      );
    }

    const nombreDuplicado = await conn.query(
      "SELECT proveedor_id FROM Proveedores WHERE nombre = ? AND estado = 'activo'",
      [nombre.trim()]
    );

    if (nombreDuplicado.length > 0) {
      return NextResponse.json(
        { message: "Ya existe un proveedor activo con este nombre" },
        { status: 409 }
      );
    }

    const result = await conn.query("INSERT INTO Proveedores SET ?", {
      nombre: nombre.trim(),
      vendedor: vendedor ? vendedor.trim() : null,
      telefono: telefono ? telefono.trim() : null,
      email: email ? email.trim().toLowerCase() : null,
      direccion: direccion ? direccion.trim() : null
    });

    return NextResponse.json({
      success: true,
      message: "Proveedor registrado exitosamente",
      data: {
        proveedor_id: result.insertId,
        nombre: nombre.trim(),
        vendedor: vendedor ? vendedor.trim() : null,
        telefono: telefono ? telefono.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        direccion: direccion ? direccion.trim() : null
      }
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al registrar el proveedor" },
      { status: 500 }
    );
  }
}