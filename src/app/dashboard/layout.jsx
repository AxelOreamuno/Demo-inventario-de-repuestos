'use client'
import React, { useState } from 'react';
import Navbar from './components/navbar';
import Navsidebar from './components/sidebar';
import { FaBars } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import '.././globals.css';

import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <Navbar />
      <div className="flex bg-gray-200">
        <div className={`fixed top-0 left-0 h-screen w-10 ${isSidebarOpen ? 'ml-0' : '-ml-64'}`} style={{ transition: 'margin-left 0.3s' }}>
          {isSidebarOpen && <Navsidebar />}
        </div>
        <div className={`flex-1 p-4 overflow-y-auto bg-white-200 ml-0`} style={{ transition: 'margin-left 0.3s' }}>
          {isSidebarOpen ? (
            /* Botón para cerrar el sidebar cuando está abierto */
            <button
              className={`fixed top-9 left-4 z-10 text-white ${isSidebarOpen ? 'block' : 'hidden'}`}
              onClick={toggleSidebar}
            >
              <FaTimes />
            </button>
          ) : (
            /* Botón para abrir el sidebar cuando está cerrado */
            <button
              className={`fixed top-9 left-4 z-10 text-white ${isSidebarOpen ? 'hidden' : 'block'}`}
              onClick={toggleSidebar}
            >
              <FaBars />
            </button>
          )}
          {children}
        </div>
      </div>
      <footer className="mt-auto bg-cyan-950 text-gray-200 text-center py-4 border-t border-gray-300">
        <p>Derechos reservados © Demo</p>
      </footer>
    </div>
  );
}
