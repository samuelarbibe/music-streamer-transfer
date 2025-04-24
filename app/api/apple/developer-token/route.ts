import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const TEAM_ID = process.env.APPLE_TEAM_ID!;
const KEY_ID = process.env.APPLE_KEY_ID!;

const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

export async function GET() {
  try {
    const token = jwt.sign({}, privateKey, {
      algorithm: "ES256",
      expiresIn: "180d",
      issuer: TEAM_ID,
      header: {
        alg: "ES256",
        kid: KEY_ID,
      },
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("Failed to generate token:", err);
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 }
    );
  }
}
