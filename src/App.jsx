import { useState, useEffect } from "react";

const QUESTIONS = [
  { id: "intro", label: "① 自己紹介 / Perkenalan Diri", placeholder: "Nama, asal daerah, keluarga, pengalaman kerja sebelumnya..." },
  { id: "reason", label: "② 介護を選んだ理由 / Alasan Memilih Perawatan", placeholder: "Kenapa kamu ingin bekerja di bidang perawatan?" },
  { id: "hardship", label: "③ 介護で大変だと思うこと / Hal Sulit dalam Perawatan", placeholder: "Menurutmu, apa yang paling sulit dalam pekerjaan perawatan?" },
  { id: "whySakura", label: "④ なぜさくら会を選んだか / Kenapa Memilih Sakurakai", placeholder: "Kenapa kamu ingin bekerja di Sakurakai yang ada di Shinagawa, Tokyo?" },
];

const COMMON_QS = [
  { id: "health", label: "⑤ 体力・健康 / Kesehatan & Stamina", placeholder: "Apakah kamu bisa kerja shift malam?" },
  { id: "personality", label: "⑥ 性格・長所短所 / Kepribadian & Kelebihan/Kekurangan", placeholder: "Apa kelebihan dan kekuranganmu?" },
  { id: "trouble", label: "⑦ 困ったときの対処 / Cara Mengatasi Masalah", placeholder: "Kalau ada masalah saat bekerja, kamu akan bagaimana?" },
  { id: "japanese", label: "⑧ 日本語の勉強 / Belajar Bahasa Jepang", placeholder: "Sekarang kamu belajar bahasa Jepang seperti apa?" },
  { id: "future", label: "⑨ 将来の目標 / Tujuan Masa Depan", placeholder: "3〜5 tahun ke depan, kamu ingin jadi perawat seperti apa?" },
  { id: "teamwork", label: "⑩ チームワーク / Kerja Tim", placeholder: "Kalau pendapatmu berbeda dengan teman kerja, kamu akan bagaimana?" },
  { id: "culture", label: "⑪ 日本の生活への適応 / Adaptasi Kehidupan Jepang", placeholder: "Apakah ada hal yang kamu khawatirkan tentang kehidupan di Jepang?" },
];

const ALL_QUESTIONS = [...QUESTIONS, ...COMMON_QS];

const FACILITY_DEFAULT = {
  name: "社会福祉法人 さくら会",
  location: "東京都品川区南大井（JR大森駅北口 徒歩約10分）",
  jobContent: "介護老人保健施設・在宅サービス・訪問介護・通所リハビリ・高齢者住宅など",
  philosophy: "住み慣れた地域でいつまでも生活が継続できるように支援する。地域密着型の介護とリハビリに力を入れている。",
};

const buildFeedbackPrompt = (facility, answers) => `
Kamu adalah pelatih wawancara kerja untuk posisi perawat (介護) di Jepang.
Berikan feedback dalam Bahasa Indonesia kepada kandidat berdasarkan jawaban mereka.

【Informasi Fasilitas】
Nama: ${facility.name}
Lokasi: ${facility.location}
Pekerjaan: ${facility.jobContent}
Filosofi: ${facility.philosophy}

【Jawaban Kandidat】
${ALL_QUESTIONS.map(q => answers[q.id] ? `${q.label}:\n${answers[q.id]}` : "").filter(Boolean).join("\n\n")}

Berikan feedback dengan format berikut (gunakan Bahasa Indonesia):

✅ Yang sudah bagus:
(sebutkan 2-3 poin positif yang spesifik)

⚠️ Yang perlu diperbaiki:
(sebutkan poin yang kurang spesifik atau perlu ditambah)

💡 Coba tambahkan:
(berikan saran konkret - kaitkan dengan informasi fasilitas ${facility.name})

Jika semua jawaban sudah cukup baik dan spesifik, tambahkan baris ini di akhir:
【SIAP DITERJEMAHKAN】

Jika masih ada yang perlu diperbaiki, JANGAN tambahkan baris tersebut.
`;

const buildConvertPrompt = (facility, answers) => `
Buat teks wawancara kerja dalam bahasa Jepang yang mudah dipahami (やさしい日本語) berdasarkan informasi berikut.

【Informasi Fasilitas】
Nama: ${facility.name}
Lokasi: ${facility.location}
Pekerjaan: ${facility.jobContent}
Filosofi: ${facility.philosophy}

【Jawaban Kandidat (Bahasa Indonesia)】
${ALL_QUESTIONS.map(q => answers[q.id] ? `${q.label}:\n${answers[q.id]}` : "").filter(Boolean).join("\n\n")}

【Aturan Penulisan】
- Gunakan bahasa Jepang yang mudah (setara SD kelas 3)
- Satu kalimat maksimal 20 karakter
- Gunakan です・ます
- Masukkan nama fasilitas, jenis pekerjaan, dan filosofi secara alami
- Gunakan pengalaman dan perasaan kandidat sendiri
- Buat seperti ucapan langsung yang natural

【Format Output】
【自己紹介】
（文章）

【介護を選んだ理由】
（文章）

【介護で大変だと思うこと・その対処】
（文章）

【さくら会を選んだ理由】
（文章）

【よく聞かれる質問への回答】
（各質問に1〜3文で答える形式）
`;

export default function App() {
  const [screen, setScreen] = useState("list");
  const [step, setStep] = useState(0);
  const [facility, setFacility] = useState(FACILITY_DEFAULT);
  const [answers, setAnswers] = useState({});
  const [candidateName, setCandidateName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [converted, setConverted] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "エラーが発生しました";
  };

  const handleFeedback = async () => {
    const filled = ALL_QUESTIONS.filter(q => answers[q.id]?.trim());
    if (filled.length < 4) return alert("最低4つ以上回答してください");
    if (!candidateName.trim()) return alert("候補者名を入力してください");
    setLoading(true);
    setFeedback("");
    setIsReady(false);
    const result = await callAI(buildFeedbackPrompt(facility, answers));
    setFeedback(result);
    setIsReady(result.includes("SIAP DITERJEMAHKAN"));
    setStep(2);
    setLoading(false);
  };

  const handleConvert = async () => {
    setLoading(true);
    setConverted("");
    const result = await callAI(buildConvertPrompt(facility, answers));
    setConverted(result);
    saveCandidate(candidateName, result);
    setStep(3);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(converted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(0); setAnswers({}); setFeedback("");
    setConverted(""); setIsReady(false); setCandidateName("");
    setScreen("list");
  };

  const STEPS = ["施設情報", "候補者回答", "フィードバック", "日本語変換"];

  const styles = {
    wrap: { fontFamily: "'Noto Sans JP', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0e9 100%)", padding: "24px 16px" },
    card: { maxWidth: 700, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", overflow: "hidden" },
    header: { background: "linear-gradient(135deg, #2d7a4f 0%, #4aab72 100%)", padding: "28px 32px", color: "#fff" },
    headerTitle: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 1 },
    headerSub: { fontSize: 13, opacity: 0.85, marginTop: 4 },
    stepper: { display: "flex", background: "#f7faf8", borderBottom: "1px solid #e8ede9" },
    stepItem: (active, done) => ({ flex: 1, padding: "12px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: active ? "#2d7a4f" : done ? "#4aab72" : "#aaa", borderBottom: active ? "3px solid #2d7a4f" : "3px solid transparent" }),
    body: { padding: "28px 32px" },
    label: { fontSize: 13, fontWeight: 700, color: "#2d7a4f", marginBottom: 6, display: "block" },
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb" },
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb", resize: "vertical", minHeight: 80 },
    btn: (color) => ({ padding: "13px 28px", background: color || "#2d7a4f", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }),
    btnOutline: { padding: "10px 20px", background: "#fff", border: "1.5px solid #2d7a4f", color: "#2d7a4f", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
    section: { marginBottom: 20 },
    qBlock: { background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 12, padding: "16px", marginBottom: 14 },
    qLabel: { fontSize: 13, fontWeight: 700, color: "#1a5c36", marginBottom: 8 },
    feedbackBox: { background: "#f0faf4", border: "1.5px solid #a8ddb8", borderRadius: 14, padding: "20px", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.9, color: "#1a3a26" },
    convertBox: { background: "#e8f8f0", border: "1.5px solid #5cb882", borderRadius: 14, padding: "20px", whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 2.0, color: "#1a3a26" },
    badge: (ok) => ({ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: ok ? "#d4f5e2" : "#fff3cd", color: ok ? "#1a6636" : "#856404", marginTop: 12 }),
    divider: { height: 1, background: "#e8ede9", margin: "20px 0" },
    tip: { background: "#fff8e6", border: "1px solid #ffd580", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5a00", marginBottom: 20 },
  };

  if (screen === "list") {
    return (
      <div style={styles.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>🌸</span>
              <div>
                <p style={styles.headerTitle}>介護面接トレーナー</p>
                <p style={styles.headerSub}>候補者一覧</p>
              </div>
            </div>
          </div>
          <div style={styles.body}>
            <button style={{ ...styles.btn(), marginBottom: 24, width: "100%", fontSize: 16 }}
              onClick={() => { setScreen("form"); setStep(0); }}>
              ➕ 新しい候補者を追加
            </button>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <p>まだ候補者がいません</p>
              </div>
            ) : (
              history.map(h => (
                <div key={h.id} style={{ background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#1a5c36" }}>👤 {h.name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>📅 {h.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={styles.btnOutline} onClick={() => { setSelectedCandidate(h); setScreen("detail"); }}>確認</button>
                      <button style={{ ...styles.btnOutline, color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => deleteCandidate(h.id)}>削除</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ background: "#f7faf8", borderTop: "1px solid #e0ece4", padding: "12px 32px", fontSize: 12, color: "#888", textAlign: "center" }}>
            社会福祉法人 さくら会｜面接トレーナー for インドネシア人候補者
          </div>
        </div>
      </div>
    );
  }

  if (screen === "detail" && selectedCandidate) {
    return (
      <div style={styles.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>👤</span>
              <div>
                <p style={styles.headerTitle}>{selectedCandidate.name}</p>
                <p style={styles.headerSub}>📅 {selectedCandidate.date}</p>
              </div>
            </div>
          </div>
          <div style={styles.body}>
            <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>🇯🇵 やさしい日本語</p>
            <div style={styles.convertBox}>{selectedCandidate.result}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button style={styles.btn(copied ? "#888" : "#1a6636")}
                onClick={() => { navigator.clipboard.writeText(selectedCandidate.result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
              </button>
              <button style={styles.btnOutline} onClick={() => setScreen("list")}>← 一覧に戻る</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>🌸</span>
            <div>
              <p style={styles.headerTitle}>介護面接トレーナー</p>
              <p style={styles.headerSub}>インドネシア語 → やさしい日本語</p>
            </div>
          </div>
        </div>
        <div style={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={i} style={styles.stepItem(step === i, step > i)}>
              {step > i ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>
        <div style={styles.body}>
          {step === 0 && (
            <div>
              <div style={styles.tip}>📋 施設情報を確認・編集してください。</div>
              <div style={styles.section}>
                <label style={styles.label}>候補者名（例：Siti Rahayu）</label>
                <input style={{ ...styles.input, borderColor: "#4aab72" }}
                  placeholder="候補者の名前を入力..."
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)} />
              </div>
              {[
                { key: "name", label: "施設名" },
                { key: "location", label: "場所・アクセス" },
                { key: "jobContent", label: "仕事内容" },
                { key: "philosophy", label: "施設の特徴・理念" },
              ].map(f => (
                <div key={f.key} style={styles.section}>
                  <label style={styles.label}>{f.label}</label>
                  {f.key === "philosophy" || f.key === "jobContent" ? (
                    <textarea style={styles.textarea} value={facility[f.key]}
                      onChange={e => setFacility({ ...facility, [f.key]: e.target.value })} />
                  ) : (
                    <input style={styles.input} value={facility[f.key]}
                      onChange={e => setFacility({ ...facility, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 12 }}>
                <button style={styles.btnOutline} onClick={() => setScreen("list")}>← 一覧に戻る</button>
                <button style={styles.btn()} onClick={() => setStep(1)}>次へ：候補者回答へ →</button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <div style={styles.tip}>🇮🇩 インドネシア語で答えてください！</div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", marginBottom: 16 }}>📝 基本的な質問</p>
              {QUESTIONS.map(q => (
                <div key={q.id} style={styles.qBlock}>
                  <div style={styles.qLabel}>{q.label}</div>
                  <textarea style={styles.textarea} placeholder={q.placeholder}
                    value={answers[q.id] || ""}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                </div>
              ))}
              <div style={styles.divider} />
              <p style={{ fontWeight: 700, color: "#2d7a4f", marginBottom: 16 }}>❓ よく聞かれる質問</p>
              {COMMON_QS.map(q => (
                <div key={q.id} style={styles.qBlock}>
                  <div style={styles.qLabel}>{q.label}</div>
                  <textarea style={styles.textarea} placeholder={q.placeholder}
                    value={answers[q.id] || ""}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={styles.btnOutline} onClick={() => setStep(0)}>← 戻る</button>
                <button style={{ ...styles.btn(), opacity: loading ? 0.6 : 1 }}
                  onClick={handleFeedback} disabled={loading}>
                  {loading ? "⏳ 確認中..." : "✨ フィードバックをもらう"}
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>💬 AIからのフィードバック</p>
              <div style={styles.feedbackBox}>{feedback}</div>
              <div style={styles.badge(isReady)}>
                {isReady ? "✅ 内容OK！日本語に変換できます" : "⚠️ 内容を修正してから再送信してください"}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <button style={styles.btnOutline} onClick={() => setStep(1)}>← 回答を修正する</button>
                {isReady && (
                  <button style={{ ...styles.btn("#1a6636"), opacity: loading ? 0.6 : 1 }}
                    onClick={handleConvert} disabled={loading}>
                    {loading ? "⏳ 変換中..." : "🇯🇵 やさしい日本語に変換する"}
                  </button>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>🇯🇵 やさしい日本語に変換されました</p>
              <div style={styles.convertBox}>{converted}</div>
              <div style={{ background: "#e6f4ff", border: "1px solid #90caf9", borderRadius: 10, padding: "12px 16px", marginTop: 16, fontSize: 13, color: "#0d47a1" }}>
                💡 候補者一覧に自動保存されました！
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <button style={styles.btn(copied ? "#888" : "#1a6636")} onClick={handleCopy}>
                  {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
                </button>
                <button style={styles.btnOutline} onClick={() => setScreen("list")}>📋 一覧に戻る</button>
                <button style={styles.btnOutline} onClick={handleReset}>🔄 新しい候補者</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ background: "#f7faf8", borderTop: "1px solid #e0ece4", padding: "12px 32px", fontSize: 12, color: "#888", textAlign: "center" }}>
          社会福祉法人 さくら会｜面接トレーナー for インドネシア人候補者
        </div>
      </div>
    </div>
  );
}
