import jsPDF from "jspdf";
import "jspdf-autotable";

export const SellPdf = (data) => {
    const doc = new jsPDF();
    doc.text("Reporte de ventas", 20, 10);
    doc.autoTable({
      head: [
        [
          "Producto",
          "Cantidad",
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
  