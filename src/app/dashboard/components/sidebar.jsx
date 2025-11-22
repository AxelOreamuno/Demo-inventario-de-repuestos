import React from "react";
import Link from "next/link";
import { FaUserFriends, FaGg } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { signOut, useSession } from "next-auth/react";
import { MdCategory } from 'react-icons/md';
import { confirmarCerrarSesion } from "@/app/helpers/confirmations";

const Navsidebar = ({ isOpen }) => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    confirmarCerrarSesion(() => {
      signOut();
    });
  };

  const routes = [
    { href: "/dashboard/categorias", icon: <MdCategory className="h-5 w-5" /> },
    { href: "/dashboard/impuestos", icon: <FaGg className="h-5 w-5" /> },
  ];

  return (
    <div
      className={`fixed top-16 pl-1 px-2 py-80 bg-cyan-950 text-white flex flex-col items-center transition-all duration-500 ease-in-out ${
        isOpen ? "w-8" : "w-8"
      }`}
    >
      <div
        className={`flex-1 flex flex-col items-center justify-start ${
          isOpen ? "w-full" : "w-8"
        }`}
        style={{ marginTop: isOpen ? "-270px" : "-270px" }}
      >
        {routes.map((route) => (
          <div key={route.href} className="relative group">
            <Link href={route.href}>
              <button
                className={`flex flex-col items-center justify-center focus:outline-none p-2 hover:bg-gray-700 ${
                  isOpen ? "w-8" : "w-8"
                }`}
                style={{ marginBottom: isOpen ? "12px" : "6px" }}
              >
                {route.icon}
              </button>
            </Link>
          </div>
        ))}
        {session && (
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center focus:outline-none p-2 hover:bg-gray-700"
            style={{ marginBottom: isOpen ? "12px" : "6px" }}
          >
            <IoMdExit className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navsidebar;