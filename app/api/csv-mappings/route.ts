import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { csvMappingSchema } from "@/lib/validations";

export async function GET() {
  try {
    const mappings = await prisma.cSVMapping.findMany({
      orderBy: { institution: "asc" },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error("Error fetching CSV mappings:", error);
    return NextResponse.json(
      { error: "Failed to fetch CSV mappings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = csvMappingSchema.parse(body);

    const mapping = await prisma.cSVMapping.upsert({
      where: { institution: validated.institution },
      update: {
        fieldMapping: validated.fieldMapping,
        dateFormat: validated.dateFormat,
      },
      create: {
        institution: validated.institution,
        fieldMapping: validated.fieldMapping,
        dateFormat: validated.dateFormat,
      },
    });

    return NextResponse.json(mapping);
  } catch (error) {
    console.error("Error creating/updating CSV mapping:", error);
    return NextResponse.json(
      { error: "Failed to create/update CSV mapping" },
      { status: 500 }
    );
  }
}
