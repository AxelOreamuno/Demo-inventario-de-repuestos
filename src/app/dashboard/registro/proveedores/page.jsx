"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaSave,
  FaUser,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmarCreacion } from "@/app/helpers/confirmations";

export default function FormularioProveedor() {
  const [proveedor, setProveedor] = useState({
    nombre: "",
    vendedor: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [proveedoresExistentes, setProveedoresExistentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoadingData(true);
    try {
      const response = await axios.get("/api/proveedores");
      setProveedoresExistentes(response.data);
    } catch (error) {
      toast.error("Error al cargar los proveedores existentes");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCambios = (e) => {
    setProveedor({
      ...proveedor,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setProveedor({
      nombre: "",
      vendedor: "",
      telefono: "",
      email: "",
      direccion: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    if (
      !proveedor.nombre.trim() ||
      !proveedor.vendedor.trim() ||
      !proveedor.telefono.trim() ||
      !proveedor.email.trim() ||
      !proveedor.direccion.trim()
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Validar email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(proveedor.email)) {
      toast.error("El formato del correo electrónico es inválido");
      return;
    }

    // Validar teléfono (básico)
    const telefonoPattern = /^\d{8,15}$/;
    if (!telefonoPattern.test(proveedor.telefono.replace(/[\s-]/g, ""))) {
      toast.error("El teléfono debe contener entre 8 y 15 dígitos");
      return;
    }

    // Verificar duplicados
    const proveedorExistente = proveedoresExistentes.find(
      (prov) => prov.nombre.toLowerCase() === proveedor.nombre.toLowerCase().trim()
    );
    if (proveedorExistente) {
      toast.error("Ya existe un proveedor con ese nombre");
      return;
    }

    // Confirmar antes de guardar
    confirmarCreacion("este proveedor", async () => {
      setLoading(true);

      try {
        const respuesta = await axios.post("/api/proveedores", {
          ...proveedor,
          nombre: proveedor.nombre.trim(),
          vendedor: proveedor.vendedor.trim(),
          telefono: proveedor.telefono.trim(),
          email: proveedor.email.trim(),
          direccion: proveedor.direccion.trim(),
        });

        const providerId = respuesta.data.id;

        // Registrar movimiento
        await axios.post("/api/movimientos/proveedores", {
          proveedor_id: providerId,
          nombre: proveedor.nombre.trim(),
          vendedor: proveedor.vendedor.trim(),
          telefono: proveedor.telefono.trim(),
          email: proveedor.email.trim(),
          direccion: proveedor.direccion.trim(),
          estado: "Agregado",
          fecha_cambio: new Date().toISOString().slice(0, 19).replace("T", " "),
        });

        toast.success("Proveedor registrado exitosamente");
        limpiarFormulario();
        cargarProveedores(); // Recargar lista
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error al registrar el proveedor"
        );
      } finally {
        setLoading(false);
      }
    });
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 py-8">
      <div className="bg-gray-200 p-8 rounded-lg shadow-md w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
        <ToastContainer />
        <div className="mx-auto p-6 bg-cyan-950 text-white rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold mb-8">
            Registrar Nuevo Proveedor
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="nombre"
                  className="text-sm font-medium mb-2 flex items-center"
                >
                  <FaBuilding className="mr-2" />
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="w-full border rounded p-2 text-black"
                  placeholder="Nombre de la empresa"
                  value={proveedor.nombre}
                  onChange={handleCambios}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="vendedor"
                  className="text-sm font-medium mb-2 flex items-center"
                >
                  <FaUser className="mr-2" />
                  Nombre del Vendedor *
                </label>
                <input
                  type="text"
                  id="vendedor"
                  name="vendedor"
                  className="w-full border rounded p-2 text-black"
                  placeholder="Nombre del vendedor"
                  value={proveedor.vendedor}
                  onChange={handleCambios}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="text-sm font-medium mb-2 flex items-center"
                >
                  <FaPhone className="mr-2" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className="w-full border rounded p-2 text-black"
                  placeholder="8888-8888"
                  value={proveedor.telefono}
                  onChange={handleCambios}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium mb-2 flex items-center"
                >
                  <FaEnvelope className="mr-2" />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border rounded p-2 text-black"
                  placeholder="email@ejemplo.com"
                  value={proveedor.email}
                  onChange={handleCambios}
                  disabled={loading}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="direccion"
                  className="text-sm font-medium mb-2 flex items-center"
                >
                  <FaMapMarkedAlt className="mr-2" />
                  Dirección *
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  className="w-full border rounded p-2 text-black"
                  placeholder="Dirección completa de la empresa"
                  value={proveedor.direccion}
                  onChange={handleCambios}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-3 rounded font-medium flex items-center justify-center transition ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-blue-700 text-white"
                }`}
              >
                <FaSave className="mr-2" />
                {loading ? "Guardando..." : "Registrar Proveedor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}