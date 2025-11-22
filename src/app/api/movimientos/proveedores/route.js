import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await conn.query("SELECT * FROM RegistroProveedores");
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
      proveedor_id,
      nombre,
      vendedor,
      telefono,
      email,
      direccion,
      estado,
      fecha_cambio
    } = await request.json();

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

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: "El formato del email no es válido" },
          { status: 400 }
        );
      }
    }

    if (telefono) {
      const telefonoLimpio = telefono.trim();
      if (telefonoLimpio.length > 20) {
        return NextResponse.json(
          { message: "El teléfono no puede exceder 20 caracteres" },
          { status: 400 }
        );
      }
    }

    const fechaDate = new Date(fecha_cambio);
    if (isNaN(fechaDate.getTime())) {
      return NextResponse.json(
        { message: "La fecha no es válida" },
        { status: 400 }
      );
    }

    const proveedorExiste = await conn.query(
      "SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?",
      [proveedor_id]
    );

    const result = await conn.query(
      "INSERT INTO RegistroProveedores (proveedor_id, nombre, vendedor, telefono, email, direccion, estado, fecha_cambio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        proveedor_id,
        nombre.trim(),
        vendedor ? vendedor.trim() : null,
        telefono ? telefono.trim() : null,
        email ? email.trim().toLowerCase() : null,
        direccion ? direccion.trim() : null,
        estado.toLowerCase(),
        fecha_cambio
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Registro de proveedor creado exitosamente",
      data: {
        registro_id: result.insertId,
        proveedor_id: proveedor_id,
        nombre: nombre.trim(),
        vendedor: vendedor ? vendedor.trim() : null,
        telefono: telefono ? telefono.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        direccion: direccion ? direccion.trim() : null,
        estado: estado.toLowerCase(),
        fecha_cambio: fecha_cambio
      }
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear el registro de proveedor" },
      { status: 500 }
    );
  }
}
