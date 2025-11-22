"use client";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import xml2js from "xml2js";

export default function BillsRegister() {
  const [productos, setProductos] = useState([]);
  const [facturaXML, setFacturaXML] = useState("");
  const [categories, setCategories] = useState([]);
  const [iva, setIva] = useState([]);
  const [selectedIva, setSelectedIva] = useState("");
  const [utility, setUtility] = useState([]);
  const [selectedUtility, setSelectedUtility] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [providers, setProviders] = useState([]);
  const [fecha, setFecha] = useState("");
  const [codigoFactura, setCodigoFactura] = useState("");
  const [totalComprobante, setTotalComprobante] = useState(0);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, ivaRes, utilidadRes, providersRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/iva"),
          axios.get("/api/utilidad"),
          axios.get("/api/proveedores"),
        ]);
        
        setCategories(categoriesRes.data.data);
        setIva(ivaRes.data);
        setUtility(utilidadRes.data);
        setProviders(providersRes.data);
      } catch (error) {
        toast.error('Error al cargar los datos iniciales');
      }
    };

    fetchInitialData();
  }, []);

  const getIvaTasa = (ivaId) => {
    const ivaSeleccionado = iva.find((i) => i.iva_id === parseInt(ivaId, 10));
    return ivaSeleccionado ? parseFloat(ivaSeleccionado.tasa) : 0;
  };

  const getUtilityTasa = (utilityId) => {
    const utilitySeleccionado = utility.find(
      (u) => u.utilidad_id === parseInt(utilityId, 10)
    );
    return utilitySeleccionado ? parseFloat(utilitySeleccionado.tasa) : 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFacturaXML(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseXML = () => {
    // Validaciones
    if (!facturaXML || !selectedProvider || !selectedIva || !selectedUtility || !fecha) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setProcessing(true);

    const parser = new xml2js.Parser();
    parser.parseString(facturaXML, (err, result) => {
      if (err) {
        toast.error('No se pudo procesar el archivo XML');
        setProcessing(false);
        return;
      }

      try {
        const lineasDetalle = result.FacturaElectronica.DetalleServicio[0].LineaDetalle;
        const codigoFactura = result.FacturaElectronica.NumeroConsecutivo[0];
        const totalComprobante = result.FacturaElectronica.ResumenFactura[0].TotalComprobante;

        setCodigoFactura(codigoFactura);
        setTotalComprobante(totalComprobante);

        // Calcular tasas
        const ivaRate = getIvaTasa(selectedIva);
        const utilityRate = getUtilityTasa(selectedUtility);

        // Procesar productos
        const productosNuevos = lineasDetalle.map((linea) => {
          const codigoComercial = linea.CodigoComercial[0].Codigo[0];
          const precioUnitario = parseFloat(linea.PrecioUnitario[0]);
          const precioTotal = parseFloat(linea.MontoTotal[0]);

          // Calcular precio de venta con IVA y utilidad
          const precioVenta = precioUnitario * (1 + utilityRate) * (1 + ivaRate);
          const precioVentaRedondeado = precioVenta.toFixed(2);

          return {
            codigo: codigoComercial,
            nombre: linea.Detalle[0],
            stock: linea.Cantidad[0],
            precioUnitario: precioUnitario,
            montoTotal: precioTotal,
            categoriaP_id: "",
            ivaP_id: selectedIva,
            utilidadP_id: selectedUtility,
            proveedorP_id: selectedProvider,
            precioVenta: precioVentaRedondeado,
          };
        });

        setProductos(productosNuevos);
        toast.success(`${productosNuevos.length} productos procesados correctamente`);
      } catch (error) {
        toast.error('Error al procesar los datos de la factura');
      } finally {
        setProcessing(false);
      }
    });
  };

  const handleChanges = (e, index) => {
    const newProductos = [...productos];
    newProductos[index][e.target.name] = e.target.value;
    setProductos(newProductos);
  };

  const handleIvaChange = (e) => {
    const newValue = e.target.value;
    setSelectedIva(newValue);

    if (productos.length > 0) {
      const newProductos = productos.map((producto) => ({
        ...producto,
        ivaP_id: newValue,
      }));
      setProductos(newProductos);
    }
  };

  const handleUtilityChange = (e) => {
    const newValue = e.target.value;
    setSelectedUtility(newValue);

    if (productos.length > 0) {
      const newProductos = productos.map((producto) => ({
        ...producto,
        utilidadP_id: newValue,
      }));
      setProductos(newProductos);
    }
  };

  const handleProviderChange = (e) => {
    const newValue = e.target.value;
    setSelectedProvider(newValue);

    if (productos.length > 0) {
      const newProductos = productos.map((producto) => ({
        ...producto,
        proveedorP_id: newValue,
      }));
      setProductos(newProductos);
    }
  };

  const limpiarDatosYScrollArriba = () => {
    setProductos([]);
    setFacturaXML("");
    setSelectedIva("");
    setSelectedUtility("");
    setSelectedProvider("");
    setFecha("");
    setCodigoFactura("");
    setTotalComprobante(0);
    setFileName("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnviar = async () => {
    // Validar que todos los productos tengan categoría
    const productosSinCategoria = productos.filter(p => !p.categoriaP_id);
    if (productosSinCategoria.length > 0) {
      toast.error('Por favor asigne una categoría a todos los productos');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos de productos
      const datosProductos = productos.map((producto) => ({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        proveedorP_id: producto.proveedorP_id,
        categoriaP_id: producto.categoriaP_id,
        ivaP_id: producto.ivaP_id,
        utilidadP_id: producto.utilidadP_id,
      }));

      // Guardar productos
      const productResponse = await axios.post("/api/facturas", datosProductos);

      if (productResponse.status === 200) {
        // Preparar datos de factura
        const datosFactura = {
          fecha: new Date(fecha).toISOString().slice(0, 19).replace("T", " "),
          total: totalComprobante,
          proveedor_id: selectedProvider,
          codigoFactura: codigoFactura,
        };

        // Preparar detalles de factura
        const detallesFactura = productos.map((producto) => ({
          nombreProducto: producto.nombre,
          cantidad: producto.stock,
          precio_compra: producto.precioUnitario,
        }));

        // Guardar factura y detalles
        await axios.post("/api/movimientos/facturas", {
          factura: datosFactura,
          detalles: detallesFactura,
        });

        // Registrar movimientos de inventario
        for (const producto of productos) {
          await axios.post("/api/movimientos/productos", {
            productoR_id: producto.productId,
            fecha: new Date(fecha).toISOString().slice(0, 19).replace("T", " "),
            tipo_operacion: "entrada",
            cantidad: parseInt(producto.stock),
            nombre: producto.nombre,
          });
        }

        toast.success('Factura procesada y guardada exitosamente');
        limpiarDatosYScrollArriba();
      }
    } catch (error) {
      toast.error('Error al procesar la factura. Verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-200 min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-cyan-950">Procesar Factura XML</h1>

      {/* Sección de carga de archivo */}
      <div className="flex items-center mb-6 gap-4">
        <div className="flex-1 p-6 border-2 border-dashed border-cyan-900 rounded-lg flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition">
          <label htmlFor="fileInput" className="cursor-pointer text-center">
            <div className="w-16 h-16 bg-cyan-900 text-white flex items-center justify-center rounded-lg mx-auto mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              {fileName ? `Archivo: ${fileName}` : "Haz clic para cargar archivo XML"}
            </p>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            accept=".xml"
          />
        </div>
        <button
          onClick={parseXML}
          disabled={!facturaXML || processing}
          className={`px-6 py-3 rounded-md font-medium transition ${
            !facturaXML || processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-cyan-900 hover:bg-cyan-800 text-white"
          }`}
        >
          {processing ? "Procesando..." : "Procesar XML"}
        </button>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label htmlFor="providerSelect" className="block font-medium mb-1">
            Proveedor *
          </label>
          <select
            id="providerSelect"
            value={selectedProvider}
            onChange={handleProviderChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            {providers.map((provider) => (
              <option key={provider.proveedor_id} value={provider.proveedor_id}>
                {provider.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ivaSelect" className="block font-medium mb-1">
            IVA *
          </label>
          <select
            id="ivaSelect"
            value={selectedIva}
            onChange={handleIvaChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            {iva.map((i) => (
              <option key={i.iva_id} value={i.iva_id}>
                {i.tasa}%
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="utilitySelect" className="block font-medium mb-1">
            Utilidad *
          </label>
          <select
            id="utilitySelect"
            value={selectedUtility}
            onChange={handleUtilityChange}
            className="w-full p-2 border rounded"
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
          <label htmlFor="fecha" className="block font-medium mb-1">
            Fecha *
          </label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="total" className="block font-medium mb-1">
            Total
          </label>
          <input
            readOnly
            type="text"
            id="total"
            value={`₡${totalComprobante}`}
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
      </div>

      {/* Tabla de productos */}
      {productos.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead className="bg-cyan-900 text-white">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Precio Unit.</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Categoría *</th>
                  <th className="px-4 py-3">Precio Venta</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr className="border-b hover:bg-gray-50" key={index}>
                    <td className="px-4 py-3">{producto.codigo}</td>
                    <td className="px-4 py-3">{producto.nombre}</td>
                    <td className="px-4 py-3 text-center">{producto.stock}</td>
                    <td className="px-4 py-3 text-right">₡{producto.precioUnitario}</td>
                    <td className="px-4 py-3 text-right">₡{producto.montoTotal}</td>
                    <td className="px-4 py-3">
                      <select
                        name="categoriaP_id"
                        value={producto.categoriaP_id}
                        onChange={(e) => handleChanges(e, index)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Seleccionar</option>
                        {categories.map((category) => (
                          <option
                            key={category.categoria_id}
                            value={category.categoria_id}
                          >
                            {category.nombre_categoria}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">₡{producto.precioVenta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={limpiarDatosYScrollArriba}
              className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviar}
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-900 hover:bg-cyan-800 text-white"
              }`}
            >
              {loading ? "Guardando..." : "Guardar Factura"}
            </button>
          </div>
        </>
      )}

      {productos.length === 0 && fileName && !processing && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className='text-gray-500'>
            Seleccione todos los campos y haga clic en &quot;Procesar XML&quot;
          </p>
        </div>
      )}
    </div>
  );
}