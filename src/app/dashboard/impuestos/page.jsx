'use client'
import React, { useState, useEffect } from 'react';
import { FaSave, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmarCreacion, confirmarEliminacion } from '@/app/helpers/confirmations';

function Tax() {
  const [tasas, setTasas] = useState([]);
  const [taxTasa, setTaxTasa] = useState('');
  const [utilidadTasa, setUtilidadTasa] = useState('');
  const [activeTab, setActiveTab] = useState('iva');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/${activeTab}`);
        setTasas(response.data.map(item => ({ id: item.id, value: item.tasa })));
      } catch (error) {
        toast.error('Error al cargar las tasas de impuestos');
      }
    }
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getTasaActual = () => activeTab === 'iva' ? taxTasa : utilidadTasa;
  const getTipoTasa = () => activeTab === 'iva' ? 'IVA' : 'Utilidad';

  const validarTasa = (tasa) => {
    if (!tasa || tasa.trim() === '') {
      toast.warn(`El campo de tasa de ${getTipoTasa()} es obligatorio`);
      return false;
    }
    
    const tasaNum = parseFloat(tasa);
    if (isNaN(tasaNum) || tasaNum < 0 || tasaNum > 100) {
      toast.warn('La tasa debe ser un número entre 0 y 100');
      return false;
    }
    
    return true;
  };

  const showSaveConfirmation = () => {
    const tasa = getTasaActual();

    if (!validarTasa(tasa)) {
      return;
    }

    confirmarCreacion(`esta tasa de ${getTipoTasa()}`, () => {
      handleSaveTasa();
    });
  };

  const handleSaveTasa = async () => {
    const tasa = getTasaActual();

    try {
      const response = await axios.post(`/api/${activeTab}`, { tasa });
      const nuevoId = response.data.id;
      toast.success(`Tasa de ${getTipoTasa()} registrada con éxito`);
      setTasas([...tasas, { id: nuevoId, value: tasa }]);

      if (activeTab === 'iva') {
        setTaxTasa('');
      } else {
        setUtilidadTasa('');
      }
    } catch (error) {
      toast.error(`Error al guardar la tasa de ${getTipoTasa()}`);
    }
  };

  const showDeleteConfirmation = (tasaId) => {
    confirmarEliminacion(`esta tasa de ${getTipoTasa()}`, () => {
      handleDeleteTasa(tasaId);
    });
  };

  const handleDeleteTasa = async (tasaId) => {
    try {
      await axios.delete(`/api/${activeTab}/${tasaId}`);
      toast.success(`Tasa de ${getTipoTasa()} eliminada con éxito`);
      setTasas(tasas.filter(tasa => tasa.id !== tasaId));
    } catch (error) {
      toast.error(`Error al eliminar la tasa de ${getTipoTasa()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="max-w-4xl w-full p-5 bg-cyan-950 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-200 mb-8">Administrador de Impuestos</h1>

        <div className="flex mb-6">
          <button
            onClick={() => handleTabChange('iva')}
            className={`mr-2 mb-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition ${
              activeTab === 'iva' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            IVA
          </button>
          <button
            onClick={() => handleTabChange('utilidad')}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition ${
              activeTab === 'utilidad' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Utilidad
          </button>
        </div>

        <form onSubmit={(e) => {e.preventDefault(); showSaveConfirmation();}} className="mb-6">
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2">
                {`Tasa de ${getTipoTasa()}`}
              </label>
              <div className="flex items-center border-b border-gray-300 py-2">
                <input
                  className="appearance-none bg-transparent border-none w-full text-gray-200 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Ingrese la tasa (0-100)"
                  value={getTasaActual()}
                  onChange={(e) => (activeTab === 'iva' ? setTaxTasa(e.target.value) : setUtilidadTasa(e.target.value))}
                />
                <span className="text-gray-200">%</span>
              </div>
            </div>
            <div className="w-full md:w-1/2 px-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition"
              >
                <FaSave className="inline mr-2" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>

        <div className="bg-gray-500 p-4 rounded-md">
          <h2 className="text-white font-semibold mb-3">IVA o tasas Registradas</h2>
          {tasas.length === 0 ? (
            <p className="text-gray-300 text-center py-4">No hay IVA o tasas registradas</p>
          ) : (
            <ul>
              {tasas.map((tasa) => (
                <li key={tasa.id} className="flex justify-between items-center py-2 border-b border-gray-400 last:border-0">
                  <span className="text-white font-medium">{tasa.value}%</span>
                  <button
                    onClick={() => showDeleteConfirmation(tasa.id)}
                    className="text-red-400 hover:text-red-600 transition"
                    aria-label="Eliminar tasa"
                  >
                    <FaTrashAlt />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Tax;