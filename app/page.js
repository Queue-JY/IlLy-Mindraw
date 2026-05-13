'use client';
import { useState, useRef, useEffect } from 'react';

const MODES = {
  writing: {
    name: '글쓰기 코치',
    icon: '✍️',
    sub: '자소서 · 보고서 · 기획안',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n자소서, 보고서, 기획안 등\n쓰고 싶은 글의 주제나 고민을 말씀해주세요.',
    prompt: `당신은 소크라테스식 글쓰기 코치 'Mindraw'입니다.핵심 원칙:1. 절대로 직접 글을 써주거나 예시 문장을 제공하지 마세요.2. 사용자의 생각과 경험을 끌어내는 질문 1개만 던지세요.3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.`
  },
  decision: {
    name: '의사결정 코치',
    icon: '⚖️',
    sub: '선택 · 판단 · 방향 설정',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n지금 어떤 선택 앞에 서 계신가요?\n고민을 말씀해주세요.',
    prompt: `당신은 소크라테스식 의사결정 코치 'Mindraw'입니다.핵심 원칙:1. 절대로 직접적인 답을 주지 마세요.2. 사용자 스스로 우선순위와 가치관을 발견하게 만드는 질문 1개만 던지세요.3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.`
  },
  idea: {
    name: '아이디에이션',
    icon: '💡',
    sub: '발상 · 기획 · 창의적 사고',
    greeting: '안녕하세요.\n저는 답을 드리지 않습니다.\n\n어떤 아이디어나 기획을 떠올리고 싶으신가요?\n주제나 맥락을 말씀해주세요.',
    prompt: `당신은 소크라테스식 아이디에이션 코치 'Mindraw'입니다.핵심 원칙:1. 절대로 직접적인 아이디어를 제안하지 마세요.2. 사용자의 잠재적 생각을 끌어내는 질문 1개만 던지세요.3. 존댓말, 따뜻하지만 날카로운 톤. 한국어. 3~4줄 이내.`
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

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
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
  };

  const startTimer = () => {
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
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || timerActive) return;

    setInput('');
    setIsLoading(true);
    setTurnCount(prev => prev + 1);

    const newHistory = [...conversationHistory, { role: 'user', parts: [{ text }] }];
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
      setConversationHistory(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0c0c0e;
          --surface: #141416;
          --border: #2a2a30;
          --accent: #c8a96e;
          --accent-dim: rgba(200, 169, 110, 0.12);
          --accent-border: rgba(200, 169, 110, 0.25);
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
        }

        /* 온보딩 수정: 스크롤 가능하게 */
        .onboarding {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 32px;
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
        }
        .onboarding::-webkit-scrollbar { display: none; }

        .onboard-logo { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 40px; flex-shrink: 0; }
        .onboard-headline { font-size: clamp(28px, 5vw, 42px); font-weight: 700; line-height: 1.3; letter-spacing: -1px; text-align: center; margin-bottom: 20px; flex-shrink: 0; }
        .onboard-headline em { color: var(--accent); font-style: normal; }
        .onboard-desc { font-size: 15px; color: var(--text-mid); text-align: center; line-height: 1.8; max-width: 440px; margin-bottom: 40px; flex-shrink: 0; }
        .onboard-divider { width: 1px; height: 40px; background: linear-gradient(to bottom, var(--border), transparent); margin-bottom: 40px; flex-shrink: 0; }

        .mode-grid { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 480px; margin-bottom: 40px; flex-shrink: 0; }
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
        .mode-arrow { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--text-dim); transition: color 0.2s, transform 0.2s; }
        .mode-card:hover .mode-arrow, .mode-card.selected .mode-arrow { color: var(--accent); transform: translateX(3px); }

        .start-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 16px 64px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.2s;
          flex-shrink: 0;
          margin-bottom: 16px;
        }
        .start-btn:hover { opacity: 0.85; }
        .onboard-note { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim); margin-bottom: 40px; flex-shrink: 0; }

        /* 채팅 화면 수정: 스크롤 및 배치 최적화 */
        .chat-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg);
          z-index: 10;
        }
        .back-btn { background: none; border: none; color: var(--text-dim); font-size: 12px; cursor: pointer; font-family: 'Noto Serif KR'; }
        .back-btn:hover { color: var(--text); }
        .header-center { display: flex; align-items: center; gap: 10px; }
        .mode-badge { font-size: 11px; color: var(--accent); border: 1px solid var(--accent-border); padding: 2px 8px; border-radius: 10px; }

        .chat-box {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        /* 메시지가 적을 때 아래에 붙게 만드는 공간 */
        .chat-spacer { flex: 1 1 auto; }

        /* 스크롤바 디자인 */
        .chat-box::-webkit-scrollbar { width: 4px; }
        .chat-box::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        .message-wrap { display: flex; flex-direction: column; gap: 8px; max-width: 85%; }
        .message-wrap.user { align-self: flex-end; align-items: flex-end; }
        .message-wrap.ai { align-self: flex-start; align-items: flex-start; }

        .message-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em; }
        .message {
          padding: 14px 18px;
          border-radius: 2px;
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-line;
          word-break: break-all;
        }
        .message.ai { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); }
        .message.user { background: var(--user-bg); border: 1px solid var(--user-border); }

        .timer-zone { padding: 0 24px; overflow: hidden; max-height: 0; transition: all 0.3s ease; opacity: 0; }
        .timer-zone.active { max-height: 80px; opacity: 1; margin-bottom: 12px; }
        .timer-inner {
          background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .timer-text { font-size: 11px; color: var(--accent); }
        .timer-num { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: bold; color: var(--accent); }
        .timer-num.urgent { color: #e07070; }

        .input-zone { padding: 16px 24px 24px; border-top: 1px solid var(--border); background: var(--bg); }
        .input-wrap { display: flex; gap: 10px; align-items: flex-end; }
        textarea {
          flex: 1;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 14px;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          resize: none;
          min-height: 48px;
          max-height: 120px;
          border-radius: 2px;
        }
        textarea:focus { outline: none; border-color: var(--accent-border); }
        .send-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          height: 48px;
          padding: 0 20px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          border-radius: 2px;
        }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        @media (max-width: 640px) {
          .onboarding { padding: 40px 24px; }
          .header { padding: 12px 16px; }
          .chat-box { padding: 16px; }
          .input-zone { padding: 12px 16px 20px; }
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
              <button className="back-btn" onClick={goBack}>← 처음으로</button>
              <div className="header-center">
                <span style={{ fontFamily: 'DM Mono', fontSize: '12px', letterSpacing: '0.1em' }}>MINDRAW</span>
                <div className="mode-badge">{MODES[selectedMode].name}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Q: {turnCount}</div>
            </div>

            <div className="chat-box" ref={chatBoxRef}>
              <div className="chat-spacer" />
              {messages.map((msg, i) => (
                <div key={i} className={`message-wrap ${msg.role}`}>
                  <div className="message-label">{msg.role === 'ai' ? 'MINDRAW' : 'YOU'}</div>
                  <div className={`message ${msg.role}`}>{msg.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message-wrap ai">
                  <div className="message-label">MINDRAW</div>
                  <div className="message ai" style={{ opacity: 0.5 }}>생각하는 중...</div>
                </div>
              )}
            </div>

            <div className={`timer-zone ${timerActive ? 'active' : ''}`}>
              <div className="timer-inner">
                <div className="timer-text">잠시 멈추고 스스로의 답을 정리해보세요</div>
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
                  placeholder={timerActive ? "스스로 생각할 시간입니다..." : "내용을 입력하세요..."}
                  disabled={isLoading || timerActive}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={isLoading || timerActive || !input.trim()}
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
