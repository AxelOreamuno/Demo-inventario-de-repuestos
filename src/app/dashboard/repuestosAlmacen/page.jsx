"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  confirmarEliminacion,
  confirmarActualizacion,
} from "@/app/helpers/confirmations";
import {
  exportAllDataToPDF,
  exportCurrentPageToPDF,
} from "./TableToPDF";

function ProductTable() {
  const nonEditableColumns = ["precioVenta", "stock"];
  const router = useRouter();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("nombre");
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // COLUMNAS MOSTRADAS
  const columns = [
    "codigo",
    "nombre",
    "precioVenta",
    "stock",
    "proveedor_nombre",
    "categoria_nombre",
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [productsRes, providersRes, categoriesRes] = await Promise.all([
          axios.get("/api/table"),
          axios.get("/api/proveedores"),
          axios.get("/api/categories"),
        ]);

        setData(productsRes.data);

        const providersWithRenamedField = providersRes.data.map((provider) => ({
          ...provider,
          nombre_proveedor: provider.nombre,
        }));

        setProviders(providersWithRenamedField);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy]);

  // DELETE
  const handleDelete = async (producto_id) => {
    const producto = data.find((p) => p.producto_id === producto_id);

    confirmarEliminacion("este producto", async () => {
      try {
        await axios.post("/api/movimientos/productos", {
          productoR_id: producto_id,
          fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
          tipo_operacion: "eliminado",
          cantidad: producto.stock,
          nombre: producto.nombre,
        });

        await axios.delete(`/api/table/${producto_id}`);

        const response = await axios.get("/api/table");
        setData(response.data);

        toast.success("Producto eliminado exitosamente");
      } catch (error) {
        toast.error("Error al eliminar el producto");
      }
    });
  };

  // EDIT
  const handleEdit = (producto_id) => {
    const productToEdit = data.find(
      (product) => product.producto_id === producto_id
    );

    const proveedorId =
      providers.find(
        (p) => p.nombre_proveedor === productToEdit.proveedor_nombre
      )?.proveedor_id || "";

    const categoriaId =
      categories.find(
        (c) => c.nombre_categoria === productToEdit.categoria_nombre
      )?.categoria_id || "";

    setEditingRow({
      index: producto_id,
      data: {
        ...productToEdit,
        proveedor_id: proveedorId,
        categoria_id: categoriaId,
      },
    });
  };

  // SAVE
  const handleSave = async (producto_id) => {
  confirmarActualizacion("este producto", async () => {
    try {
      const { codigo, nombre, proveedor_id, categoria_id, stock } = editingRow.data;

      const dataToUpdate = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        stock: stock ?? 0,
        proveedor_id,
        categoria_id,
      };

      const response = await axios.put(
        `/api/table/${producto_id}`,
        dataToUpdate
      );

      await axios.post("/api/movimientos/productos", {
        productoR_id: producto_id,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
        tipo_operacion: "editado",
        cantidad: stock,
        nombre: nombre.trim(),
      });

      setData(response.data);
      setEditingRow(null);

      toast.success("Producto actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el producto");
    }
  });
};

  // Resolver nombres finales
  const resolveNames = (item) => {
    const provider = providers.find(
      (p) => p.proveedor_id === item.proveedor_id
    );

    const category = categories.find(
      (c) => c.categoria_id === item.categoria_id
    );

    return {
      ...item,
      proveedor_nombre: provider
        ? provider.nombre_proveedor
        : item.proveedor_nombre,
      categoria_nombre: category
        ? category.nombre_categoria
        : item.categoria_nombre,
    };
  };

  // FILTRO
  const filteredData = data.filter((row) =>
    row[filterBy]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINACIÓN
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const preparedCurrentItems = currentItems.map(resolveNames);
  const preparedData = data.map(resolveNames);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <p className="text-gray-600">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4 text-cyan-900">
          Inventario
        </h1>

        {/* FILTROS */}
        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar..."
            className="py-2 px-4 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="py-2 px-4 border rounded"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="codigo">Código</option>
            <option value="nombre">Nombre</option>
            <option value="precioVenta">Precio Venta</option>
          </select>

          <button
            onClick={() => exportCurrentPageToPDF(preparedCurrentItems)}
            className="py-2 px-4 rounded bg-cyan-900 text-white hover:bg-cyan-700 flex items-center transition"
          >
            <FaFilePdf className="mr-2" /> Exportar Página
          </button>

          <button
            onClick={() => exportAllDataToPDF(preparedData)}
            className="py-2 px-4 rounded bg-cyan-900 text-white hover:bg-cyan-700 flex items-center transition"
          >
            <FaFilePdf className="mr-2" /> Exportar Todo
          </button>
        </div>

        {/* TABLA */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No se encontraron productos"
                : "No hay productos en el inventario"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-cyan-900 text-white">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="py-3 px-4 text-left text-sm uppercase font-semibold"
                      >
                        {col.replace("_nombre", "").replace("precioVenta", "Precio Venta").replace("stock", "Cantidad")}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-left text-sm uppercase font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {preparedCurrentItems.map((row) => {
                    const isEditing =
                      editingRow && editingRow.index === row.producto_id;

                    return (
                      <tr
                        key={row.producto_id}
                        className={`border-b hover:bg-gray-50 ${
                          isEditing ? "bg-blue-50" : ""
                        }`}
                      >
                        {columns.map((key) => {
                          const isProveedor = key === "proveedor_nombre";
                          const isCategoria = key === "categoria_nombre";

                          return (
                            <td key={key} className="py-3 px-4 text-sm">
                              {isEditing ? (
                                nonEditableColumns.includes(key) ? (
                                  key === "precioVenta"
                                    ? `₡${row[key]}`
                                    : row[key]
                                ) : isProveedor || isCategoria ? (
                                  <select
                                    value={
                                      isProveedor
                                        ? editingRow.data.proveedor_id
                                        : editingRow.data.categoria_id
                                    }
                                    onChange={(e) => {
                                      const selectedId = parseInt(e.target.value);
                                      setEditingRow((prev) => ({
                                        ...prev,
                                        data: {
                                          ...prev.data,
                                          [isProveedor
                                            ? "proveedor_id"
                                            : "categoria_id"]: selectedId,
                                        },
                                      }));
                                    }}
                                    className="w-full py-2 px-3 border rounded"
                                  >
                                    <option value="">
                                      {isProveedor
                                        ? "Seleccionar Proveedor"
                                        : "Seleccionar Categoría"}
                                    </option>
                                    {isProveedor
                                      ? providers.map((provider) => (
                                          <option
                                            key={provider.proveedor_id}
                                            value={provider.proveedor_id}
                                          >
                                            {provider.nombre_proveedor}
                                          </option>
                                        ))
                                      : categories.map((category) => (
                                          <option
                                            key={category.categoria_id}
                                            value={category.categoria_id}
                                          >
                                            {category.nombre_categoria}
                                          </option>
                                        ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={editingRow.data[key] || ""}
                                    onChange={(e) =>
                                      setEditingRow((prev) => ({
                                        ...prev,
                                        data: {
                                          ...prev.data,
                                          [key]: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full py-2 px-3 border rounded"
                                  />
                                )
                              ) : key === "precioVenta" ? (
                                `₡${row[key]}`
                              ) : (
                                row[key]
                              )}
                            </td>
                          );
                        })}

                        {/* ACCIONES */}
                        <td className="py-3 px-4 text-sm">
                          <div className="flex space-x-2">
                            {isEditing ? (
                              <button
                                className="text-green-600 p-2 rounded-full hover:bg-green-100 transition"
                                onClick={() => handleSave(row.producto_id)}
                              >
                                <FaSave />
                              </button>
                            ) : (
                              <button
                                className="text-blue-600 p-2 rounded-full hover:bg-blue-100 transition"
                                onClick={() => handleEdit(row.producto_id)}
                              >
                                <FaEdit />
                              </button>
                            )}
                            <button
                              className="text-red-600 p-2 rounded-full hover:bg-red-100 transition"
                              onClick={() => handleDelete(row.producto_id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav>
                  <ul className="inline-flex items-center -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <li key={number} className="mx-1">
                          <button
                            onClick={() => paginate(number)}
                            className={`py-2 px-4 leading-tight border rounded transition ${
                              currentPage === number
                                ? "bg-cyan-700 text-white"
                                : "bg-white text-cyan-700 hover:bg-cyan-500 hover:text-white"
                            }`}
                          >
                            {number}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductTable;
