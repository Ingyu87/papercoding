import { NextResponse } from "next/server";

import {
  ACCEPTED_IMAGE_TYPES,
  GENERATION_CUTOFF_AT,
  MAX_IMAGE_BYTES,
  MAX_PREVIOUS_HTML_LENGTH,
  MAX_PROMPT_LENGTH,
} from "@/lib/constants";
import { generatePage, type GeneratePageInput } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 300;

function isGeneratePageInput(value: unknown): value is GeneratePageInput {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  const image = body.image as Record<string, unknown> | undefined;

  return (
    typeof body.prompt === "string" &&
    body.prompt.trim().length > 0 &&
    body.prompt.length <= MAX_PROMPT_LENGTH &&
    (!body.previousHtml ||
      (typeof body.previousHtml === "string" &&
        body.previousHtml.length <= MAX_PREVIOUS_HTML_LENGTH)) &&
    !!image &&
    typeof image.mimeType === "string" &&
    ACCEPTED_IMAGE_TYPES.includes(
      image.mimeType as (typeof ACCEPTED_IMAGE_TYPES)[number],
    ) &&
    typeof image.data === "string" &&
    image.data.length > 0 &&
    image.data.length <= Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4
  );
}

export async function POST(request: Request) {
  if (Date.now() >= GENERATION_CUTOFF_AT) {
    return NextResponse.json(
      {
        error:
          "AI 생성 운영이 2026년 7월 26일 0시에 종료되었습니다.",
      },
      {
        status: 410,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const body: unknown = await request.json();

    if (!isGeneratePageInput(body)) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const result = await generatePage({
      ...body,
      prompt: body.prompt.trim(),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "페이지 생성에 실패했습니다.";
    const isConfigurationError = message.includes("GEMINI_API_KEY");

    console.error("Gemini generation failed:", message);

    return NextResponse.json(
      {
        error: isConfigurationError
          ? "서버에 Gemini API 키가 설정되지 않았습니다."
          : "AI가 페이지를 만드는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isConfigurationError ? 503 : 502 },
    );
  }
}
