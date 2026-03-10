import { useState, useEffect } from "react";

// 各質問に「エピソードヒント」を追加 - 個人の体験を引き出す
const QUESTIONS = [
  {
    id: "intro",
    label: "① 自己紹介 / Perkenalan Diri",
    placeholder: "Nama, asal daerah, keluarga, pengalaman kerja...",
    episodeHint: "あなたの地元ならではのことや、家族のエピソードを1つ教えてください",
    episodeHintId: "Ceritakan 1 hal unik dari kampung halamanmu atau keluargamu",
  },
  {
    id: "reason",
    label: "② 介護を選んだ理由 / Alasan Memilih Perawatan",
    placeholder: "Kenapa kamu ingin bekerja di bidang perawatan?",
    episodeHint: "介護・医療に関わる「具体的な出来事や体験」はありますか？",
    episodeHintId: "Ada kejadian/pengalaman nyata yang membuatmu tertarik dengan perawatan?",
  },
  {
    id: "hardship",
    label: "③ 介護で大変だと思うこと / Hal Sulit dalam Perawatan",
    placeholder: "Apa yang paling sulit dalam pekerjaan perawatan?",
    episodeHint: "過去に誰かを助けたり、大変だった経験はありますか？",
    episodeHintId: "Punya pengalaman membantu orang lain yang terasa sulit?",
  },
  {
    id: "whySakura",
    label: "④ なぜさくら会を選んだか / Kenapa Memilih Sakurakai",
    placeholder: "Kenapa kamu ingin bekerja di Sakurakai, Shinagawa?",
    episodeHint: "さくら会の理念（地域密着）を読んで、何を思いましたか？",
    episodeHintId: "Setelah baca filosofi Sakurakai, apa yang kamu rasakan?",
  },
  {
    id: "health",
    label: "⑤ 体力・健康 / Kesehatan & Stamina",
    placeholder: "Apakah kamu bisa kerja shift malam?",
    episodeHint: "体力に自信があると思った具体的な経験はありますか？",
    episodeHintId: "Ada pengalaman yang membuatmu yakin punya stamina kuat?",
  },
  {
    id: "personality",
    label: "⑥ 性格・長所短所 / Kepribadian & Kelebihan/Kekurangan",
    placeholder: "Apa kelebihan dan kekuranganmu?",
    episodeHint: "あなたの長所が活きた「実際のエピソード」を1つ",
    episodeHintId: "Ceritakan 1 kejadian nyata di mana kelebihanmu berguna",
  },
  {
    id: "trouble",
    label: "⑦ 困ったときの対処 / Cara Mengatasi Masalah",
    placeholder: "Kalau ada masalah saat bekerja, kamu akan bagaimana?",
    episodeHint: "過去に職場や学校で問題が起きたとき、どう対処しましたか？",
    episodeHintId: "Ceritakan saat kamu menghadapi masalah di kerja/sekolah",
  },
  {
    id: "japanese",
    label: "⑧ 日本語の勉強 / Belajar Bahasa Jepang",
    placeholder: "Sekarang kamu belajar bahasa Jepang seperti apa?",
    episodeHint: "日本語で「はじめて会話できた」嬉しかった瞬間はありますか？",
    episodeHintId: "Ada momen bahagia saat pertama kali berhasil bicara Bahasa Jepang?",
  },
  {
    id: "future",
    label: "⑨ 将来の目標 / Tujuan Masa Depan",
    placeholder: "3〜5 tahun ke depan, kamu ingin jadi perawat seperti apa?",
    episodeHint: "「こんな介護士になりたい」と思った、憧れの人はいますか？",
    episodeHintId: "Ada perawat atau orang yang jadi idolamu? Kenapa?",
  },
  {
    id: "teamwork",
    label: "⑩ チームワーク / Kerja Tim",
    placeholder: "Kalau pendapatmu berbeda dengan teman kerja?",
    episodeHint: "チームで意見が違った、実際の経験を教えてください",
    episodeHintId: "Ceritakan pengalaman nyata perbedaan pendapat di tim",
  },
  {
    id: "culture",
    label: "⑪ 日本の生活への適応 / Adaptasi Kehidupan Jepang",
    placeholder: "Ada hal yang kamu khawatirkan tentang kehidupan di Jepang?",
    episodeHint: "日本についてリサーチして「驚いた」ことはありますか？",
    episodeHintId: "Ada hal yang mengejutkan setelah kamu riset tentang Jepang?",
  },
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

const JA_LEVELS = ["N5（基礎）", "N4（初級）", "N3（中級）", "N2（上級）", "N1（流暢）"];
const CARE_EXP = ["なし / Belum ada", "1年未満 / Kurang 1 tahun", "1〜3年 / 1-3 tahun", "3年以上 / 3+ tahun"];

// エピソードを含めた個別フィードバックプロンプト
const buildFeedbackPrompt = (answers, episodes, profile) => {
  const answeredQuestions = QUESTIONS.filter(q => answers[q.id]?.trim());
  return `Kamu adalah pelatih wawancara kerja senior untuk posisi kaigo (介護) di Jepang.

=== PROFIL KANDIDAT ===
Nama: ${profile.name}
Asal: ${profile.origin || "-"}
Level Jepang: ${profile.jaLevel || "-"}
Pengalaman: ${profile.careExp || "-"}
Motivasi khusus: ${profile.motivation || "-"}

=== JAWABAN + EPISODE PRIBADI ===
${answeredQuestions.map(q => {
  const ep = episodes[q.id]?.trim();
  return `[${q.id}]
Episode pribadi: ${ep || "(tidak diisi)"}
Jawaban interview: "${answers[q.id]}"`;
}).join("\n\n")}

=== TUGAS ===
Untuk setiap jawaban, evaluasi:
1. Apakah jawaban menggunakan episode pribadi yang ditulis? (originality check)
2. Apakah ada bagian yang terdengar seperti template umum?
3. Berikan saran SPESIFIK bagaimana memasukkan episode pribadi ke dalam jawaban

Balas HANYA dengan JSON array:
[{"id":"...", "status":"good/improve", "originality":"original/template", "feedback":"...", "feedbackJa":"...", "example":"..."}]

Aturan:
- status "good" = jawaban bagus dan orisinil
- status "improve" = perlu perbaikan
- originality "template" = jawaban terlalu umum/generik, WAJIB kasih contoh yang pakai episode pribadi
- originality "original" = jawaban sudah personal dan spesifik  
- feedback: 20-40 kata, HARUS sebut bagian spesifik dari jawaban atau episode
- feedbackJa: ringkasan 10 kata Bahasa Jepang
- example: jika status "improve", buat contoh yang MEMASUKKAN episode pribadi kandidat (bukan template)
- Sertakan semua ${answeredQuestions.length} pertanyaan`;
};

const buildConvertPrompt = (answers, episodes, profile) => `
Buat teks wawancara dalam bahasa Jepang mudah (やさしい日本語) yang ORISINIL untuk ${profile.name}.

Profil:
- Asal: ${profile.origin || "-"}
- Level Jepang: ${profile.jaLevel || "-"}  
- Pengalaman: ${profile.careExp || "-"}
- Motivasi: ${profile.motivation || "-"}

Fasilitas tujuan: ${FACILITY.name}

Jawaban + Episode Pribadi:
${QUESTIONS.map(q => {
  if (!answers[q.id]) return "";
  const ep = episodes[q.id]?.trim();
  return `${q.label}:
Episode: ${ep || "-"}
Jawaban: ${answers[q.id]}`;
}).filter(Boolean).join("\n\n")}

PENTING:
- Masukkan episode/pengalaman pribadi ke dalam teks Jepang agar terasa UNIK
- Bahasa Jepang mudah, kalimat pendek, です・ます調
- JANGAN gunakan ** atau markdown
- JANGAN tambahkan --- di akhir
- Format dengan header 【】`;

export default function App() {
  const [screen, setScreen] = useState("list");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [episodes, setEpisodes] = useState({}); // 各質問のエピソード
  const [profile, setProfile] = useState({ name: "", origin: "", jaLevel: "", careExp: "", motivation: "" });
  const [feedbackList, setFeedbackList] = useState([]);
  const [converted, setConverted] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showEpisode, setShowEpisode] = useState({}); // 各質問のエピソード表示トグル

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
    if (!apiKey) throw new Error("APIキーが設定されていません");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8000, temperature: 0.7 }
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`APIエラー ${res.status}: ${err?.error?.message || res.statusText}`);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("AIからの応答が空です");
    return text;
  };

  const handleFeedback = async () => {
    const filled = QUESTIONS.filter(q => answers[q.id]?.trim());
    if (filled.length < 4) { setErrorMsg("最低4つ以上回答してください"); return; }
    if (!profile.name.trim()) { setErrorMsg("候補者名を入力してください"); return; }
    setLoading(true);
    setLoadingMsg("AIが個別フィードバックを作成中... (10〜20秒)");
    setFeedbackList([]);
    setErrorMsg("");
    try {
      const result = await callAI(buildFeedbackPrompt(answers, episodes, profile));
      const match = result.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("JSONが見つかりません。再試行してください。");
      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("JSON形式が正しくありません");
      setFeedbackList(parsed);
      setStep(2);
    } catch (e) {
      setErrorMsg(`エラー: ${e.message}`);
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
      const result = await callAI(buildConvertPrompt(answers, episodes, profile));
      setConverted(result);
      saveCandidate(profile.name, result);
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
    setStep(0); setAnswers({}); setEpisodes({}); setFeedbackList([]);
    setConverted(""); setProfile({ name: "", origin: "", jaLevel: "", careExp: "", motivation: "" });
    setEditingId(null); setErrorMsg(""); setScreen("list"); setShowEpisode({});
  };

  // テンプレート率を計算
  const templateCount = feedbackList.filter(f => f.originality === "template").length;
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
    btnTiny: (color, textColor) => ({ padding: "4px 10px", background: color || "#f0f7f3", color: textColor || "#2d7a4f", border: `1px solid ${color ? "transparent" : "#c8e6d4"}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }),
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb" },
    select: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb" },
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e8d8", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fdfb", resize: "vertical", minHeight: 80 },
    episodeBox: { background: "#fffaf0", border: "1.5px dashed #f6b93b", borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
    episodeTextarea: { width: "100%", padding: "8px 12px", border: "1px solid #f6b93b", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fffef8", resize: "vertical", minHeight: 60 },
    label: { fontSize: 13, fontWeight: 700, color: "#2d7a4f", marginBottom: 6, display: "block" },
    infoBox: { background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 10, padding: "12px 14px", marginBottom: 12 },
    qBlock: { background: "#f7fdf9", border: "1px solid #d8f0e2", borderRadius: 12, padding: "16px", marginBottom: 14 },
    divider: { height: 1, background: "#e8ede9", margin: "20px 0" },
    tip: { background: "#fff8e6", border: "1px solid #ffd580", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5a00", marginBottom: 20 },
    episodeTip: { background: "#fff5e0", border: "1px solid #f6b93b", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a4000", marginBottom: 16 },
    profileTip: { background: "#e8f4ff", border: "1px solid #90caf9", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1a4a7a", marginBottom: 20 },
    error: { background: "#fff0f0", border: "1.5px solid #ffb3b3", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#cc0000", marginBottom: 16 },
    loadingBox: { background: "#e8f8f0", border: "1px solid #a8ddb8", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1a6636", marginBottom: 16, textAlign: "center" },
    convertBox: { background: "#e8f8f0", border: "1.5px solid #5cb882", borderRadius: 14, padding: "20px", whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 2.0, color: "#1a3a26" },
    footer: { background: "#f7faf8", borderTop: "1px solid #e0ece4", padding: "12px 32px", fontSize: 12, color: "#888", textAlign: "center" },
    profileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
    profileBadge: { display: "inline-block", background: "#e8f4ff", border: "1px solid #90caf9", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#1a4a7a", marginRight: 6, marginBottom: 4 },
    templateBadge: { display: "inline-block", background: "#fff0e0", border: "1px solid #f6a623", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#c05c00", marginLeft: 6 },
    originalBadge: { display: "inline-block", background: "#e0f7e9", border: "1px solid #4caf50", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#1a6636", marginLeft: 6 },
  };

  // 一覧画面
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

  // 詳細画面
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

  // メインフォーム
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

          {/* STEP 0: プロフィール + 施設情報 */}
          {step === 0 && (
            <div>
              <div style={s.profileTip}>
                💡 プロフィールを詳しく書くほど、<strong>その人だけのフィードバック</strong>になります！<br />
                <span style={{ fontSize: 12 }}>Semakin lengkap, semakin personal feedbacknya!</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>候補者名 / Nama Kandidat <span style={{ color: "#e53e3e" }}>*</span></label>
                <input style={{ ...s.input, borderColor: "#4aab72" }} placeholder="例：Siti Rahayu"
                  value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div style={s.profileGrid}>
                <div>
                  <label style={s.label}>出身地 / Asal Daerah</label>
                  <input style={s.input} placeholder="例：Bandung, Jawa Barat"
                    value={profile.origin} onChange={e => setProfile({ ...profile, origin: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>日本語レベル / Level Jepang</label>
                  <select style={s.select} value={profile.jaLevel}
                    onChange={e => setProfile({ ...profile, jaLevel: e.target.value })}>
                    <option value="">選択してください</option>
                    {JA_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>介護経験 / Pengalaman Perawatan</label>
                <select style={s.select} value={profile.careExp}
                  onChange={e => setProfile({ ...profile, careExp: e.target.value })}>
                  <option value="">選択してください</option>
                  {CARE_EXP.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>志望動機・特記事項 / Motivasi Khusus</label>
                <textarea style={{ ...s.textarea, minHeight: 60 }}
                  placeholder="例：祖母を介護した経験あり / Ada pengalaman merawat nenek..."
                  value={profile.motivation} onChange={e => setProfile({ ...profile, motivation: e.target.value })} />
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
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button style={s.btnOutline} onClick={() => setScreen("list")}>← 一覧に戻る</button>
                <button style={s.btn()} onClick={() => { setErrorMsg(""); setStep(1); }}>次へ：回答入力へ →</button>
              </div>
            </div>
          )}

          {/* STEP 1: 回答入力（エピソード欄付き） */}
          {step === 1 && (
            <div>
              {/* プロフィールバッジ */}
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f0f7ff", borderRadius: 10, border: "1px solid #c3deff" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a4a7a" }}>👤 {profile.name}　</span>
                {profile.origin && <span style={s.profileBadge}>📍 {profile.origin}</span>}
                {profile.jaLevel && <span style={s.profileBadge}>🇯🇵 {profile.jaLevel}</span>}
                {profile.careExp && <span style={s.profileBadge}>💼 {profile.careExp}</span>}
              </div>

              <div style={s.episodeTip}>
                ✨ <strong>オリジナリティのコツ：</strong>各質問の前に「あなただけのエピソード」を書くと、テンプレートにならない回答ができます！<br />
                <span style={{ fontSize: 12 }}>Kunci orisinalitas: tulis pengalaman PRIBADIMU sebelum menjawab!</span>
              </div>

              <div style={s.tip}>🇮🇩 回答はインドネシア語で！ / Jawab dalam Bahasa Indonesia!</div>

              {errorMsg && <div style={s.error}>⚠️ {errorMsg}</div>}
              {loading && <div style={s.loadingBox}>⏳ {loadingMsg}</div>}

              {QUESTIONS.map(q => (
                <div key={q.id} style={s.qBlock}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a5c36", marginBottom: 10 }}>{q.label}</div>

                  {/* エピソード欄（トグル） */}
                  <div style={s.episodeBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showEpisode[q.id] || episodes[q.id] ? 8 : 0 }}>
                      <div style={{ fontSize: 12, color: "#c05c00" }}>
                        📖 <strong>あなたのエピソード（任意）</strong>
                        {episodes[q.id] && <span style={{ color: "#4aab72", marginLeft: 6 }}>✓ 入力済み</span>}
                      </div>
                      <button style={s.btnTiny(showEpisode[q.id] || episodes[q.id] ? "#f6b93b" : undefined, showEpisode[q.id] || episodes[q.id] ? "#fff" : undefined)}
                        onClick={() => setShowEpisode({ ...showEpisode, [q.id]: !showEpisode[q.id] })}>
                        {showEpisode[q.id] ? "▲ 閉じる" : (episodes[q.id] ? "✏️ 編集" : "▼ 開く")}
                      </button>
                    </div>
                    {(showEpisode[q.id] || (!showEpisode[q.id] && !episodes[q.id] && false)) && (
                      <div>
                        <div style={{ fontSize: 11, color: "#7a4000", marginBottom: 6 }}>
                          💡 {q.episodeHint}<br />
                          <span style={{ color: "#a07030" }}>→ {q.episodeHintId}</span>
                        </div>
                        <textarea style={s.episodeTextarea}
                          placeholder="自由に書いてください / Tulis bebas dalam bahasa apapun..."
                          value={episodes[q.id] || ""}
                          onChange={e => setEpisodes({ ...episodes, [q.id]: e.target.value })} />
                      </div>
                    )}
                    {!showEpisode[q.id] && !episodes[q.id] && (
                      <div style={{ fontSize: 11, color: "#b07030" }}>
                        💡 {q.episodeHintId}
                      </div>
                    )}
                  </div>

                  {/* 回答欄 */}
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

          {/* STEP 2: フィードバック（オリジナリティ表示付き） */}
          {step === 2 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 4 }}>
                💬 {profile.name} さんへのフィードバック
              </p>

              {/* オリジナリティスコア */}
              {feedbackList.length > 0 && (
                <div style={{ background: templateCount > 0 ? "#fff8e6" : "#e8f8f0", border: `1px solid ${templateCount > 0 ? "#f6b93b" : "#5cb882"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: templateCount > 0 ? "#7a4000" : "#1a6636", marginBottom: 4 }}>
                    {templateCount === 0
                      ? "✅ 全回答がオリジナルです！素晴らしい！"
                      : `⚠️ ${templateCount}つの回答がテンプレート傾向あり → エピソードを追加して修正しましょう`}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      🟢 オリジナル: {feedbackList.filter(f => f.originality === "original").length}問　
                      🟠 テンプレート: {templateCount}問
                    </span>
                  </div>
                </div>
              )}

              <div style={s.tip}>
                🟢 = 良い回答　🔴 = 要修正　🟠 テンプレート = エピソードを追加して！
              </div>
              {errorMsg && <div style={s.error}>⚠️ {errorMsg}</div>}

              {QUESTIONS.map(q => {
                const fb = feedbackList.find(f => f.id === q.id);
                if (!answers[q.id]?.trim()) return null;
                const isGood = fb?.status === "good";
                const isTemplate = fb?.originality === "template";
                const bgColor = isGood && !isTemplate ? "#f0faf4" : isTemplate ? "#fffaf0" : "#fff8f0";
                const borderColor = isGood && !isTemplate ? "#a8ddb8" : isTemplate ? "#f6b93b" : "#f6ad8f";

                return (
                  <div key={q.id} style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a5c36", flex: 1, marginRight: 8 }}>
                        {isGood && !isTemplate ? "🟢" : isTemplate ? "🟠" : "🔴"} {q.label}
                        {fb && (
                          <span style={isTemplate ? s.templateBadge : (fb.originality === "original" ? s.originalBadge : {})}>
                            {isTemplate ? "テンプレート" : fb.originality === "original" ? "オリジナル ✨" : ""}
                          </span>
                        )}
                      </div>
                      <button style={s.btnSmall(editingId === q.id ? "#888" : "#2d7a4f")}
                        onClick={() => setEditingId(editingId === q.id ? null : q.id)}>
                        {editingId === q.id ? "✅ 閉じる" : "✏️ 編集"}
                      </button>
                    </div>

                    {/* エピソード表示 */}
                    {episodes[q.id] && (
                      <div style={{ background: "#fffbf0", border: "1px dashed #f6b93b", borderRadius: 8, padding: "6px 10px", marginBottom: 8, fontSize: 12, color: "#7a4000" }}>
                        📖 エピソード: {episodes[q.id]}
                      </div>
                    )}

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
                      <div>
                        <div style={{ fontSize: 13, color: isGood && !isTemplate ? "#1a6636" : isTemplate ? "#7a4000" : "#8b4513", marginBottom: 4 }}>
                          💬 {fb.feedback}
                        </div>
                        {fb.feedbackJa && (
                          <div style={{ fontSize: 12, color: "#666", marginBottom: fb.example ? 8 : 0, fontStyle: "italic" }}>
                            🇯🇵 {fb.feedbackJa}
                          </div>
                        )}
                      </div>
                    )}

                    {fb?.example && (!isGood || isTemplate) && (
                      <div style={{ background: "#fffbea", border: "1px solid #ffd580", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#b7791f", marginBottom: 6 }}>
                          💡 {isTemplate ? "エピソードを入れた改善例 / Contoh dengan episode pribadi:" : "改善例文:"}
                        </div>
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
                {allGood ? `✅ ${profile.name}さんの全回答がOKです！` : `⚠️ 🔴・🟠の回答を修正してから変換することをおすすめします`}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button style={s.btnOutline} onClick={() => { setStep(1); setEditingId(null); }}>← 回答に戻る</button>
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

          {/* STEP 3: 日本語変換 */}
          {step === 3 && (
            <div>
              <p style={{ fontWeight: 700, color: "#2d7a4f", fontSize: 16, marginBottom: 16 }}>
                🇯🇵 {profile.name} さんのやさしい日本語
              </p>
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
