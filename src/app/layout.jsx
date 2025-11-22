import SessionAuthProvider from "@/context/sessionAuthProvider";
import "./globals.css";
import { Inter } from "next/font/google";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Demo",
  description: "Demo de inventario de repuestos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
   
        <body className={inter.className}>
          <SessionAuthProvider>{children}</SessionAuthProvider>
          </body>
    
    </html>
  );
}
