"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmarActualizacion, confirmarEliminacion } from "@/app/helpers/confirmations";

export default function Provider() {
  const [searchTerm, setSearchTerm] = useState("");
  const [providers, setProviders] = useState([]);
  const [editedProviders, setEditedProviders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/proveedores");
        setProviders(response.data);
      } catch (error) {
        toast.error("Error al cargar los proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const formatDateTime = (d) => d.toISOString().slice(0, 19).replace("T", " ");

  const handleEdit = async (provider) => {
    const editedProvidersCopy = { ...editedProviders };
    const isEditing = editedProvidersCopy[provider.proveedor_id] !== undefined;

    if (isEditing) {
      // Guardar cambios
      confirmarActualizacion("este proveedor", async () => {
        const { nombre, vendedor, email, telefono, direccion } =
          editedProvidersCopy[provider.proveedor_id];
        
        const updatedProvider = {
          nombre: nombre !== undefined ? nombre : provider.nombre,
          vendedor: vendedor !== undefined ? vendedor : provider.vendedor,
          email: email !== undefined ? email : provider.email,
          telefono: telefono !== undefined ? telefono : provider.telefono,
          direccion: direccion !== undefined ? direccion : provider.direccion,
        };

        try {
          await axios.put(`/api/proveedores/${provider.proveedor_id}`, updatedProvider);
          
          const updatedProviders = providers.map((p) =>
            p.proveedor_id === provider.proveedor_id ? { ...p, ...updatedProvider } : p
          );
          setProviders(updatedProviders);
          toast.success("Proveedor actualizado exitosamente");

          // Registrar movimiento
          const providerData = {
            proveedor_id: provider.proveedor_id,
            nombre: updatedProvider.nombre,
            vendedor: updatedProvider.vendedor,
            telefono: updatedProvider.telefono,
            email: updatedProvider.email,
            direccion: updatedProvider.direccion,
            estado: "Editado",
            fecha_cambio: formatDateTime(new Date()),
          };

          await axios.post(`/api/movimientos/proveedores`, providerData);

          delete editedProvidersCopy[provider.proveedor_id];
          setEditedProviders(editedProvidersCopy);
        } catch (error) {
          toast.error("Error al actualizar el proveedor");
        }
      });
    } else {
      // Activar modo edición
      editedProvidersCopy[provider.proveedor_id] = { ...provider };
      setEditedProviders(editedProvidersCopy);
    }
  };

  const handleInputChange = (e, field, provider) => {
    const value = e.target.value;
    setEditedProviders((prevEditedProviders) => ({
      ...prevEditedProviders,
      [provider.proveedor_id]: {
        ...prevEditedProviders[provider.proveedor_id],
        [field]: value,
      },
    }));
  };

  const handleDelete = (proveedor_id, provider) => {
    confirmarEliminacion("este proveedor", async () => {
      try {
        await axios.delete(`/api/proveedores/${proveedor_id}`);
        
        const editedProvidersCopy = { ...editedProviders };
        delete editedProvidersCopy[proveedor_id];
        setEditedProviders(editedProvidersCopy);

        setProviders(providers.filter(p => p.proveedor_id !== proveedor_id));

        // Registrar movimiento
        const providerData = {
          proveedor_id: provider.proveedor_id,
          nombre: provider.nombre,
          vendedor: provider.vendedor,
          telefono: provider.telefono,
          email: provider.email,
          direccion: provider.direccion,
          estado: "Inactivo",
          fecha_cambio: formatDateTime(new Date()),
        };

        await axios.post(`/api/movimientos/proveedores`, providerData);
        
        toast.success("Proveedor eliminado exitosamente");
      } catch (error) {
        toast.error("Error al eliminar el proveedor");
      }
    });
  };

  const filteredProviders = providers.filter((provider) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      provider.nombre.toLowerCase().includes(searchTermLower) ||
      provider.telefono.toLowerCase().includes(searchTermLower) ||
      provider.email.toLowerCase().includes(searchTermLower) ||
      provider.direccion.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-4 text-cyan-950">Proveedores</h1>
      
      <div className="mb-4 flex border border-gray-300 bg-white rounded-md px-4 py-2">
        <AiOutlineSearch className="h-5 w-5 text-gray-500 mr-2" />
        <input
          id="search-provider"
          type="text"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 outline-none flex-1"
        />
      </div>

      {filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "No se encontraron proveedores" : "No hay proveedores registrados"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProviders.map((row) => (
            <div
              key={row.proveedor_id}
              className="border border-gray-300 p-4 rounded-md shadow-md bg-cyan-950 hover:bg-cyan-800 transition duration-300 ease-in-out"
            >
              <div>
                {editedProviders[row.proveedor_id] ? (
                  <div>
                    <div className="flex flex-wrap -mx-2 mb-2">
                      <div className="w-1/2 px-2">
                        <label className="block text-gray-300 text-sm font-bold mb-1">
                          Nombre:
                        </label>
                        <input
                          id="name-provider"
                          type="text"
                          value={editedProviders[row.proveedor_id].nombre || ""}
                          onChange={(e) => handleInputChange(e, "nombre", row)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <label className="block text-gray-300 text-sm font-bold mb-1">
                          Vendedor:
                        </label>
                        <input
                          id="seller-provider"
                          type="text"
                          value={editedProviders[row.proveedor_id].vendedor || ""}
                          onChange={(e) => handleInputChange(e, "vendedor", row)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-2 mb-2">
                      <div className="w-1/2 px-2">
                        <label className="block text-gray-300 text-sm font-bold mb-1">
                          Email:
                        </label>
                        <input
                          id="email-provider"
                          type="email"
                          value={editedProviders[row.proveedor_id].email || ""}
                          onChange={(e) => handleInputChange(e, "email", row)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <label className="block text-gray-300 text-sm font-bold mb-1">
                          Teléfono:
                        </label>
                        <input
                          id="phone-provider"
                          type="tel"
                          value={editedProviders[row.proveedor_id].telefono || ""}
                          onChange={(e) => handleInputChange(e, "telefono", row)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-2">
                      <div className="w-full px-2">
                        <label className="block text-gray-300 text-sm font-bold mb-1">
                          Dirección:
                        </label>
                        <input
                          id="address-provider"
                          type="text"
                          value={editedProviders[row.proveedor_id].direccion || ""}
                          onChange={(e) => handleInputChange(e, "direccion", row)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-gray-200 font-semibold text-lg">
                      {row.nombre}
                    </h2>
                    <p className="text-gray-200 mt-2">
                      <span className="font-medium">Vendedor:</span> {row.vendedor}
                    </p>
                    <p className="text-gray-200">
                      <span className="font-medium">Teléfono:</span> {row.telefono}
                    </p>
                    <p className="text-gray-200">
                      <span className="font-medium">Email:</span> {row.email}
                    </p>
                    <p className="text-gray-200">
                      <span className="font-medium">Dirección:</span> {row.direccion}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  id="edit-provider"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    editedProviders[row.proveedor_id]
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                  onClick={() => handleEdit(row)}
                >
                  {editedProviders[row.proveedor_id] ? "Guardar" : "Editar"}
                </button>
                <button
                  id="delete-provider"
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  onClick={() => handleDelete(row.proveedor_id, row)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}