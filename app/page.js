'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const MODES = {
  writing: {
    name: '글쓰기 코치',
    icon: '✍️',
    sub: '자소서 · 보고서 · 기획안',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n자소서, 보고서, 기획안 등\n쓰고 싶은 글의 주제나 고민을 말씀해주세요.',
    prompt: '당신은 소크라테스식 글쓰기 코치 Mindraw입니다. 핵심 원칙: 1. 절대로 직접 글을 써주거나 예시 문장을 제공하지 마세요. 2. 사용자의 생각과 경험을 끌어내는 질문 1개만 던지세요. 3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.'
  },
  decision: {
    name: '의사결정 코치',
    icon: '⚖️',
    sub: '선택 · 판단 · 방향 설정',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n지금 어떤 선택 앞에 서 계신가요?\n고민을 말씀해주세요.',
    prompt: '당신은 소크라테스식 의사결정 코치 Mindraw입니다. 핵심 원칙: 1. 절대로 직접적인 답을 주지 마세요. 2. 사용자 스스로 우선순위와 가치관을 발견하게 만드는 질문 1개만 던지세요. 3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.'
  },
  idea: {
    name: '아이디에이션',
    icon: '💡',
    sub: '발상 · 기획 · 창의적 사고',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n어떤 아이디어나 기획을 떠올리고 싶으신가요?\n주제나 맥락을 말씀해주세요.',
    prompt: '당신은 소크라테스식 아이디에이션 코치 Mindraw입니다. 핵심 원칙: 1. 절대로 직접적인 아이디어를 제안하지 마세요. 2. 사용자의 잠재적 생각을 끌어내는 질문 1개만 던지세요. 3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.'
  }
};

export default function Home() {
  const [screen, setScreen] = useState('onboarding');
  const [selectedMode, setSelectedMode] = useState('writing');
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerCount, setTimerCount] = useState(30);
  const [isUrgent, setIsUrgent] = useState(false);

  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // 새 메시지 올 때마다 맨 아래로 스크롤
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const startChat = () => {
    const mode = MODES[selectedMode];
    setMessages([{ role: 'ai', text: mode.greeting }]);
    setConversationHistory([]);
    setTurnCount(0);
    setScreen('chat');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const goBack = () => {
    setScreen('onboarding');
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerCount(30);
    setIsUrgent(false);
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(true);
    setTimerCount(30);
    setIsUrgent(false);
    let count = 30;

    timerRef.current = setInterval(() => {
      count--;
      setTimerCount(count);
      if (count <= 10) setIsUrgent(true);
      if (count <= 0) {
        clearInterval(timerRef.current);
        setTimerActive(false);
        setIsUrgent(false);
        setTimerCount(30);
        inputRef.current?.focus();
      }
    }, 1000);
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || timerActive) return;

    setInput('');
    setIsLoading(true);
    setTurnCount(prev => prev + 1);

<<<<<<< HEAD
    const newHistory = [...conversationHistory, { role: 'user', content: text }];
=======
    const newHistory = [...conversationHistory, { role: 'user', parts: [{ text }] }];
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
    setConversationHistory(newHistory);
    setMessages(prev => [...prev, { role: 'user', text }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          systemPrompt: MODES[selectedMode].prompt
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiText = data.text;
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiText }]);
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      startTimer();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: `오류: ${err.message}` }]);
    }

    setIsLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0c0c0e;
          --surface: #141416;
          --border: #2a2a30;
          --accent: #c8a96e;
          --accent-dim: rgba(200,169,110,0.12);
          --accent-border: rgba(200,169,110,0.25);
          --text: #e8e6e0;
          --text-dim: #6b6860;
          --text-mid: #9e9b94;
          --user-bg: #1a1f2e;
          --user-border: #2a3555;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Noto Serif KR', serif;
          background: var(--bg);
          color: var(--text);
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        .container {
          width: 100%;
          max-width: 720px;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

<<<<<<< HEAD
        /* ── 온보딩: overflow-y scroll로 버튼 항상 접근 가능 ── */
=======
        /* 온보딩: overflow-y auto로 스크롤 가능 → 시작하기 버튼 항상 접근 가능 */
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
        .onboarding {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
<<<<<<< HEAD
          padding: 48px 32px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .onboarding::-webkit-scrollbar { display: none; }

        .onboard-logo {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: var(--accent);
          letter-spacing: 0.2em;
          margin-bottom: 44px;
          flex-shrink: 0;
        }

        .onboard-headline {
          font-size: clamp(26px, 5vw, 40px);
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -1px;
          text-align: center;
          margin-bottom: 18px;
        }
=======
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 32px 40px;
        }
        .onboarding::-webkit-scrollbar { display: none; }

        .onboard-logo { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 48px; flex-shrink: 0; }
        .onboard-headline { font-size: clamp(28px, 5vw, 42px); font-weight: 700; line-height: 1.3; letter-spacing: -1px; text-align: center; margin-bottom: 20px; }
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
        .onboard-headline em { color: var(--accent); font-style: normal; }
        .onboard-desc { font-size: 15px; color: var(--text-mid); text-align: center; line-height: 1.8; max-width: 440px; margin-bottom: 56px; }
        .onboard-divider { width: 1px; height: 40px; background: linear-gradient(to bottom, var(--border), transparent); margin: 0 auto 56px; flex-shrink: 0; }

<<<<<<< HEAD
        .onboard-desc {
          font-size: 15px;
          color: var(--text-mid);
          text-align: center;
          line-height: 1.85;
          max-width: 400px;
          margin-bottom: 40px;
        }

        .onboard-divider {
          width: 1px;
          height: 36px;
          background: linear-gradient(to bottom, var(--border), transparent);
          margin: 0 auto 40px;
          flex-shrink: 0;
        }

        .mode-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 480px;
          margin-bottom: 36px;
        }

=======
        .mode-grid { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 480px; margin-bottom: 40px; }
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
        .mode-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 18px 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.2s, background 0.2s;
          border-radius: 2px;
        }
        .mode-card:hover { border-color: var(--accent-border); background: var(--accent-dim); }
        .mode-card.selected { border-color: var(--accent); background: var(--accent-dim); }

        .mode-left { display: flex; align-items: center; gap: 14px; }
        .mode-icon { font-size: 18px; width: 24px; text-align: center; }
        .mode-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
        .mode-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-dim); }
<<<<<<< HEAD
        .mode-arrow {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          color: var(--text-dim);
          transition: color 0.2s, transform 0.2s;
        }
        .mode-card:hover .mode-arrow,
        .mode-card.selected .mode-arrow { color: var(--accent); transform: translateX(3px); }
=======
        .mode-arrow { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--text-dim); transition: color 0.2s, transform 0.2s; }
        .mode-card:hover .mode-arrow, .mode-card.selected .mode-arrow { color: var(--accent); transform: translateX(3px); }
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)

        .start-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 16px 52px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .start-btn:hover { opacity: 0.85; }
        .onboard-note { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim); margin-top: 16px; flex-shrink: 0; }

<<<<<<< HEAD
        .onboard-note {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          margin-top: 14px;
          flex-shrink: 0;
        }

        /* ── 채팅 화면 ── */
        .chat-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .header {
          padding: 16px 28px 14px;
=======
        .chat-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .header {
          padding: 20px 32px 16px;
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
<<<<<<< HEAD

        .header-left { display: flex; align-items: center; gap: 12px; }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-mid);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: var(--accent); }

        .header-divider { width: 1px; height: 16px; background: var(--border); }

        .logo-text {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: var(--accent);
          letter-spacing: 0.12em;
        }

        .mode-badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 3px 10px;
          border-radius: 2px;
        }

        .session-info {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          text-align: right;
          line-height: 1.6;
        }

        .turn-count { color: var(--accent); }

        /*
          ── 채팅박스 핵심 수정 ──
          - justify-content: flex-end 제거 → 메시지가 위에서부터 쌓임
          - flex-direction: column (정방향 유지)
          - overflow-y: auto → 메시지 많으면 스크롤
          - 초기엔 .chat-spacer가 빈 공간을 채워 메시지를 아래에 위치시킴
        */
=======

        /* 채팅박스: justify-content flex-end 제거 → 위에서부터 쌓임, 넘치면 스크롤 */
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
        .chat-box {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
<<<<<<< HEAD
          padding: 28px 28px 16px;
=======
          padding: 24px 32px 16px;
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
          display: flex;
          flex-direction: column;
          gap: 20px;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .chat-box::-webkit-scrollbar { width: 4px; }
        .chat-box::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        .chat-box::-webkit-scrollbar-track { background: transparent; }

        .message-wrap { display: flex; flex-direction: column; gap: 5px; }
        .message-wrap.user { align-items: flex-end; }
        .message-wrap.ai { align-items: flex-start; }
        .message-wrap.error { align-items: flex-start; }

        .message-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          padding: 0 4px;
        }

        .message {
          max-width: 82%;
          padding: 15px 19px;
          border-radius: 2px;
          font-size: 14.5px;
          line-height: 1.8;
          white-space: pre-line;
        }

<<<<<<< HEAD
        .message.ai {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent);
        }
        .message.user {
          background: var(--user-bg);
          border: 1px solid var(--user-border);
        }
        .message.error {
          background: rgba(200,80,80,0.08);
          border: 1px solid rgba(200,80,80,0.25);
          border-left: 3px solid #c85050;
          color: #e08080;
          font-size: 13px;
        }

        .loading-dots {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 15px 19px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent);
          border-radius: 2px;
        }
=======
        .message.ai { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); }
        .message.user { background: var(--user-bg); border: 1px solid var(--user-border); }
        .message.error { background: rgba(200,80,80,0.1); border: 1px solid rgba(200,80,80,0.3); border-left: 3px solid #c85050; color: #e08080; font-size: 13px; }

        .loading-dots { display: flex; gap: 5px; align-items: center; padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 2px; }
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
        .dot { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; opacity: 0.4; animation: pulse 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }

        .timer-zone {
          margin: 0 28px;
          flex-shrink: 0;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease, opacity 0.35s ease;
          opacity: 0;
        }
        .timer-zone.active { max-height: 80px; opacity: 1; }

        .timer-inner {
          background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          padding: 11px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .timer-text { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--accent); }
        .timer-num { font-family: 'DM Mono', monospace; font-size: 24px; font-weight: bold; color: var(--accent); transition: color 0.3s; }
        .timer-num.urgent { color: #e07070; }

        .input-zone {
          padding: 12px 28px 20px;
          flex-shrink: 0;
          border-top: 1px solid var(--border);
        }
        .input-wrap { display: flex; gap: 10px; align-items: flex-end; }

        textarea {
          flex: 1;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 13px 15px;
          color: var(--text);
          font-size: 14px;
          font-family: 'Noto Serif KR', serif;
          line-height: 1.6;
          resize: none;
          min-height: 48px;
          max-height: 120px;
          border-radius: 2px;
          transition: border-color 0.2s;
        }
        textarea::placeholder { color: var(--text-dim); }
        textarea:focus { outline: none; border-color: rgba(200,169,110,0.5); }
        textarea:disabled { opacity: 0.4; cursor: not-allowed; }

        .send-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 0 20px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.2s;
          white-space: nowrap;
          height: 48px;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .hint {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          margin-top: 7px;
          text-align: right;
        }

<<<<<<< HEAD
        @media (max-width: 600px) {
          .onboarding { padding: 36px 20px 32px; }
          .onboard-desc { font-size: 14px; }
          .header { padding: 13px 20px 11px; }
          .chat-box { padding: 20px 20px 8px; }
=======
        @media (max-width: 640px) {
          .onboarding { padding: 36px 20px 32px; }
          .onboard-logo { margin-bottom: 20px; font-size: 12px; }
          .onboard-headline { margin-bottom: 12px; line-height: 1.25; }
          .onboard-desc { margin-bottom: 24px; font-size: 14.5px; line-height: 1.65; }
          .onboard-divider { height: 28px; margin: 0 auto 28px; }
          .mode-grid { gap: 8px; margin-bottom: 28px; }
          .mode-card { padding: 16px 20px; }
          .start-btn { padding: 15px 56px; font-size: 13.5px; margin-top: 8px; }
          .onboard-note { margin-top: 8px; font-size: 9.5px; }

          .header { padding: 14px 20px; }
          .chat-box { padding: 20px 20px 16px; }
>>>>>>> d8f6ce3 (모바일 페이지 버튼 가시적으로 수정)
          .timer-zone { margin: 0 20px; }
          .input-zone { padding: 10px 20px 18px; }
          .message { max-width: 92%; font-size: 14px; }
          .mode-badge { display: none; }
        }
      `}</style>

      <div className="container">
        {screen === 'onboarding' && (
          <div className="onboarding">
            <div className="onboard-logo">MINDRAW</div>
            <h1 className="onboard-headline">
              답이 아닌 <em>질문</em>을<br />드립니다
            </h1>
            <p className="onboard-desc">
              AI가 답을 주는 시대,<br />
              Mindraw는 당신이 스스로 생각하도록<br />
              질문을 던집니다.
            </p>
            <div className="onboard-divider" />

            <div className="mode-grid">
              {Object.entries(MODES).map(([key, mode]) => (
                <div
                  key={key}
                  className={`mode-card ${selectedMode === key ? 'selected' : ''}`}
                  onClick={() => setSelectedMode(key)}
                >
                  <div className="mode-left">
                    <div className="mode-icon">{mode.icon}</div>
                    <div>
                      <div className="mode-name">{mode.name}</div>
                      <div className="mode-sub">{mode.sub}</div>
                    </div>
                  </div>
                  <div className="mode-arrow">→</div>
                </div>
              ))}
            </div>

            <button className="start-btn" onClick={startChat}>시작하기</button>
            <div className="onboard-note">답을 드리지 않습니다. 생각할 준비가 되셨나요?</div>
          </div>
        )}

        {screen === 'chat' && (
          <div className="chat-screen">
            <div className="header">
              <div className="header-left">
                <button className="back-btn" onClick={goBack}>← 처음으로</button>
                <div className="header-divider" />
                <span className="logo-text">Mindraw</span>
                <div className="mode-badge">{MODES[selectedMode].name}</div>
              </div>
              <div className="session-info">
                질문 <span className="turn-count">{turnCount}</span>회<br />
                내 생각으로 채운 대화
              </div>
            </div>

            <div className="chat-box" ref={chatBoxRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`message-wrap ${msg.role}`}>
                  <div className="message-label">
                    {msg.role === 'ai' ? 'MINDRAW' : msg.role === 'user' ? 'YOU' : ''}
                  </div>
                  <div className={`message ${msg.role}`}>{msg.text}</div>
                </div>
              ))}

              {isLoading && (
                <div className="message-wrap ai">
                  <div className="message-label">MINDRAW</div>
                  <div className="loading-dots">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </div>
              )}
            </div>

            <div className={`timer-zone ${timerActive ? 'active' : ''}`}>
              <div className="timer-inner">
                <div className="timer-text">⏱ 잠깐, 혼자 먼저 생각해보세요</div>
                <div className={`timer-num ${isUrgent ? 'urgent' : ''}`}>{timerCount}</div>
              </div>
            </div>

            <div className="input-zone">
              <div className="input-wrap">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onInput={autoResize}
                  placeholder="고민이나 질문을 입력하세요..."
                  disabled={isLoading || timerActive}
                  rows={1}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={isLoading || timerActive}
                >
                  전송
                </button>
              </div>
              <div className="hint">Enter로 전송 · Shift+Enter 줄바꿈</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
