import { conn } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalUsersResult = await conn.query(
      "SELECT COUNT(*) AS totalUsers FROM Usuarios"
    );
    const totalUsers = totalUsersResult[0].totalUsers;

    const results = { totalUsers };

    return NextResponse.json(results);
  } catch (error) {
    //console.log(error);
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