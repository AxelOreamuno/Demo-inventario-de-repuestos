import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { conn } from "@/libs/mysql";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@test.com",
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        try {
          // Validar credenciales
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña son requeridos");
          }

          // Buscar usuario en BD
          const result = await conn.query(
            "SELECT * FROM Usuarios WHERE email = ?",
            [credentials.email]
          );

          // Verificar que existe
          if (!result || result.length === 0) {
            throw new Error("Credenciales inválidas");
          }

          const user = result[0];

          // CRÍTICO: Verificar password con bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Credenciales inválidas");
          }

          // Retornar usuario sin password
          return {
            id: user.usuario_id,
            email: user.email,
            nombre: user.nombre_completo,
            nombre_usuario: user.nombre_usuario,
          };
        } catch (error) {
          throw new Error("Error de autenticación");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nombre = user.nombre;
        token.nombre_usuario = user.nombre_usuario;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          nombre: token.nombre,
          nombre_usuario: token.nombre_usuario,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };