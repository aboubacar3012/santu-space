import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/server/auth";

export async function parseJson<T>(request: Request, schema: { parse: (value: unknown) => T }) {
  return schema.parse(await request.json());
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 422 });
  }
  console.error("API Santu Space:", error);
  return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
}
