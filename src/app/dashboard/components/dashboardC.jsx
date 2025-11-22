"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBox,
  FaTruck,
  FaRegListAlt,
  FaWarehouse,
  FaChartBar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(null);
  const [totalProviders, setTotalProviders] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const router = useRouter();
  useEffect(() => {
    axios
      .get("/api/Inicio/productos")
      .then((response) => {
        const data = response.data;
        setTotalProducts(data.totalProducts);
      })
      .catch((error) => {
      });

    axios
      .get("/api/Inicio/proveedores")
      .then((response) => {
        const data = response.data;
        setTotalProviders(data.totalProviders);
      })
      .catch((error) => {
      });
    axios.get("/api/Inicio/usuarios-total").then((response) => {
      const data = response.data;
      setTotalUsers(data.totalUsers);
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaBox className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Total de productos</h3>
              {totalProducts !== null ? (
                <p className="text-gray-600">{totalProducts} Productos</p>
              ) : (
                <p className="text-gray-600">Cargando...</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaBox className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Proveedores activos</h3>
              {totalProducts !== null ? (
                <p className="text-gray-600">{totalProviders} Proveedores</p>
              ) : (
                <p className="text-gray-600">Cargando...</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaBox className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Usuarios activos</h3>
              {totalUsers !== null ? (
                <p className="text-gray-600">{totalUsers} Usuarios</p>
              ) : (
                <p className="text-gray-600">Cargando...</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaRegListAlt className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Ver inventario</h3>
              <button
                onClick={() => router.push("/dashboard/repuestosAlmacen")}
                className="text-gray-600"
              >
                Ver Lista
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaChartBar className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Ver proveedores</h3>
              <button
                onClick={() => router.push("/dashboard/proveedoresTotal")}
                className="text-gray-600"
              >
                Ver lista
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <FaChartBar className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-bold">Historial facturas</h3>
              <button
                onClick={() => router.push("/dashboard/movimientos/facturas")}
                className="text-gray-600"
              >
                Ver lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;