"use client";

import {
  Bot,
  Download,
  ImageIcon,
  LockKeyhole,
  MessageSquare,
  MonitorPlay,
  Palette,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_PROMPT_LENGTH,
} from "@/lib/constants";

type UploadedImage = {
  name: string;
  previewUrl: string;
  data: string;
  mimeType: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
};

type Toast = {
  id: string;
  message: string;
  type: "info" | "success" | "error";
};

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "model",
  text: "안녕! 손으로 그린 멋진 아이디어를 사진으로 보여 줘. 움직이는 웹 페이지로 만들어 줄게! 🎨",
};

const DEFAULT_PROMPT = "이 그림을 보고 재미있게 움직이는 웹 페이지로 만들어 줘!";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

function createId() {
  return crypto.randomUUID();
}

export function VibeCodingStudio() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [currentHtml, setCurrentHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    return () => activeRequestRef.current?.abort();
  }, []);

  function showToast(message: string, type: Toast["type"] = "info") {
    const id = createId();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
      )
    ) {
      showToast("PNG, JPG, WEBP 이미지만 올릴 수 있어요.", "error");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      showToast("이미지는 3MB 이하로 올려 주세요.", "error");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const [, data = ""] = dataUrl.split(",", 2);

      setImage({
        name: file.name,
        previewUrl: dataUrl,
        data,
        mimeType: file.type,
      });
      setPrompt((value) => value || DEFAULT_PROMPT);
    } catch {
      showToast("이미지를 읽지 못했습니다.", "error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!image || !cleanPrompt || isGenerating) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: cleanPrompt,
    };
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setIsGenerating(true);

    const controller = new AbortController();
    activeRequestRef.current?.abort();
    activeRequestRef.current = controller;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: cleanPrompt,
          image: {
            mimeType: image.mimeType,
            data: image.data,
          },
          previousHtml: currentHtml || undefined,
        }),
      });
      const result = (await response.json()) as {
        html?: string;
        error?: string;
      };

      if (!response.ok || !result.html) {
        throw new Error(result.error || "페이지 생성에 실패했습니다.");
      }

      if (controller.signal.aborted) return;

      setCurrentHtml(result.html);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "model",
          text: currentHtml
            ? "수정했어! 오른쪽 미리보기에서 달라진 모습을 확인해 봐. ✨"
            : "완성했어! 오른쪽 미리보기에서 직접 눌러 보고 움직여 봐. ✨",
        },
      ]);
      showToast("새 페이지가 완성됐어요.", "success");
    } catch (error) {
      if (controller.signal.aborted) return;

      const message =
        error instanceof Error ? error.message : "페이지 생성에 실패했습니다.";
      setMessages((current) => [
        ...current,
        { id: createId(), role: "model", text: `앗, ${message}` },
      ]);
      showToast(message, "error");
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setIsGenerating(false);
      }
    }
  }

  function handleDownload() {
    if (!currentHtml) return;

    const blob = new Blob(["\uFEFF", currentHtml], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "my-vibe-app.html";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast("HTML 파일을 내려받았어요.", "success");
  }

  function handleReset() {
    if (
      currentHtml &&
      !window.confirm("지금까지 만든 내용을 지우고 처음부터 시작할까요?")
    ) {
      return;
    }

    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setImage(null);
    setPrompt("");
    setMessages([INITIAL_MESSAGE]);
    setCurrentHtml("");
    setIsGenerating(false);
    showToast("새 도화지를 준비했어요.", "success");
  }

  return (
    <main className="studio-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="도화지 바이브 코딩 홈">
          <span className="brand-mark">
            <Palette size={24} aria-hidden />
          </span>
          <span>
            <strong>도화지</strong>
            <small>VIBE CODING STUDIO</small>
          </span>
        </a>

        <div className="header-actions">
          <button className="button button-ghost" onClick={handleReset}>
            <RotateCcw size={17} />
            <span>초기화</span>
          </button>
          {currentHtml && (
            <button className="button button-dark" onClick={handleDownload}>
              <Download size={17} />
              <span>HTML 저장</span>
            </button>
          )}
        </div>
      </header>

      <section className="workspace">
        <aside className="control-panel">
          <div className="intro">
            <span className="eyebrow">
              <Sparkles size={14} />
              상상을 웹으로
            </span>
            <h1>그림 한 장이면<br />시작할 수 있어요.</h1>
            <p>손그림을 올리고, 만들고 싶은 움직임을 AI에게 이야기해 보세요.</p>
          </div>

          <section className="panel upload-panel">
            <div className="panel-heading">
              <span className="step">01</span>
              <div>
                <h2>스케치 올리기</h2>
                <p>PNG, JPG, WEBP · 최대 3MB</p>
              </div>
              <ImageIcon size={20} />
            </div>

            <button
              className={`upload-zone ${image ? "has-image" : ""}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={image ? "다른 이미지 선택" : "스케치 이미지 선택"}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleFileChange}
                hidden
              />
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.previewUrl} alt="업로드한 스케치 미리보기" />
                  <span className="replace-image">
                    <RefreshCw size={14} />
                    다른 그림
                  </span>
                </>
              ) : (
                <span className="upload-empty">
                  <span className="upload-icon">
                    <UploadCloud size={27} />
                  </span>
                  <strong>그림을 여기에 올려 주세요</strong>
                  <small>클릭해서 이미지 선택</small>
                </span>
              )}
            </button>
          </section>

          <section className="panel chat-panel">
            <div className="panel-heading">
              <span className="step step-purple">02</span>
              <div>
                <h2>AI와 만들기</h2>
                <p>원하는 모습을 자유롭게 말해 보세요</p>
              </div>
              <MessageSquare size={20} />
            </div>

            <div className="chat-history" aria-live="polite">
              {messages.map((message) => (
                <div
                  className={`chat-row ${message.role === "user" ? "user" : ""}`}
                  key={message.id}
                >
                  <span className={`avatar ${message.role}`}>
                    {message.role === "user" ? (
                      <User size={15} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </span>
                  <p>{message.text}</p>
                </div>
              ))}
              {isGenerating && (
                <div className="chat-row">
                  <span className="avatar model">
                    <Bot size={16} />
                  </span>
                  <p className="thinking">
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="prompt-form" onSubmit={handleSubmit}>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder={
                  image
                    ? "예: 버튼을 누르면 별이 반짝이게 해 줘"
                    : "먼저 스케치 이미지를 올려 주세요"
                }
                disabled={!image || isGenerating}
                rows={2}
                aria-label="AI에게 보낼 요청"
              />
              <button
                className="send-button"
                type="submit"
                disabled={!image || !prompt.trim() || isGenerating}
                aria-label="요청 보내기"
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </aside>

        <section className="preview-panel">
          <div className="browser-bar">
            <span className="traffic-lights" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="address">
              <LockKeyhole size={12} />
              안전한 미리보기
            </span>
            <span className="live-badge">
              <i />
              LIVE
            </span>
          </div>

          <div className="preview-canvas">
            {currentHtml ? (
              <iframe
                key={currentHtml}
                title="AI가 생성한 웹 페이지 미리보기"
                srcDoc={currentHtml}
                sandbox="allow-scripts allow-forms allow-modals allow-downloads"
              />
            ) : (
              <div className="empty-preview">
                <span className="empty-icon">
                  <MonitorPlay size={38} />
                </span>
                <h2>여기가 마법의 화면이에요</h2>
                <p>
                  왼쪽에서 그림을 올리고 AI에게 부탁하면
                  <br />
                  완성된 웹 페이지를 바로 체험할 수 있어요.
                </p>
                <div className="empty-steps">
                  <span><b>1</b> 그림 올리기</span>
                  <i />
                  <span><b>2</b> AI에게 말하기</span>
                  <i />
                  <span><b>3</b> 직접 체험하기</span>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="generation-overlay">
                <span className="magic-loader">
                  <Sparkles size={28} />
                </span>
                <strong>
                  {currentHtml ? "페이지를 고치는 중..." : "상상을 코딩하는 중..."}
                </strong>
                <p>잠시만 기다려 주세요. 멋진 페이지가 곧 완성돼요!</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <footer>
        <span>© 2026 도화지 바이브 코딩</span>
        <span className="footer-note">
          <LockKeyhole size={12} />
          Gemini API 키는 서버에서 안전하게 보호됩니다
        </span>
      </footer>

      <div className="toast-stack" aria-live="assertive">
        {toasts.map((toast) => (
          <div className={`toast ${toast.type}`} key={toast.id}>
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
              aria-label="알림 닫기"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
