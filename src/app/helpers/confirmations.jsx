import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export const mostrarConfirmacion = (titulo, mensaje, onConfirmar) => {
  confirmAlert({
    title: titulo,
    message: mensaje,
    buttons: [
      {
        label: "Sí",
        onClick: onConfirmar,
      },
      {
        label: "No",
      },
    ],
  });
};

export const confirmarEliminacion = (elemento, onConfirmar) => {
  mostrarConfirmacion(
    "Confirmar eliminación",
    `¿Estás seguro de que quieres eliminar ${elemento}?`,
    onConfirmar
  );
};

export const confirmarCreacion = (elemento, onConfirmar) => {
  mostrarConfirmacion(
    "Confirmar creación",
    `¿Estás seguro de que quieres crear ${elemento}?`,
    onConfirmar
  );
};

export const confirmarActualizacion = (elemento, onConfirmar) => {
  mostrarConfirmacion(
    "Confirmar actualización",
    `¿Estás seguro de que quieres actualizar ${elemento}?`,
    onConfirmar
  );
};

export const confirmarCerrarSesion = (onConfirmar) => {
  mostrarConfirmacion(
    "Cerrar sesión",
    "¿Estás seguro que deseas cerrar sesión?",
    onConfirmar
  );
};