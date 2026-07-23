# 도화지 바이브 코딩

손그림 스케치와 자연어 요청을 Gemini에 보내, 브라우저에서 바로 실행할 수 있는 단일 HTML 페이지를 만드는 Next.js 앱입니다.

## 로컬 실행

Node.js 20.9 이상과 pnpm이 필요합니다.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

`.env.local`에 Google AI Studio에서 발급한 키를 입력하세요.

```dotenv
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY`에는 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. API 키는 `/api/generate` 서버 라우트에서만 사용됩니다.

## GitHub와 Vercel 배포

1. 이 저장소를 GitHub에 푸시합니다.
2. Vercel에서 **Add New → Project**로 저장소를 가져옵니다.
3. 프로젝트의 **Settings → Environment Variables**에서 `GEMINI_API_KEY`를 Production, Preview, Development에 추가합니다.
4. 선택적으로 `GEMINI_MODEL`을 추가합니다. 설정하지 않으면 `gemini-2.5-flash`를 사용합니다.
5. 배포합니다. 프레임워크와 빌드 명령은 Vercel이 자동으로 인식합니다.

## 주요 구조

- `src/components/vibe-coding-studio.tsx`: 업로드, 대화, 미리보기 UI와 클라이언트 상태
- `src/app/api/generate/route.ts`: 입력 검증과 서버 API 엔드포인트
- `src/lib/gemini.ts`: Gemini 프롬프트 및 응답 처리
- `src/lib/constants.ts`: 클라이언트와 서버가 공유하는 제한값

생성된 HTML은 `sandbox` 속성이 적용된 iframe 안에서만 실행됩니다.
