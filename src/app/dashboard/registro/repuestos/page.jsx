'use client'
import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaSave,
  FaBarcode,
  FaDollarSign,
  FaPercent,
  FaCubes,
  FaTruck,
  FaTags,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmarCreacion } from "@/app/helpers/confirmations";

export function ProductForm() {
  const [products, setProducts] = useState({
    codigo: "",
    nombre: "",
    precioVenta: "",
    stock: "",
    proveedorP_id: "",
    categoriaP_id: "",
    ivaP_id: "",
    utilidadP_id: "",
    precioCompra: "",
  });

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [iva, setIva] = useState([]);
  const [utility, setUtility] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingData(true);
      try {
        const [providersRes, categoriesRes, ivaRes, utilityRes] = await Promise.all([
          axios.get("/api/proveedores"),
          axios.get("/api/categories"),
          axios.get("/api/iva"),
          axios.get("/api/utilidad"),
        ]);

        setProviders(providersRes.data);
        setCategories(categoriesRes.data.data);
        setIva(ivaRes.data);
        setUtility(utilityRes.data);
      } catch (error) {
        toast.error("Error al cargar los datos del formulario");
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const getIvaTasa = (ivaId) => {
    const ivaSeleccionado = iva.find((i) => i.iva_id === parseInt(ivaId, 10));
    return ivaSeleccionado ? parseFloat(ivaSeleccionado.tasa) : 0;
  };

  const getUtilityTasa = (utilityId) => {
    const utilitySeleccionado = utility.find((u) => u.utilidad_id === parseInt(utilityId, 10));
    return utilitySeleccionado ? parseFloat(utilitySeleccionado.tasa) : 0;
  };

  // Calcular precio de venta automáticamente
  useEffect(() => {
    if (products.precioCompra && products.ivaP_id && products.utilidadP_id) {
      const ivaRate = getIvaTasa(products.ivaP_id);
      const utilityRate = getUtilityTasa(products.utilidadP_id);
      const precioUnitario = parseFloat(products.precioCompra);

      if (!isNaN(precioUnitario) && precioUnitario > 0) {
        const precioVenta = precioUnitario * (1 + utilityRate) * (1 + ivaRate);
        const precioVentaRedondeado = precioVenta.toFixed(2);

        setProducts((prevProducts) => ({
          ...prevProducts,
          precioVenta: precioVentaRedondeado,
        }));
      }
    }
  }, [products.precioCompra, products.utilidadP_id, products.ivaP_id, iva, utility]);

  const handleChanges = (e) => {
    setProducts({
      ...products,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setProducts({
      codigo: "",
      nombre: "",
      precioVenta: "",
      stock: "",
      proveedorP_id: "",
      categoriaP_id: "",
      ivaP_id: "",
      utilidadP_id: "",
      precioCompra: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !products.codigo.trim() ||
      !products.nombre.trim() ||
      !products.stock ||
      !products.proveedorP_id ||
      !products.categoriaP_id ||
      !products.precioCompra ||
      !products.ivaP_id ||
      !products.utilidadP_id
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Validar números positivos
    const stock = parseFloat(products.stock);
    const precioCompra = parseFloat(products.precioCompra);
    const precioVenta = parseFloat(products.precioVenta);

    if (stock <= 0 || precioCompra <= 0 || precioVenta <= 0) {
      toast.error("Los precios y la cantidad deben ser números positivos");
      return;
    }

    // Confirmar antes de guardar
    confirmarCreacion("este producto", async () => {
      setLoading(true);

      try {
        // Insertar producto
        const productResponse = await axios.post("/api/table", {
          ...products,
          codigo: products.codigo.trim(),
          nombre: products.nombre.trim(),
        });

        const productId = productResponse.data.id;

        // Registrar entrada en inventario
        await axios.post("/api/movimientos/productos", {
          productoR_id: productId,
          fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
          tipo_operacion: "entrada",
          cantidad: parseInt(products.stock),
          nombre: products.nombre.trim(),
        });

        toast.success("Producto registrado exitosamente");
        limpiarFormulario();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error al registrar el producto"
        );
      } finally {
        setLoading(false);
      }
    });
  };

  if (loadingData) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center py-8">
      <div className="p-8 max-w-3xl w-full bg-cyan-950 text-white rounded-lg shadow-md">
        <ToastContainer />
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Registrar Nuevo Producto
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="codigo" className="text-sm font-medium mb-2 flex items-center">
                <FaBarcode className="mr-2" />
                Código del Producto *
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                className="w-full border rounded p-2 text-black"
                placeholder="Código del producto"
                value={products.codigo}
                onChange={handleChanges}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="nombre" className="text-sm font-medium mb-2 flex items-center">
                <FaTags className="mr-2" />
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="w-full border rounded p-2 text-black"
                placeholder="Nombre del producto"
                value={products.nombre}
                onChange={handleChanges}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stock" className="text-sm font-medium mb-2 flex items-center">
                <FaCubes className="mr-2" />
                Cantidad *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="1"
                className="w-full border rounded p-2 text-black"
                placeholder="Cantidad"
                value={products.stock}
                onChange={handleChanges}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="precioCompra" className="text-sm font-medium mb-2 flex items-center">
                <FaDollarSign className="mr-2" />
                Precio de Compra *
              </label>
              <input
                type="number"
                id="precioCompra"
                name="precioCompra"
                step="0.01"
                min="0"
                className="w-full border rounded p-2 text-black"
                placeholder="0.00"
                value={products.precioCompra}
                onChange={handleChanges}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="utilidadP_id" className="text-sm font-medium mb-2 flex items-center">
                <FaPercent className="mr-2" />
                Utilidad *
              </label>
              <select
                id="utilidadP_id"
                name="utilidadP_id"
                className="w-full border rounded p-2 text-black"
                value={products.utilidadP_id}
                onChange={handleChanges}
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                {utility.map((u) => (
                  <option key={u.utilidad_id} value={u.utilidad_id}>
                    {u.tasa}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ivaP_id" className="text-sm font-medium mb-2 flex items-center">
                <FaPercent className="mr-2" />
                IVA *
              </label>
              <select
                id="ivaP_id"
                name="ivaP_id"
                className="w-full border rounded p-2 text-black"
                value={products.ivaP_id}
                onChange={handleChanges}
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                {iva.map((i) => (
                  <option key={i.iva_id} value={i.iva_id}>
                    {i.tasa}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="precioVenta" className="text-sm font-medium mb-2 flex items-center">
                <FaDollarSign className="mr-2" />
                Precio de Venta (Calculado)
              </label>
              <input
                type="text"
                id="precioVenta"
                name="precioVenta"
                className="w-full border rounded p-2 text-black bg-gray-100"
                value={products.precioVenta ? `₡${products.precioVenta}` : ""}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="proveedorP_id" className="text-sm font-medium mb-2 flex items-center">
                <FaTruck className="mr-2" />
                Proveedor *
              </label>
              <select
                id="proveedorP_id"
                name="proveedorP_id"
                className="w-full border rounded p-2 text-black"
                value={products.proveedorP_id}
                onChange={handleChanges}
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                {providers.map((provider) => (
                  <option key={provider.proveedor_id} value={provider.proveedor_id}>
                    {provider.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoriaP_id" className="text-sm font-medium mb-2 flex items-center">
                <FaTags className="mr-2" />
                Categoría *
              </label>
              <select
                id="categoriaP_id"
                name="categoriaP_id"
                className="w-full border rounded p-2 text-black"
                value={products.categoriaP_id}
                onChange={handleChanges}
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                {categories.map((category) => (
                  <option key={category.categoria_id} value={category.categoria_id}>
                    {category.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
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
                {loading ? "Guardando..." : "Registrar Producto"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;