'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AiOutlineSearch, AiFillCloseCircle } from 'react-icons/ai';
import { FcFinePrint } from "react-icons/fc";
import { toast } from 'react-toastify';

export default function BillsMovements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [data, setData] = useState([]);
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/movimientos/facturas");
        setData(response.data);
      } catch (error) {
        toast.error("Error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, []);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closeBillDetails();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleEscape = (event) => {
    if (event.keyCode === 27) {
      closeBillDetails();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openBillDetails = async (bill) => {
    setSelectedBill(bill);
    setLoadingDetails(true);
    
    try {
      const response = await axios.get(`/api/movimientos/detalle/${bill.factura_id}`);
      setBillDetails(response.data);
    } catch (error) {
      toast.error("Error al cargar detalles de la factura");
      closeBillDetails();
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeBillDetails = () => {
    setSelectedBill(null);
    setBillDetails(null);
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return ''; 
    const dateObj = new Date(dateTime);
    const formattedDate = dateObj.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formattedDate;
  };

  const filteredData = data.filter((movement) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      movement.codigoFactura?.toLowerCase().includes(searchTermLower) ||
      movement.proveedor_nombre?.toLowerCase().includes(searchTermLower) ||
      movement.total?.toString().toLowerCase().includes(searchTermLower) ||
      movement.fecha?.toLowerCase().includes(searchTermLower) ||
      movement.hora?.toString().toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 bg-gray-200 min-h-screen py-8" ref={wrapperRef}>
      <h1 className="text-2xl font-bold mb-4 text-cyan-950">Historial de Facturas</h1>
      
      <div className="mb-4 flex border border-gray-300 bg-white rounded-md px-4 py-2">
        <AiOutlineSearch className="h-5 w-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar facturas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 outline-none flex-1"
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "No se encontraron facturas" : "No hay facturas registradas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredData.map((movement, index) => (
            <div key={index} className="border border-white bg-cyan-950 hover:bg-cyan-800 p-4 rounded-md shadow-md transition">
              <h2 className="text-lg font-semibold text-white">{movement.codigoFactura}</h2>
              <p className="text-gray-200 mt-2">Proveedor: {movement.proveedor_nombre}</p>
              <p className="text-gray-200">Precio: ₡{movement.total}</p>
              <p className="text-gray-200">Fecha: {formatDate(movement.fecha)}</p>
              <button
                id='btnDetalleFactura'
                className="ml-auto w-16 h-16 flex items-center justify-center hover:scale-110 transition"
                onClick={() => openBillDetails(movement)}
                aria-label="Ver detalles de factura"
              >
                <FcFinePrint className="text-5xl" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedBill && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 transition duration-300 ease-in-out">
          <div className="bg-gray-200 w-full max-w-lg p-6 rounded-lg shadow-xl border-2 border-white relative overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <button
              id='btnCerrarDetalleFactura'
              onClick={closeBillDetails}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-200 ease-in-out"
              aria-label="Cerrar detalles"
            >
              <AiFillCloseCircle className="text-2xl" />
            </button>
            
            <h2 className="text-xl font-semibold text-cyan-950 mb-4">
              Detalles de Factura - {selectedBill.codigoFactura}
            </h2>
            
            <div className="mb-4 border-b pb-4">
              <p className="text-gray-700"><strong>Proveedor:</strong> {selectedBill.proveedor_nombre}</p>
              <p className="text-gray-700"><strong>Total:</strong> ₡{selectedBill.total}</p>
              <p className="text-gray-700"><strong>Fecha:</strong> {formatDate(selectedBill.fecha)}</p>
            </div>

            {loadingDetails ? (
              <p className="text-center text-gray-500">Cargando detalles...</p>
            ) : (
              <div>
                <h3 className="font-semibold text-cyan-950 mb-2">Productos:</h3>
                {billDetails && billDetails.map((detail, index) => (
                  <div key={index} className="border-b border-gray-300 py-3 last:border-0">
                    <p className="text-gray-600 font-medium mb-1">#{index + 1}</p>
                    <p className="text-gray-800"><strong>Producto:</strong> {detail.nombreProducto}</p>
                    <p className="text-gray-700">Cantidad: {detail.cantidad}</p>
                    <p className="text-gray-700">Precio Unitario: ₡{detail.precio_compra}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}