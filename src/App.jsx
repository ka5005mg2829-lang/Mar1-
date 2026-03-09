import { useState, useEffect } from "react";

const QUESTIONS = [
  { id: "intro", label: "① 自己紹介 / Perkenalan Diri", placeholder: "Nama, asal daerah, keluarga, pengalaman kerja sebelumnya..." },
  { id: "reason", label: "② 介護を選んだ理由 / Alasan Memilih Perawatan", placeholder: "Kenapa kamu ingin bekerja di bidang perawatan?" },
  { id: "hardship", label: "③ 介護で大変だと思うこと / Hal Sulit dalam Perawatan", placeholder: "Menurutmu, apa yang paling sulit dalam pekerjaan perawatan?" },
  { id: "whySakura", label: "④ なぜさくら会を選んだか / Kenapa Memilih Sakurakai", placeholder: "Kenapa kamu ingin bekerja di Sakurakai yang ada di Shinagawa, Tokyo?" },
  { id: "health", label: "⑤ 体力・健康 / Kesehatan & Stamina", placeholder: "Apakah kamu bisa kerja shift malam?" },
  { id: "personality", label: "⑥ 性格・長所短所 / Kepribadian & Kelebihan/Kekurangan", placeholder: "Apa kelebihan dan kekuranganmu?" },
  { id: "trouble", label: "⑦ 困ったときの対処 / Cara Mengatasi Masalah", placeholder: "Kalau ada masalah saat bekerja, kamu akan bagaimana?" },
  { id: "japanese", label: "⑧ 日本語の勉強 / Belajar Bahasa Jepang", placeholder: "Sekarang kamu belajar bahasa Jepang seperti apa?" },
  { id: "future", label: "⑨ 将来の目標 / Tujuan Masa Depan", placeholder: "3〜5 tahun ke depan, kamu ingin jadi perawat seperti apa?" },
  { id: "teamwork", label: "⑩ チームワーク / Kerja Tim", placeholder: "Kalau pendapatmu berbeda dengan teman kerja, kamu akan bagaimana?" },
  { id: "culture", label: "⑪ 日本の生活への適応 / Adaptasi Kehidupan Jepang", placeholder: "Apakah ada hal yang kamu khawatirkan tentang kehidupan di Jepang?" },
];

const FACILITY = {
  name: "社会福祉法人 さくら会",
  nameId: "Yayasan Kesejahteraan Sosial Sakurakai",
  location: "東京都品川区南大井（JR大森駅北口 徒歩約10分）",
  locationId: "Minami-Oi, Shinagawa, Tokyo (10 menit jalan kaki dari Stasiun JR Omori pintu utara)",
  jobContent: "介護老人保健施設・在宅サービス・訪問介護・通所リハビリ・高齢者住宅など",
  jobContentId: "Panti rehabilitasi lansia, layanan di rumah, kunjungan perawatan, rehabilitasi harian, perumahan lansia, dll.",
  philosophy: "住み慣れた地域でいつまでも生活が継続できるように支援する。地域密着型の介護とリハビリに力を入れている。",
  philosophyId: "Mendukung agar lansia dapat terus tinggal di lingkungan yang sudah mereka kenal.",
};

const buildFeedbackPrompt = (answers) => {
  const answeredQuestions = QUESTIONS.filter(q => answers[q.id]?.trim());
  return `Berikan feedback wawancara kerja perawat di Jepang dalam format JSON array.

Jawaban kandidat:
${answeredQuestions.map(q => `[${q.id}]: ${answers[q.id]}`).join("\n")}

Balas HANYA dengan JSON array berikut (tidak ada teks lain):
[
  {"id":"${answeredQuestions[0]?.id || 'intro'}","status":"good","feedback":"...","example":""},
  {"id":"...","status":"improve","feedback":"...","example":"contoh jawaban"}
]

Status: "good" = bagus, "improve" = perlu perbaikan
Aturan penting:
- feedback: maksimal 30 kata
- example: maksimal 40 kata, hanya jika status "improve"
- Sertakan semua ${answeredQuestions.length} pertanyaan yang dijawab`;
};

const buildConvertPrompt = (answers) => `
Buat teks wawancara dalam bahasa Jepang mudah (やさしい日本語).
Fasilitas: ${FACILITY.name}, ${FACILITY.location}

Jawaban:
${QUESTIONS.map(q => answers[q.id] ? `${q.label}: ${answers[q.id]}` : "").filter(Boolean).join("\n")}

Aturan: kalimat pendek, gunakan です・ます, bahasa mudah.
Format dengan header 【】 untuk setiap bagian.`;

export default function App() {
  const [screen, setScreen] = useState("list");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [candidateName, setCandidateName] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [converted, setConverted] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("sakura_candidates");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveCandidate = (name, result) => {
    const newEntry = { id: Date.now(), name, date: new Date().toLocaleDateString("ja-JP"), result };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem("sakura_candidates", JSON.stringify(updated));
  };

  const deleteCandidate = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("sakura_candidates", JSON.stringify(updated));
  };

  const callAI = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("APIキーが設定されていません (VITE_GEMINI_API_KEY)");

    // gemini-1.5-flash を使用（より安定）
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8000,
            temperature: 0.3,
          }
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`APIエラー ${res.status}: ${errData?.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("AIからの応答が空です");
    return text;
  };

  const handleFeedback = async () => {
    const filled = QUESTIONS.filter(q => answers[q.id]?.trim());
    if (filled.length < 4) { setErrorMsg("最低4つ以上回答してください"); return; }
    if (!candidateName.trim()) { setErrorMsg("候補者名を入力してください"); return; }

    setLoading(true);
    setLoadingMsg("AIがフィードバックを作成中... (10〜20秒かかります)");
    setFeedbackList([]);
    setErrorMsg("");

    try {
      const result = await callAI(buildFeedbackPrompt(answers));

      // JSONを取り出す（```json ブロックや余分なテキストを除去）
      let jsonText = result;
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      } else {
        throw new Error("AIがJSON形式で返しませんでした。再試行してください。");
      }

      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("JSONの形式が正しくありません");

      setFeedbackList(parsed);
      setStep(2);
    } catch (e) {
      console.error("Feedback error:", e);
      setErrorMsg(`エラー: ${e.message} → もう一度「フィードバックをもらう」を押してください`);
    }

    setLoading(false);
    setLoadingMsg("");
  };

  const handleConvert = async () => {
    setLoading(true);
    setLoadingMsg("やさしい日本語に変換中...");
    setConverted("");
    setErrorMsg("");
    try {
      const result = await callAI(buildConvertPrompt(answers));
      setConverted(result);
      saveCandidate(candidateName, result);
      setStep(3);
    } catch (e) {
      setErrorMsg(`変換エラー: ${e.message}`);
    }
    setLoading(false);
    setLoadingMsg("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(converted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(0); setAnswers({}); setFeedbackList([]);
    setConverted(""); setCandidateName(""); setEditingId(null);
    setErrorMsg(""); setScreen("list");
  };

  const allGood = feedbackList.length > 0 && feedbackList.every(f => f.status === "good");
  const STEPS = ["施設情報", "候補者回答", "フィードバック", "日本語変換"];

  const s = {
    wrap: { fontFamily: "'Noto Sans JP', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0e9 100%)", padding: "24px 16px" },
    card: { maxWidth: 700, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", overflow: "hidden" },
    header: { background: "linear-gradient(135deg, #2d7a4f 0%, #4aab72 100%)", padding: "28px 32px", color: "#fff" },
    body: { padding: "28px 32px" },
    stepper: { display: "flex", background: "#f7faf8", borderBottom: "1px solid #e8ede9" },
    stepItem: (active, done) => ({ flex: 1, padding: "12px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: active ? "#2d7a4f" : done ? "#4aab72" : "#aaa", borderBottom: active ? "3px solid #2d7a4f" : "3px solid transparent" }),
    btn: (color) => ({ padding: "13px 28px", background: color || "#2d7a4f", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }),
    btnOutline: { padding: "10px 20px", background: "#fff", border: "1.5px solid #2d7a4f", color: "#2d7a4f", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
    btnSmall: (color) => ({ padding: "6px 14px", background: color || "#2d7a4f", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }),
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb" },
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb", resize: "vertical", minHeight: 80 },
    label: { fontSize: 13, fontWeight: 700, color: "#2d7a4f", marginBottom: 6, display: "block" },
    infoBox: { background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 10, padding: "12px 14px", marginBottom: 16 },
    qBlock: { background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 12, padding: "16px", marginBottom: 14 },
    qLabel: { fontSize: 13, fontWeight: 700, color: "#1a5c36", marginBottom: 8 },
    divider: { height: 1, background: "#e8ede9", margin: "20px 0" },
    tip: { background: "#fff8e6", border: "1px solid #ffd580", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5a00", marginBottom: 20 },
    error: { background: "#fff0f0", border: "1.5px solid #ffb3b3", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#cc0000", marginBottom: 16, lineHeight: 1.6 },
    loadingBox: { background: "#e8f8f0", border: "1px solid #a8ddb8", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1a6636", marginBottom: 16, textAlign: "center" },
    convertBox: { background: "#e8f8f0", border: "1.5px solid #5cb882", borderRadius: 14, padding: "20px", whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 2.0, color: "#1a3a26" },
    footer: { background: "#f7faf8", borderTop: "1px solid #e0ece4", padding: "12px 32px", fontSize: 12, color: "#888", textAlign: "center" },
  };

  if (screen === "list") return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>🌸</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>介護面接トレーナー</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>候補者一覧</p>
            </div>
          </div>
        </div>
        <div style={s.body}>
          <button style={{ ...s.btn(), marginBottom: 24, width: "100%", fontSize: 16 }}
            onClick={() => { setScreen("form"); setStep(0); }}>
            ➕ 新しい候補者を追加
          </button>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>
              <div style={{ fontSize: 48 }}>📋</div>
              <p>まだ候補者がいません</p>
            </div>
          ) : history.map(h => (
            <div key={h.id} style={{ background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1a5c36" }}>👤 {h.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>📅 {h.date}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.btnOutline} onClick={() => { setSelectedCandidate(h); setScreen("detail"); }}>確認</button>
                  <button style={{ ...s.btnOutline, color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => deleteCandidate(h.id)}>削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={s.footer}>社会福祉法人 さくら会｜面接トレーナー for インドネシア人候補者</div>
      </div>
    </div>
  );

  if (screen === "detail" && selectedCandidate) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>👤</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>📅 {selectedCandidate.date}</p>
            </div>
          </div>
        </div>
        <div style={s.body}>
          <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>🇯🇵 やさしい日本語</p>
          <div style={s.convertBox}>{selectedCandidate.result}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <button style={s.btn(copied ? "#888" : "#1a6636")}
              onClick={() => { navigator.clipboard.writeText(selectedCandidate.result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
            </button>
            <button style={s.btnOutline} onClick={() => setScreen("list")}>← 一覧に戻る</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>🌸</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>介護面接トレーナー</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>インドネシア語 → やさしい日本語</p>
            </div>
          </div>
        </div>
        <div style={s.stepper}>
          {STEPS.map((st, i) => (
            <div key={i} style={s.stepItem(step === i, step > i)}>
              {step > i ? "✓ " : `${i + 1}. `}{st}
            </div>
          ))}
        </div>
        <div style={s.body}>

          {step === 0 && (
            <div>
              <div style={s.tip}>📋 施設情報を確認してください。/ Silakan periksa informasi fasilitas.</div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>候補者名 / Nama Kandidat</label>
                <input style={{ ...s.input, borderColor: "#4aab72" }}
                  placeholder="例：Siti Rahayu"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)} />
              </div>
              <div style={s.divider} />
              <p style={{ fontWeight: 700, color: "#2d7a4f", marginBottom: 12 }}>🏥 施設情報 / Informasi Fasilitas</p>
              {[
                { label: "施設名 / Nama", ja: FACILITY.name, id: FACILITY.nameId },
                { label: "場所 / Lokasi", ja: FACILITY.location, id: FACILITY.locationId },
                { label: "仕事内容 / Pekerjaan", ja: FACILITY.jobContent, id: FACILITY.jobContentId },
                { label: "理念 / Filosofi", ja: FACILITY.philosophy, id: FACILITY.philosophyId },
              ].map((f, i) => (
                <div key={i} style={s.infoBox}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#4aab72", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, color: "#1a3a26", fontWeight: 600, marginBottom: 4 }}>{f.ja}</div>
                  <div style={{ fontSize: 13, color: "#5a8a6a" }}>{f.id}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={s.btnOutline} onClick={() => setScreen("list")}>← 一覧に戻る</button>
                <button style={s.btn()} onClick={() => { setErrorMsg(""); setStep(1); }}>次へ：回答入力へ →</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={s.tip}>🇮🇩 インドネシア語で答えてください！<br />Jawab dalam Bahasa Indonesia!</div>
              {errorMsg && <div style={s.error}>⚠️ {errorMsg}</div>}
              {loading && <div style={s.loadingBox}>⏳ {loadingMsg}</div>}
              {QUESTIONS.map(q => (
                <div key={q.id} style={s.qBlock}>
                  <div style={s.qLabel}>{q.label}</div>
                  <textarea style={s.textarea} placeholder={q.placeholder}
                    value={answers[q.id] || ""}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={s.btnOutline} onClick={() => setStep(0)}>← 戻る</button>
                <button style={{ ...s.btn(), opacity: loading ? 0.6 : 1 }}
                  onClick={handleFeedback} disabled={loading}>
                  {loading ? "⏳ AI確認中..." : "✨ フィードバックをもらう"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 8 }}>💬 質問ごとのフィードバック</p>
              <div style={{ ...s.tip, marginBottom: 20 }}>
                🟢 = 良い回答　🔴 = 要修正　✏️ をクリックして直接編集できます
              </div>
              {errorMsg && <div style={s.error}>⚠️ {errorMsg}</div>}

              {QUESTIONS.map(q => {
                const fb = feedbackList.find(f => f.id === q.id);
                if (!answers[q.id]?.trim()) return null;
                const isGood = fb?.status === "good";
                const bgColor = isGood ? "#f0faf4" : "#fff8f0";
                const borderColor = isGood ? "#a8ddb8" : "#f6ad8f";
                const icon = fb ? (isGood ? "🟢" : "🔴") : "⬜";

                return (
                  <div key={q.id} style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a5c36" }}>{icon} {q.label}</div>
                      <button style={s.btnSmall(editingId === q.id ? "#888" : "#2d7a4f")}
                        onClick={() => setEditingId(editingId === q.id ? null : q.id)}>
                        {editingId === q.id ? "✅ 閉じる" : "✏️ 編集"}
                      </button>
                    </div>
                    {editingId === q.id ? (
                      <textarea style={{ ...s.textarea, marginBottom: 10, borderColor: "#4aab72" }}
                        value={answers[q.id] || ""}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                    ) : (
                      <div style={{ fontSize: 13, color: "#333", background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                        {answers[q.id]}
                      </div>
                    )}
                    {fb && (
                      <div style={{ fontSize: 13, color: isGood ? "#1a6636" : "#8b4513", marginBottom: fb.example ? 10 : 0 }}>
                        💬 {fb.feedback}
                      </div>
                    )}
                    {fb?.example && !isGood && (
                      <div style={{ background: "#fffbea", border: "1px solid #ffd580", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#b7791f", marginBottom: 6 }}>💡 修正例文:</div>
                        <div style={{ fontSize: 13, color: "#744210", lineHeight: 1.7 }}>{fb.example}</div>
                        <button style={{ ...s.btnSmall("#b7791f"), marginTop: 8 }}
                          onClick={() => setAnswers({ ...answers, [q.id]: fb.example })}>
                          📋 この例文を使う
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ background: allGood ? "#d4f5e2" : "#fff3cd", border: `1px solid ${allGood ? "#4aab72" : "#ffd580"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20, textAlign: "center", fontWeight: 700, fontSize: 14, color: allGood ? "#1a6636" : "#856404" }}>
                {allGood ? "✅ 全ての回答がOKです！日本語に変換できます" : "⚠️ 🔴の回答を修正してから変換することをおすすめします"}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button style={s.btnOutline} onClick={() => { setStep(1); setEditingId(null); }}>← 回答一覧に戻る</button>
                <button style={{ ...s.btn("#1a6636"), opacity: loading ? 0.6 : 1 }}
                  onClick={handleConvert} disabled={loading}>
                  {loading ? "⏳ 変換中..." : "🇯🇵 やさしい日本語に変換する"}
                </button>
                <button style={{ ...s.btnOutline, opacity: loading ? 0.6 : 1 }} onClick={handleFeedback} disabled={loading}>
                  🔄 再チェック
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>🇯🇵 やさしい日本語に変換されました</p>
              <div style={s.convertBox}>{converted}</div>
              <div style={{ background: "#e6f4ff", border: "1px solid #90caf9", borderRadius: 10, padding: "12px 16px", marginTop: 16, fontSize: 13, color: "#0d47a1" }}>
                💡 候補者一覧に自動保存されました！LINEでコピーして送ってください。
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <button style={s.btn(copied ? "#888" : "#1a6636")} onClick={handleCopy}>
                  {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
                </button>
                <button style={s.btnOutline} onClick={() => setScreen("list")}>📋 一覧に戻る</button>
                <button style={s.btnOutline} onClick={handleReset}>🔄 新しい候補者</button>
              </div>
            </div>
          )}

        </div>
        <div style={s.footer}>社会福祉法人 さくら会｜面接トレーナー for インドネシア人候補者</div>
      </div>
    </div>
  );
}
