'use client'
import React, { useState, useEffect } from 'react';
import { AiOutlineSearch, AiFillPlusCircle, AiFillMinusCircle, AiFillDelete, AiFillEdit } from 'react-icons/ai';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductsMovements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [productMovements, setProductMovements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/movimientos/productos");
        const sortedData = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setProductMovements(sortedData);
      } catch (error) {
        toast.error("Error al cargar los movimientos de productos");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    const dateTime = new Date(dateTimeStr);
    const options = {
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', hour12: true,
    };
    return dateTime.toLocaleString('es-CR', options);
  };

  const getOperationIcon = (tipoOperacion) => {
    switch (tipoOperacion) {
      case 'entrada':
        return <AiFillPlusCircle className="text-green-700 mr-2" />;
      case 'eliminado':
        return <AiFillDelete className="text-red-500 mr-2" />;
      case 'disminuido':
        return <AiFillMinusCircle className="text-orange-500 mr-2" />;
      case 'editado':
        return <AiFillEdit className="text-yellow-500 mr-2" />;
      default:
        return null;
    }
  };

  // Primero filtrar
  const filteredMovements = productMovements.filter((movement) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      movement.fecha.toLowerCase().includes(searchTermLower) ||
      movement.tipo_operacion.toLowerCase().includes(searchTermLower) ||
      movement.nombre.toLowerCase().includes(searchTermLower) ||
      movement.cantidad.toString().includes(searchTermLower)
    );
  });

  // Luego paginar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // Reset a página 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-4 text-cyan-950">Movimientos de Productos</h1>
      
      <div className="mb-4 flex border border-gray-300 bg-white rounded-md px-4 py-2">
        <AiOutlineSearch className="h-5 w-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar movimientos de productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 outline-none flex-1"
        />
      </div>

      {filteredMovements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "No se encontraron movimientos" : "No hay movimientos registrados"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full text-left border border-cyan-900 bg-slate-200 rounded-lg">
              <thead className="text-xs font-semibold uppercase text-white bg-cyan-950">
                <tr>
                  <th className="px-2 py-3">Fecha y Hora</th>
                  <th className="px-2 py-3">Nombre</th>
                  <th className="px-2 py-3">Cantidad</th>
                  <th className="px-2 py-3 text-center">Tipo de Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {currentItems.map((movement, index) => (
                  <tr key={index} className="hover:bg-gray-500 transition">
                    <td className="px-2 py-2 text-black">{formatDateTime(movement.fecha)}</td>
                    <td className="px-2 py-2 text-black">{movement.nombre}</td>
                    <td className="px-2 py-2 text-black">{movement.cantidad}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center">
                        {getOperationIcon(movement.tipo_operacion)}
                        <span className="font-medium text-sm text-black capitalize">{movement.tipo_operacion}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {[...Array(totalPages).keys()].map(number => (
                <button 
                  key={number} 
                  onClick={() => changePage(number + 1)}
                  className={`px-3 py-1 rounded transition ${
                    currentPage === number + 1 
                      ? 'bg-cyan-950 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}