import { NextResponse } from "next/server";
import { z } from "zod";
import { getTemplate } from "@/lib/followup";
import { LeadStage, leadStages } from "@/lib/db";

const requestSchema = z.object({
  name: z.string(),
  stage: z.enum(leadStages),
  context: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "" }, { status: 400 });
  }

  const { name, stage, context } = parsed.data;
  const fallback = getTemplate(stage as LeadStage, name);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: fallback, source: "template" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant generating concise, friendly real estate follow-up messages.",
          },
          {
            role: "user",
            content: `Create a short follow-up for ${name} who is in the ${stage} stage. Notes: ${context || "no extra context"}.`,
          },
        ],
        max_tokens: 80,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: fallback, source: "template" });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ message: message || fallback, source: "ai" });
  } catch (error) {
    return NextResponse.json({ message: fallback, source: "template" });
  }
}
