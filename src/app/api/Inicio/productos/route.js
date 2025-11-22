import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalProductsResult = await conn.query(
      "SELECT COUNT(*) AS totalProducts FROM Productos"
    );

    const totalProducts = totalProductsResult[0]?.totalProducts;
    const results = { totalProducts };

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}