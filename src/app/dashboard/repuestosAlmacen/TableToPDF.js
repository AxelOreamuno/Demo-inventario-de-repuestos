import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportCurrentPageToPDF = (currentItems) => {
  const doc = new jsPDF();
  doc.text("Reporte de Productos (Página Actual)", 20, 10);
  doc.autoTable({
    head: [
      [
        "Código",
        "Nombre",
        "Precio Venta",
        "Cantidad",
        "Proveedor",
        "Categoría",
      ],
    ],
    body: currentItems.map((item) => [
      item.codigo,
      item.nombre,
      item.precioVenta,
      item.stock,
      item.proveedor_nombre,
      item.categoria_nombre,
    ]),
  });
  doc.save("reporte-pagina-actual.pdf");
};

export const exportAllDataToPDF = (data) => {
  const doc = new jsPDF();
  doc.text("Reporte de Productos (Todos los Datos)", 20, 10);
  doc.autoTable({
    head: [
      [
        "Código",
        "Nombre",
        "Precio Venta",
        "Cantidad",
        "Proveedor",
        "Categoría",
      ],
    ],
    body: data.map((item) => [
      item.codigo,
      item.nombre,
      item.precioVenta,
      item.stock,
      item.proveedor_nombre,
      item.categoria_nombre,
    ]),
  });
  doc.save("reporte-todos-los-datos.pdf");
};
