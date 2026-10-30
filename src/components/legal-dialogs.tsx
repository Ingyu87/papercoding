"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function LegalDialogs() {
  const [page, setPage] = useState<"terms" | "privacy" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!page) return;
    const element = dialog.current;
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [page]);

  return (
    <>
      <nav className="legal-links" aria-label="서비스 정책">
        <button type="button" onClick={() => setPage("terms")}>이용약관</button>
        <button type="button" onClick={() => setPage("privacy")}>개인정보처리방침</button>
      </nav>
      {page && (
        <dialog ref={dialog} className="legal-dialog" aria-labelledby="legal-title"
          onCancel={() => setPage(null)}
          onClick={(event) => { if (event.target === event.currentTarget) setPage(null); }}>
          <div className="legal-card">
            <header className="legal-header">
              <div>
                <h2 id="legal-title">{page === "terms" ? "이용약관" : "개인정보처리방침"}</h2>
                <p>도화지 바이브 코딩 · 시행일 2026년 10월 30일</p>
              </div>
              <button type="button" className="legal-close" aria-label="닫기" onClick={() => setPage(null)} autoFocus><X size={22} /></button>
            </header>
            <div className="legal-content">
              <p className="legal-status">현재 AI 생성·수정 기능은 운영이 중단되어 있습니다.</p>
              {page === "terms" ? <>
                <section><h3>1. 서비스와 적용 범위</h3><p>도화지 바이브 코딩은 글과 그림으로 작성한 설계를 웹앱으로 표현하는 교육용 서비스입니다. 이 약관은 서비스 이용에 적용되며, 운영자는 백인규입니다. 현재 화면 열람은 가능하지만 AI 생성·수정 요청은 서버에서 차단됩니다.</p></section>
                <section><h3>2. 이용자의 자료와 책임</h3><p>직접 작성했거나 이용 권한이 있는 자료만 사용해 주세요. 학생의 이름·얼굴·학번·연락처 등 개인을 알아볼 수 있는 정보와 민감한 내용은 입력하지 마세요. 타인의 권리를 침해하는 자료, 유해한 콘텐츠, 서비스 장애를 일으키려는 요청은 허용하지 않습니다.</p></section>
                <section><h3>3. 학생의 이용</h3><p>수업에 도입할 때에는 교사가 서비스의 운영 상태, 이용 조건과 학교의 절차를 확인해야 합니다. 미성년자의 개인정보 처리가 필요한 경우에는 관련 법령에 따른 법정대리인 동의 등 필요한 절차를 먼저 마련해야 합니다. 이 약관을 게시했다는 사실만으로 학생 이용이나 개인정보 처리에 대한 동의가 성립하지 않습니다.</p></section>
                <section><h3>4. 생성 결과의 확인</h3><p>AI가 생성한 코드나 설명에는 오류가 있을 수 있습니다. 결과를 사용하거나 공유하기 전에 기능, 내용, 저작권과 개인정보 포함 여부를 확인해 주세요. 다운로드한 파일은 이용자의 기기에 저장되며, 공개 여부는 이용자가 결정합니다.</p></section>
                <section><h3>5. 운영 변경과 중단</h3><p>유지보수, 비용, 외부 서비스 변경 등의 사유로 기능이 변경되거나 중단될 수 있습니다. 재개 시에는 적용할 API와 이용 조건을 안내합니다. 서비스 중단이나 오류에 관한 책임은 관련 법령에 따르며, 운영자의 고의·과실에 따른 법적 책임을 일괄 면제하지 않습니다.</p></section>
                <section><h3>6. 문의와 약관 변경</h3><p>문의: <a href="mailto:ingyu8705@gmail.com">ingyu8705@gmail.com</a>. 약관을 변경하면 이 화면에 변경 내용과 시행일을 안내합니다. 이용자의 권리에 중대한 영향을 주는 변경은 시행 전에 알립니다.</p></section>
              </> : <>
                <section><h3>1. 처리 목적과 현재 운영 상태</h3><p>이 방침은 현재 중단된 서비스의 화면 이용과 문의 처리에 적용됩니다. 회원가입 기능은 없으며 회원정보를 수집하지 않습니다. 이미지 선택 시 파일은 브라우저에서 읽습니다. 전송 버튼을 누르면 이미지·요청문·이전 HTML이 서비스 서버로 전송되지만, 현재 서버는 생성 요청을 차단하고 외부 AI에 전달하지 않습니다.</p></section>
                <section><h3>2. 자료의 보관과 삭제</h3><p>앱은 선택한 이미지, 대화와 생성 결과를 브라우저의 실행 중 메모리에 보관하며, 별도 데이터베이스에 저장하는 기능은 두고 있지 않습니다. 초기화하거나 페이지를 새로 열면 앱의 해당 상태가 초기화됩니다. 다운로드한 HTML은 이용자 기기에 남으므로 이용자가 직접 삭제해야 합니다. 생성된 HTML의 저장 동작은 파일 내용에 따라 다를 수 있습니다.</p></section>
                <section><h3>3. 접속 기록과 호스팅</h3><p>서비스는 Vercel에서 호스팅됩니다. 사이트 제공과 보안·장애 대응 과정에서 IP 주소, 접속 시각, 요청 경로와 오류 정보 등 기술적 기록이 호스팅 서비스에서 처리될 수 있습니다. 앱에는 별도 광고·분석용 추적 기능을 추가하지 않았습니다. 호스팅 기록의 보관·국외 처리 조건은 Vercel의 정책과 적용 계약에 따르며, 앱의 초기화로 삭제되지 않습니다.</p><p><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel 개인정보처리방침</a></p></section>
                <section><h3>4. OpenAI API</h3><p>현재 AI 생성 기능이 중단되어 있어 새 생성 요청의 자료를 외부 AI에 전송하지 않습니다. OpenAI API 이용에 관한 개인정보 처리 항목과 목적, 보유 기간 및 국외 이전 조건은 기능 운영 시 적용되는 안내에 따릅니다. 이 방침은 과거 전송 자료의 삭제나 외부 사업자의 무보관을 보장하는 안내가 아닙니다.</p></section>
                <section><h3>5. 문의 정보와 권리 행사</h3><p>문의 메일을 보내면 회신 주소와 문의 내용이 전달되며, 문의 응답과 요청 처리에 사용합니다. 처리가 끝나 불필요해진 정보는 삭제하되 법령상 보관 의무가 있는 경우에는 해당 기간을 따릅니다. 본인이나 법정대리인은 개인정보의 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청 시 필요한 범위에서 본인 또는 대리인 여부를 확인할 수 있습니다.</p></section>
                <section><h3>6. 보호 담당자와 방침 변경</h3><p>운영·개인정보 문의 담당: 백인규 / <a href="mailto:ingyu8705@gmail.com">ingyu8705@gmail.com</a>. 문의에 불필요한 학생 개인정보나 원본 작품은 보내지 마세요. 처리 방식이 바뀌면 변경 내용과 시행일을 이 화면에 안내합니다.</p></section>
              </>}
            </div>
            <div className="legal-bottom"><button type="button" onClick={() => setPage(null)}>닫기</button></div>
          </div>
        </dialog>
      )}
    </>
  );
}
