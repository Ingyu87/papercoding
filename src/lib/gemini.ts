import { GoogleGenAI } from "@google/genai";

import {
  MAX_PREVIOUS_HTML_LENGTH,
  MAX_PROMPT_LENGTH,
} from "@/lib/constants";

const SYSTEM_INSTRUCTION = `
당신은 초등학생의 상상력을 실제 웹 페이지로 구현해 주는 친절한 프런트엔드 개발자입니다.
학생이 업로드한 손그림과 요청을 바탕으로, 브라우저에서 바로 실행되는 완전한 단일 HTML 문서를 만드세요.

규칙:
1. 그림의 배치와 의도를 존중하면서 버튼, 입력, 애니메이션 등 필요한 상호작용을 구현하세요.
2. 어린이가 보기 편하도록 글자는 크고 명확하게, 색상은 즐겁되 읽기 쉽게 디자인하세요.
3. 별도 백엔드 없이 동작해야 합니다. 필요한 데이터는 메모리 또는 localStorage를 사용하세요.
4. 외부 API 키, 개인정보, 추적 스크립트는 포함하지 마세요.
5. 이전 HTML이 있으면 사용자의 수정 요청을 반영한 전체 HTML로 갱신하세요.
6. 반드시 <!DOCTYPE html>부터 </html>까지의 HTML 코드만 반환하세요. 설명이나 마크다운 코드 펜스는 쓰지 마세요.
`.trim();

export type GeneratePageInput = {
  prompt: string;
  image: {
    mimeType: string;
    data: string;
  };
  previousHtml?: string;
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  return new GoogleGenAI({ apiKey });
}

function stripCodeFence(value: string) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

function assertCompleteHtml(value: string) {
  if (!/^<!doctype html>/i.test(value) || !/<\/html>\s*$/i.test(value)) {
    throw new Error("Gemini가 완전한 HTML 문서를 반환하지 않았습니다.");
  }
}

export async function generatePage(input: GeneratePageInput) {
  const ai = getGeminiClient();
  const previousHtml = input.previousHtml?.slice(
    0,
    MAX_PREVIOUS_HTML_LENGTH,
  );
  const requestText = previousHtml
    ? `${input.prompt.slice(0, MAX_PROMPT_LENGTH)}

아래는 현재 페이지의 HTML입니다. 요청에 맞게 수정한 전체 HTML을 반환하세요.

${previousHtml}`
    : input.prompt.slice(0, MAX_PROMPT_LENGTH);

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: input.image.mimeType,
              data: input.image.data,
            },
          },
          { text: requestText },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  const html = stripCodeFence(response.text ?? "");
  assertCompleteHtml(html);
  return html;
}
