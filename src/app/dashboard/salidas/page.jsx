"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import { mostrarConfirmacion } from "@/app/helpers/confirmations";

export default function Sales() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [cantidadError, setCantidadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar productos inicialmente
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/salidas");
        const productosOptions = response.data.map((producto) => ({
          value: producto.producto_id,
          label: producto.nombre,
          stock: producto.stock,
          precio: producto.precioVenta,
        }));
        setProductos(productosOptions);
      } catch (error) {
        toast.error("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const handleProductoChange = (option) => {
    setProductoSeleccionado(option);
    setCantidadError("");
  };

  const handleCantidadChange = (e) => {
    const cantidad = parseInt(e.target.value) || 0;
    
    if (productoSeleccionado) {
      const productoEncontrado = productos.find(
        (p) => p.value === productoSeleccionado.value
      );
      
      if (productoEncontrado && cantidad > productoEncontrado.stock) {
        setCantidadError("La cantidad supera el stock disponible");
        toast.error("La cantidad ingresada supera la cantidad disponible");
      } else {
        setCantidadError("");
      }
      
      setProductoSeleccionado((prev) => ({ ...prev, cantidad }));
    }
  };

  const agregarVenta = (e) => {
    e.preventDefault();
    
    if (cantidadError) {
      toast.error("Corrija los errores antes de agregar");
      return;
    }
    
    if (!productoSeleccionado || !productoSeleccionado.cantidad || productoSeleccionado.cantidad <= 0) {
      toast.error("Seleccione un producto y cantidad válida");
      return;
    }

    // Actualizar stock local
    const updatedProductos = productos.map((p) => {
      if (p.value === productoSeleccionado.value) {
        return { ...p, stock: p.stock - productoSeleccionado.cantidad };
      }
      return p;
    });
    setProductos(updatedProductos);

    // Agregar a ventas
    setVentas([...ventas, productoSeleccionado]);
    setProductoSeleccionado(null);
    toast.success("Producto agregado a la lista");
  };

  const quitarProducto = (index) => {
    const productoDevuelto = ventas[index];
    
    // Devolver stock
    const productosActualizados = productos.map((p) => {
      if (p.value === productoDevuelto.value) {
        return {
          ...p,
          stock: parseInt(p.stock, 10) + parseInt(productoDevuelto.cantidad, 10),
        };
      }
      return p;
    });
    setProductos(productosActualizados);

    // Quitar de ventas
    const nuevasVentas = ventas.filter((_, ventaIndex) => ventaIndex !== index);
    setVentas(nuevasVentas);
    toast.info("Producto removido de la lista");
  };

  const validarVentas = async () => {
    if (ventas.length === 0) {
      toast.error("No hay productos para registrar");
      return;
    }

    mostrarConfirmacion(
      "Confirmar ventas",
      `¿Desea registrar ${ventas.length} producto(s)?`,
      async () => {
        setSaving(true);
        try {
          const ventasParaEnviar = ventas.map((v) => ({
            productoId: v.value,
            cantidad: v.cantidad,
          }));

          // Actualizar stock en BD
          await axios.put("/api/salidas", ventasParaEnviar);

          // Registrar movimientos
          for (const venta of ventas) {
            await axios.post("/api/movimientos/productos", {
              productoR_id: venta.value,
              fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
              tipo_operacion: "disminuido",
              cantidad: venta.cantidad,
              nombre: venta.label,
            });
          }

          toast.success("Ventas registradas exitosamente");
          setVentas([]);
          
          // Recargar productos para actualizar stocks
          const response = await axios.get("/api/salidas");
          const productosOptions = response.data.map((producto) => ({
            value: producto.producto_id,
            label: producto.nombre,
            stock: producto.stock,
            precio: producto.precioVenta,
          }));
          setProductos(productosOptions);
        } catch (error) {
          toast.error("Error al registrar las ventas");
        } finally {
          setSaving(false);
        }
      }
    );
  };

const calcularTotal = () => {
  const total = ventas.reduce(
    (sum, venta) => sum + venta.precio * venta.cantidad,
    0
  );

  return new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
};

  const customStyles = {
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-200">
      <ToastContainer />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de ventas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Registrar Venta
          </h1>
          <form onSubmit={agregarVenta} className="space-y-4">
            <div>
              <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-2">
                Producto *
              </label>
              <Select
                id="producto"
                value={productoSeleccionado}
                onChange={handleProductoChange}
                options={productos}
                placeholder="Seleccione un producto"
                styles={customStyles}
                isDisabled={saving}
              />
              {productoSeleccionado && (
                <p className="mt-2 text-sm text-gray-500">
                  Stock disponible: <span className="font-medium">{productoSeleccionado.stock}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                id="cantidad"
                min="1"
                className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                value={productoSeleccionado?.cantidad || ""}
                onChange={handleCantidadChange}
                disabled={!productoSeleccionado || saving}
              />
              {cantidadError && (
                <p className="text-red-500 text-xs mt-1">{cantidadError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !productoSeleccionado || cantidadError}
              className={`w-full px-4 py-2 rounded-md font-medium transition ${
                saving || !productoSeleccionado || cantidadError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-700 hover:bg-cyan-900 text-white"
              }`}
            >
              Agregar a la Lista
            </button>
          </form>
        </div>

        {/* Lista de productos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Productos Seleccionados
          </h2>

          {ventas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay productos en la lista</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-cyan-900">
                  <thead className="bg-cyan-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                        Producto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                        Precio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                        Total
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-50 divide-y divide-gray-200">
                    {ventas.map((venta, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{venta.label}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{venta.cantidad}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₡{venta.precio}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          ₡{(venta.precio * venta.cantidad).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <button
                            onClick={() => quitarProducto(index)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition"
                            disabled={saving}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-cyan-50 font-semibold">
                      <td colSpan="3" className="px-4 py-3 text-sm text-right text-gray-900">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₡{calcularTotal()}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={validarVentas}
                  disabled={saving}
                  className={`px-6 py-3 rounded-md font-medium transition ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-cyan-700 hover:bg-cyan-900 text-white"
                  }`}
                >
                  {saving ? "Guardando..." : "Registrar Ventas"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}