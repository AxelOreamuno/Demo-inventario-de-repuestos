'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { FaHome, FaUserFriends, FaWrench, FaRegListAlt, FaPaste, FaChevronDown, FaBars, FaExchangeAlt,FaStore } from 'react-icons/fa';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown("");
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  const routes = [
    { href: '/dashboard/registro', name: 'Registro', subroutes: ['Repuestos', 'Proveedores', 'Facturas'], icon: <FaRegListAlt className="h-5 w-5" /> },
    { href: '/dashboard/movimientos', name: 'Movimientos', subroutes: ['Facturas', 'Proveedores', 'Repuestos'], icon: <FaExchangeAlt className="h-5 w-5" /> }
  ];

  const singleRoutes = [
    { href: '/dashboard/repuestosAlmacen', name: 'Repuestos', icon: <FaWrench className="h-5 w-5" /> },
    { href: '/dashboard/proveedoresTotal', name: 'Proveedores', icon: <FaUserFriends className="h-5 w-5" /> },
    { href: '/dashboard/salidas', name: 'Salidas', icon: <FaStore className="h-5 w-5" /> },
    
  ];

  return (
    <div className='pt-16'>
    <nav className="fixed top-0 w-full flex items-center justify-between p-6 bg-cyan-950 text-white">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard">
          <span className="text-lg font-bold flex items-center space-x-2 ml-12">
            <FaHome className="h-5 w-5" /><span>Demo</span>
          </span>
        </Link>
      </div>
      <div className="lg:hidden">
        <button className="focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
          <FaBars size={24} />
        </button>
      </div>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? "block" : "hidden"} lg:flex lg:items-center lg:space-x-8`}>
        {routes.map((route) => (
          <div key={route.href} className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer hover:shadow-md p-2 rounded-md" onClick={() => toggleDropdown(route.name)}>
              {route.icon}
              <span>{route.name}</span>
              {route.subroutes ? <FaChevronDown size={12} className={`transition-all duration-200 transform ${activeDropdown === route.name ? 'rotate-180' : ''} ${isOpen ? 'rotate-180' : ''}`} /> : null}
            </div>
            {activeDropdown === route.name && route.subroutes && (
              <div className="absolute z-10 mt-2 py-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-500 ease-in-out transform scale-0 group-hover:scale-100">
                {route.subroutes.map((subroute) => (
                  <Link key={subroute} href={`/dashboard/${route.name.toLowerCase()}/${subroute.toLowerCase().replace(/\s+/g, "-")}`}>
                    <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">
                      {subroute}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {singleRoutes.map((route) => (
          <Link href={route.href} key={route.href}>
            <div className="flex items-center space-x-2 cursor-pointer hover:shadow-md p-2 rounded-md">
              {route.icon}
              <span>{route.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
    </div>
  );
};

export default Navbar;