export async function POST(request) {  const { messages, systemPrompt } = await request.json();
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {    return Response.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });  }
  try {    const response = await fetch(      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,      {        method: 'POST',        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({          system_instruction: { parts: [{ text: systemPrompt }] },          contents: messages        })      }    );
    if (!response.ok) {      const err = await response.json();      throw new Error(err.error?.message || '응답 오류');    }
    const data = await response.json();    const aiText = data.candidates[0].content.parts[0].text;
    return Response.json({ text: aiText });
  } catch (error) {    return Response.json({ error: error.message }, { status: 500 });  }}