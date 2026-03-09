import { useState, useEffect } from "react";

// ========== 職種定義 ==========
const JOB_TYPES = [
  { id: "kaigo",     emoji: "🏥", label: "介護",       labelId: "Perawatan Lansia" },
  { id: "seizou",    emoji: "🏭", label: "製造・工場", labelId: "Pabrik / Manufaktur" },
  { id: "kensetsu",  emoji: "🏗️", label: "建設・土木", labelId: "Konstruksi" },
  { id: "nougyou",   emoji: "🌾", label: "農業・漁業", labelId: "Pertanian / Perikanan" },
  { id: "insyoku",   emoji: "🍽️", label: "飲食・ホテル", labelId: "F&B / Hotel" },
  { id: "jimu",      emoji: "💼", label: "事務・IT",   labelId: "Administrasi / IT" },
  { id: "other",     emoji: "⭐", label: "その他",     labelId: "Lainnya" },
];

// ========== 職種別質問 ==========
const QUESTIONS_BY_JOB = {
  kaigo: [
    { id: "intro",       label: "① 自己紹介",           labelId: "Perkenalan Diri",              placeholder: "Nama, asal, keluarga, pengalaman kerja...", episodeHint: "地元や家族の印象的なエピソードを1つ", episodeHintId: "Ceritakan 1 hal unik tentang kampung halaman atau keluargamu" },
    { id: "reason",      label: "② 介護を選んだ理由",    labelId: "Alasan Memilih Perawatan",     placeholder: "Kenapa tertarik di bidang perawatan?", episodeHint: "介護・医療に触れた具体的な体験", episodeHintId: "Pengalaman nyata yang membuatmu tertarik dengan perawatan" },
    { id: "hardship",    label: "③ 大変だと思うこと",    labelId: "Hal Sulit dalam Perawatan",    placeholder: "Apa yang paling sulit dalam perawatan?", episodeHint: "誰かを助けた・大変だった経験", episodeHintId: "Pengalaman membantu orang lain yang sulit" },
    { id: "whyHere",     label: "④ なぜこの施設を選んだか", labelId: "Kenapa Memilih Fasilitas Ini", placeholder: "Kenapa ingin kerja di fasilitas ini?", episodeHint: "施設の理念を読んで共感したこと", episodeHintId: "Apa yang membuatmu cocok dengan filosofi fasilitas ini" },
    { id: "health",      label: "⑤ 体力・健康",          labelId: "Kesehatan & Stamina",          placeholder: "Apakah bisa kerja shift malam?", episodeHint: "体力に自信があると感じた体験", episodeHintId: "Pengalaman yang membuktikan staminamu kuat" },
    { id: "personality", label: "⑥ 性格・長所短所",      labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "長所が発揮された実際のエピソード", episodeHintId: "Kejadian nyata di mana kelebihanmu terlihat" },
    { id: "trouble",     label: "⑦ 困ったときの対処",    labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau ada masalah kerja, kamu akan bagaimana?", episodeHint: "過去の問題をどう解決したか", episodeHintId: "Bagaimana kamu mengatasi masalah di tempat kerja/sekolah" },
    { id: "japanese",    label: "⑧ 日本語の勉強",        labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本語で会話できて嬉しかった瞬間", episodeHintId: "Momen pertama berhasil bicara Bahasa Jepang" },
    { id: "future",      label: "⑨ 将来の目標",          labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin jadi perawat seperti apa?", episodeHint: "目標にしている介護士・ロールモデル", episodeHintId: "Ada perawat yang jadi idolamu?" },
    { id: "teamwork",    label: "⑩ チームワーク",        labelId: "Kerja Tim",                    placeholder: "Kalau pendapat berbeda dengan rekan kerja?", episodeHint: "チームで意見が割れた実体験", episodeHintId: "Pengalaman nyata perbedaan pendapat di tim" },
    { id: "culture",     label: "⑪ 日本生活への適応",    labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本をリサーチして気づいたこと", episodeHintId: "Hal mengejutkan setelah riset tentang Jepang" },
  ],
  seizou: [
    { id: "intro",       label: "① 自己紹介",             labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pengalaman kerja...", episodeHint: "地元での仕事や手仕事の経験", episodeHintId: "Pengalaman kerja tangan atau skill teknis di kampung halaman" },
    { id: "reason",      label: "② 製造業を選んだ理由",   labelId: "Alasan Memilih Manufaktur",    placeholder: "Kenapa ingin kerja di pabrik/manufaktur?", episodeHint: "ものを作る・修理した思い出", episodeHintId: "Pengalaman membuat atau memperbaiki sesuatu" },
    { id: "experience",  label: "③ 工場・製造の経験",      labelId: "Pengalaman Pabrik",            placeholder: "Punya pengalaman kerja di pabrik atau industri?", episodeHint: "機械や道具を使った具体的な経験", episodeHintId: "Pengalaman menggunakan mesin atau peralatan" },
    { id: "whyHere",     label: "④ なぜこの会社を選んだか", labelId: "Kenapa Memilih Perusahaan Ini", placeholder: "Kenapa ingin kerja di perusahaan ini?", episodeHint: "この会社の製品や事業に共感した理由", episodeHintId: "Apa yang menarikmu dari produk/bisnis perusahaan ini" },
    { id: "health",      label: "⑤ 体力・安全意識",       labelId: "Stamina & Kesadaran Keselamatan", placeholder: "Bisa kerja shift, berdiri lama, angkat barang berat?", episodeHint: "体力仕事をこなした体験", episodeHintId: "Pengalaman pekerjaan fisik yang berat" },
    { id: "quality",     label: "⑥ 品質・正確さへの意識",  labelId: "Kesadaran Kualitas",          placeholder: "Bagaimana sikapmu terhadap kualitas dan ketelitian?", episodeHint: "丁寧・正確さが求められた作業の体験", episodeHintId: "Pengalaman kerja yang membutuhkan ketelitian tinggi" },
    { id: "personality", label: "⑦ 性格・長所短所",       labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "工場・製造に向いていると感じる長所", episodeHintId: "Kelebihanmu yang cocok untuk pekerjaan pabrik" },
    { id: "trouble",     label: "⑧ 困ったときの対処",     labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau mesin bermasalah atau ada kesalahan produksi?", episodeHint: "作業中のトラブルをどう解決したか", episodeHintId: "Bagaimana kamu mengatasi masalah saat bekerja" },
    { id: "japanese",    label: "⑨ 日本語の勉強",         labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本語の勉強のきっかけ・楽しかった経験", episodeHintId: "Apa yang memotivasimu belajar Bahasa Jepang" },
    { id: "future",      label: "⑩ 将来の目標",           labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin jadi teknisi seperti apa?", episodeHint: "なりたい職人・技術者のイメージ", episodeHintId: "Gambaran teknisi/ahli yang ingin kamu jadi" },
    { id: "culture",     label: "⑪ 日本生活への適応",     labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本の職場文化で気になること", episodeHintId: "Hal tentang budaya kerja Jepang yang membuatmu penasaran" },
  ],
  kensetsu: [
    { id: "intro",       label: "① 自己紹介",               labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pengalaman kerja...", episodeHint: "地元での建設・土木に関わる経験", episodeHintId: "Pengalaman konstruksi atau pekerjaan fisik di kampung halaman" },
    { id: "reason",      label: "② 建設を選んだ理由",       labelId: "Alasan Memilih Konstruksi",    placeholder: "Kenapa ingin kerja di bidang konstruksi?", episodeHint: "建物や構造物を作ること・直すことへの関心", episodeHintId: "Pengalaman yang membuatmu tertarik pada konstruksi" },
    { id: "experience",  label: "③ 建設・工事の経験",       labelId: "Pengalaman Konstruksi",        placeholder: "Punya pengalaman konstruksi, tukang, dsb?", episodeHint: "建設・大工・土木での具体的な作業体験", episodeHintId: "Pengalaman spesifik dalam pekerjaan konstruksi" },
    { id: "whyHere",     label: "④ なぜこの会社を選んだか", labelId: "Kenapa Memilih Perusahaan Ini", placeholder: "Kenapa ingin kerja di perusahaan ini?", episodeHint: "この会社の工事実績や姿勢に惹かれた理由", episodeHintId: "Apa yang menarikmu dari perusahaan ini" },
    { id: "health",      label: "⑤ 体力・安全意識",         labelId: "Stamina & Keselamatan Kerja",  placeholder: "Bisa kerja outdoor, cuaca panas, angkat berat?", episodeHint: "体力を要する仕事をした具体的な体験", episodeHintId: "Pengalaman kerja fisik berat di luar ruangan" },
    { id: "skill",       label: "⑥ 技術・スキル",           labelId: "Keahlian & Skill",             placeholder: "Skill apa yang kamu punya untuk pekerjaan ini?", episodeHint: "持っている資格・技能・工具の扱い経験", episodeHintId: "Sertifikat, keahlian, atau pengalaman menggunakan alat" },
    { id: "personality", label: "⑦ 性格・長所短所",         labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "建設現場で活きる長所のエピソード", episodeHintId: "Kelebihanmu yang berguna di lapangan konstruksi" },
    { id: "trouble",     label: "⑧ 困ったときの対処",       labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau ada kecelakaan kerja atau masalah di lapangan?", episodeHint: "現場でのトラブル対応の経験", episodeHintId: "Pengalaman mengatasi situasi sulit di lapangan" },
    { id: "japanese",    label: "⑨ 日本語の勉強",           labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "現場での日本語コミュニケーションの必要性を感じた体験", episodeHintId: "Kapan kamu merasa perlu bisa berbahasa Jepang" },
    { id: "future",      label: "⑩ 将来の目標",             labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin jadi teknisi seperti apa?", episodeHint: "目指したい職人・施工管理者のイメージ", episodeHintId: "Gambaran tukang ahli yang ingin kamu capai" },
    { id: "culture",     label: "⑪ 日本生活への適応",       labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本の職場ルールで気になること", episodeHintId: "Aturan kerja Jepang yang membuatmu penasaran" },
  ],
  nougyou: [
    { id: "intro",       label: "① 自己紹介",               labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pengalaman pertanian...", episodeHint: "農業・漁業のある地元のエピソード", episodeHintId: "Cerita tentang pertanian atau perikanan di kampung halamanmu" },
    { id: "reason",      label: "② 農業・漁業を選んだ理由", labelId: "Alasan Memilih Pertanian",     placeholder: "Kenapa ingin kerja di bidang pertanian/perikanan?", episodeHint: "農作物・自然と関わった思い出", episodeHintId: "Pengalaman berinteraksi dengan alam, tanaman, atau ikan" },
    { id: "experience",  label: "③ 農業・漁業の経験",       labelId: "Pengalaman Pertanian",         placeholder: "Punya pengalaman bertani, berkebun, atau nelayan?", episodeHint: "農作業・漁作業での具体的な体験", episodeHintId: "Pengalaman spesifik bekerja di ladang atau laut" },
    { id: "whyHere",     label: "④ なぜここを選んだか",     labelId: "Kenapa Memilih Tempat Ini",    placeholder: "Kenapa ingin kerja di sini?", episodeHint: "農場・漁場の環境や作物に惹かれた理由", episodeHintId: "Apa yang menarikmu dari tempat ini" },
    { id: "health",      label: "⑤ 体力・季節対応",         labelId: "Stamina & Ketahanan Cuaca",    placeholder: "Bisa kerja outdoor, dalam cuaca panas/dingin?", episodeHint: "屋外で長時間作業した体験", episodeHintId: "Pengalaman bekerja di luar ruangan dalam waktu lama" },
    { id: "personality", label: "⑥ 性格・長所短所",         labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "農業・自然の仕事に向いている自分の特徴", episodeHintId: "Karakter dirimu yang cocok dengan pekerjaan alam" },
    { id: "trouble",     label: "⑦ 困ったときの対処",       labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau ada masalah (cuaca buruk, gagal panen, dsb)?", episodeHint: "農作物・天気のトラブルをどう乗り越えたか", episodeHintId: "Bagaimana kamu mengatasi gagal panen atau cuaca buruk" },
    { id: "japanese",    label: "⑧ 日本語の勉強",           labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本の農業技術や文化に興味を持ったきっかけ", episodeHintId: "Apa yang membuatmu tertarik dengan pertanian Jepang" },
    { id: "future",      label: "⑨ 将来の目標",             labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin berkembang seperti apa?", episodeHint: "農業の技術・知識で伸ばしたいこと", episodeHintId: "Skill pertanian apa yang ingin kamu kuasai" },
    { id: "culture",     label: "⑩ 日本生活への適応",       labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本の農村生活について調べて気になること", episodeHintId: "Hal tentang kehidupan pedesaan Jepang yang membuatmu penasaran" },
  ],
  insyoku: [
    { id: "intro",       label: "① 自己紹介",               labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pengalaman servis...", episodeHint: "地元での接客・料理に関わる思い出", episodeHintId: "Pengalaman melayani orang atau memasak di kampung halaman" },
    { id: "reason",      label: "② この職種を選んだ理由",   labelId: "Alasan Memilih Bidang Ini",    placeholder: "Kenapa ingin kerja di restoran/hotel?", episodeHint: "食・おもてなしへの関心のきっかけ", episodeHintId: "Pengalaman yang membuatmu tertarik pada dunia kuliner/hospitality" },
    { id: "experience",  label: "③ 飲食・接客の経験",       labelId: "Pengalaman F&B / Servis",      placeholder: "Punya pengalaman kerja di restoran, kafe, atau hotel?", episodeHint: "接客・調理・ホテル業務での具体的な体験", episodeHintId: "Pengalaman spesifik di bidang servis atau masak" },
    { id: "whyHere",     label: "④ なぜここを選んだか",     labelId: "Kenapa Memilih Tempat Ini",    placeholder: "Kenapa ingin kerja di tempat ini?", episodeHint: "この店・ホテルの雰囲気や料理に惹かれた理由", episodeHintId: "Apa yang menarikmu dari tempat ini" },
    { id: "customer",    label: "⑤ お客様対応",             labelId: "Pelayanan Pelanggan",          placeholder: "Bagaimana cara kamu melayani tamu dengan baik?", episodeHint: "お客様を喜ばせた、褒められた体験", episodeHintId: "Pengalaman membuat pelanggan senang atau mendapat pujian" },
    { id: "personality", label: "⑥ 性格・長所短所",         labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "接客業に向いている自分の特徴のエピソード", episodeHintId: "Karakter dirimu yang cocok untuk servis" },
    { id: "trouble",     label: "⑦ クレーム・困ったときの対処", labelId: "Menangani Komplain",       placeholder: "Kalau ada tamu yang tidak puas atau komplain?", episodeHint: "クレームや難しいお客様への対応経験", episodeHintId: "Pengalaman menghadapi pelanggan yang komplain" },
    { id: "japanese",    label: "⑧ 日本語の勉強",           labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本の飲食文化・食べ物への興味", episodeHintId: "Makanan atau budaya kuliner Jepang yang kamu sukai" },
    { id: "future",      label: "⑨ 将来の目標",             labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin berkembang seperti apa?", episodeHint: "目指したい料理人・ホテリエのイメージ", episodeHintId: "Gambaran chef atau hospitality professional yang ingin kamu capai" },
    { id: "culture",     label: "⑩ 日本生活への適応",       labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本のサービス文化で驚いたこと", episodeHintId: "Hal tentang budaya servis Jepang yang mengejutkanmu" },
  ],
  jimu: [
    { id: "intro",       label: "① 自己紹介",               labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pendidikan, pengalaman...", episodeHint: "学業・仕事でのIT・事務の経験", episodeHintId: "Pengalaman IT atau administrasi di sekolah/kerja" },
    { id: "reason",      label: "② この職種を選んだ理由",   labelId: "Alasan Memilih Bidang Ini",    placeholder: "Kenapa ingin kerja di bidang ini?", episodeHint: "パソコン・データ処理に興味を持ったきっかけ", episodeHintId: "Pengalaman yang membuatmu tertarik dengan IT/administrasi" },
    { id: "skill",       label: "③ PCスキル・資格",         labelId: "Skill PC & Sertifikat",        placeholder: "Skill komputer apa yang kamu punya?", episodeHint: "Excel・プログラミング等を使った具体的な作業体験", episodeHintId: "Pengalaman spesifik menggunakan Excel, coding, atau tools lain" },
    { id: "whyHere",     label: "④ なぜここを選んだか",     labelId: "Kenapa Memilih Tempat Ini",    placeholder: "Kenapa ingin kerja di perusahaan ini?", episodeHint: "会社のビジネス・サービスに共感した理由", episodeHintId: "Apa yang menarikmu dari bisnis perusahaan ini" },
    { id: "personality", label: "⑤ 性格・長所短所",         labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "事務・IT業務での長所が活きたエピソード", episodeHintId: "Kejadian di mana kelebihanmu berguna dalam pekerjaan" },
    { id: "trouble",     label: "⑥ 困ったときの対処",       labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau ada masalah teknis atau konflik tim?", episodeHint: "難しいプロジェクトや技術的問題を解決した体験", episodeHintId: "Pengalaman mengatasi masalah teknis atau proyek yang sulit" },
    { id: "japanese",    label: "⑦ 日本語の勉強",           labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本語でのビジネスコミュニケーションへの準備", episodeHintId: "Persiapan komunikasi bisnis dalam Bahasa Jepang" },
    { id: "future",      label: "⑧ 将来の目標",             labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin berkembang seperti apa?", episodeHint: "スペシャリストとして目指すキャリアのイメージ", episodeHintId: "Karir spesialis yang ingin kamu capai" },
    { id: "culture",     label: "⑨ 日本生活への適応",       labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本のビジネス文化で気になること", episodeHintId: "Budaya kerja Jepang yang membuatmu penasaran" },
  ],
  other: [
    { id: "intro",       label: "① 自己紹介",               labelId: "Perkenalan Diri",              placeholder: "Nama, asal, pengalaman kerja...", episodeHint: "地元や家族の印象的なエピソード", episodeHintId: "Ceritakan 1 hal unik tentang dirimu" },
    { id: "reason",      label: "② この職種を選んだ理由",   labelId: "Alasan Memilih Bidang Ini",    placeholder: "Kenapa ingin bekerja di bidang ini?", episodeHint: "この仕事に興味を持ったきっかけ", episodeHintId: "Pengalaman yang membuatmu tertarik" },
    { id: "experience",  label: "③ 関連する経験",           labelId: "Pengalaman Relevan",           placeholder: "Punya pengalaman terkait pekerjaan ini?", episodeHint: "仕事に関連する具体的な経験・スキル", episodeHintId: "Pengalaman atau skill yang relevan" },
    { id: "whyHere",     label: "④ なぜここを選んだか",     labelId: "Kenapa Memilih Tempat Ini",    placeholder: "Kenapa ingin kerja di sini?", episodeHint: "この職場・会社に惹かれた理由", episodeHintId: "Apa yang menarikmu dari tempat ini" },
    { id: "health",      label: "⑤ 体力・健康",             labelId: "Kesehatan & Stamina",          placeholder: "Kondisi kesehatanmu bagaimana?", episodeHint: "体力・健康管理への取り組み", episodeHintId: "Bagaimana kamu menjaga kesehatan dan stamina" },
    { id: "personality", label: "⑥ 性格・長所短所",         labelId: "Kepribadian & Kelebihan",      placeholder: "Apa kelebihan dan kekuranganmu?", episodeHint: "長所が発揮された実際のエピソード", episodeHintId: "Kejadian nyata di mana kelebihanmu terlihat" },
    { id: "trouble",     label: "⑦ 困ったときの対処",       labelId: "Cara Mengatasi Masalah",       placeholder: "Kalau ada masalah kerja, kamu akan bagaimana?", episodeHint: "問題を解決した具体的な体験", episodeHintId: "Pengalaman spesifik mengatasi masalah" },
    { id: "japanese",    label: "⑧ 日本語の勉強",           labelId: "Belajar Bahasa Jepang",        placeholder: "Sekarang belajar bahasa Jepang seperti apa?", episodeHint: "日本語の勉強のモチベーション", episodeHintId: "Apa yang memotivasimu belajar Bahasa Jepang" },
    { id: "future",      label: "⑨ 将来の目標",             labelId: "Tujuan Masa Depan",            placeholder: "3〜5 tahun ke depan ingin berkembang seperti apa?", episodeHint: "将来のキャリアイメージ", episodeHintId: "Gambaran karir yang ingin kamu capai" },
    { id: "culture",     label: "⑩ 日本生活への適応",       labelId: "Adaptasi Kehidupan Jepang",    placeholder: "Ada kekhawatiran tentang kehidupan di Jepang?", episodeHint: "日本について調べて気になること", episodeHintId: "Hal tentang Jepang yang membuatmu penasaran" },
  ],
};

const JA_LEVELS = ["N5（基礎）", "N4（初級）", "N3（中級）", "N2（上級）", "N1（流暢）"];

const getExpLabel = (jobId) => {
  const map = {
    kaigo: "介護経験 / Pengalaman Perawatan",
    seizou: "製造・工場経験 / Pengalaman Pabrik",
    kensetsu: "建設経験 / Pengalaman Konstruksi",
    nougyou: "農業・漁業経験 / Pengalaman Pertanian",
    insyoku: "飲食・接客経験 / Pengalaman Servis",
    jimu: "事務・IT経験 / Pengalaman IT/Admin",
    other: "関連経験 / Pengalaman Relevan",
  };
  return map[jobId] || "職務経験";
};

const EXP_OPTIONS = ["なし / Belum ada", "1年未満 / Kurang 1 tahun", "1〜3年 / 1-3 tahun", "3年以上 / 3+ tahun"];

// ========== AIプロンプト ==========
const buildFeedbackPrompt = (answers, episodes, profile, jobType, facility, questions) => {
  const answeredQs = questions.filter(q => answers[q.id]?.trim());
  const jobLabel = JOB_TYPES.find(j => j.id === jobType)?.label || jobType;
  return `Kamu adalah pelatih wawancara kerja senior untuk posisi ${jobLabel}（${profile.jobCustom || jobLabel}）di Jepang.

=== PROFIL KANDIDAT ===
Nama: ${profile.name}
Asal: ${profile.origin || "-"}
Level Jepang: ${profile.jaLevel || "-"}
Pengalaman: ${profile.experience || "-"}
Motivasi khusus: ${profile.motivation || "-"}

=== INFO PERUSAHAAN / FASILITAS ===
Nama: ${facility.name || "-"}
Lokasi: ${facility.location || "-"}
Bidang: ${facility.jobContent || "-"}
Filosofi: ${facility.philosophy || "-"}

=== JAWABAN + EPISODE PRIBADI ===
${answeredQs.map(q => {
  const ep = episodes[q.id]?.trim();
  return `[${q.id}] ${q.label}
Episode pribadi: ${ep || "(tidak diisi)"}
Jawaban interview: "${answers[q.id]}"`;
}).join("\n\n")}

=== TUGAS ===
Berikan feedback PERSONAL dan SPESIFIK untuk setiap jawaban:
1. Apakah jawaban menggunakan episode pribadi? (originality check)
2. Apakah ada bagian yang terdengar seperti template umum?
3. Saran spesifik bagaimana memasukkan episode pribadi

Balas HANYA dengan JSON array:
[{"id":"...", "status":"good/improve", "originality":"original/template", "feedback":"...", "feedbackJa":"...", "example":"..."}]

Aturan:
- feedback: 20-40 kata Bahasa Indonesia, HARUS sebut bagian spesifik dari jawaban
- feedbackJa: ringkasan 10 kata Bahasa Jepang
- example: jika "improve", buat contoh yang memasukkan episode pribadi (bukan template)
- Sertakan semua ${answeredQs.length} pertanyaan`;
};

const buildConvertPrompt = (answers, episodes, profile, jobType, facility, questions) => {
  const jobLabel = JOB_TYPES.find(j => j.id === jobType)?.label || jobType;
  return `Buat teks wawancara dalam bahasa Jepang mudah（やさしい日本語）yang ORISINIL.

Kandidat: ${profile.name}
Pekerjaan yang dilamar: ${jobLabel}（${profile.jobCustom || ""}）
Asal: ${profile.origin || "-"}
Level Jepang: ${profile.jaLevel || "-"}
Pengalaman: ${profile.experience || "-"}
Motivasi: ${profile.motivation || "-"}

Perusahaan: ${facility.name || "-"}（${facility.location || "-"}）
Bidang: ${facility.jobContent || "-"}

Jawaban + Episode Pribadi:
${questions.map(q => {
  if (!answers[q.id]) return "";
  const ep = episodes[q.id]?.trim();
  return `${q.label}:
Episode: ${ep || "-"}
Jawaban: ${answers[q.id]}`;
}).filter(Boolean).join("\n\n")}

PENTING:
- Masukkan episode/pengalaman pribadi agar teks terasa UNIK
- Bahasa Jepang mudah, kalimat pendek, です・ます調
- Sesuaikan dengan bidang pekerjaan ${jobLabel}
- JANGAN gunakan ** atau markdown
- JANGAN tambahkan --- di akhir
- Format dengan header【】`;
};

// ========== コンポーネント ==========
export default function App() {
  const [screen, setScreen] = useState("list");       // list | jobSelect | form | detail
  const [step, setStep] = useState(0);                // 0:施設 1:回答 2:FB 3:変換
  const [jobType, setJobType] = useState("");
  const [answers, setAnswers] = useState({});
  const [episodes, setEpisodes] = useState({});
  const [profile, setProfile] = useState({ name: "", origin: "", jaLevel: "", experience: "", motivation: "", jobCustom: "" });
  const [facility, setFacility] = useState({ name: "", location: "", jobContent: "", philosophy: "" });
  const [feedbackList, setFeedbackList] = useState([]);
  const [converted, setConverted] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showEpisode, setShowEpisode] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("interview_candidates_v3");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const QUESTIONS = QUESTIONS_BY_JOB[jobType] || QUESTIONS_BY_JOB.other;
  const jobInfo = JOB_TYPES.find(j => j.id === jobType);

  const saveCandidate = (name, result, job) => {
    const newEntry = { id: Date.now(), name, date: new Date().toLocaleDateString("ja-JP"), result, jobType: job, jobLabel: JOB_TYPES.find(j => j.id === job)?.label || job };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem("interview_candidates_v3", JSON.stringify(updated));
  };

  const deleteCandidate = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("interview_candidates_v3", JSON.stringify(updated));
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
    setLoading(true); setLoadingMsg("AIが個別フィードバックを作成中... (10〜20秒)");
    setFeedbackList([]); setErrorMsg("");
    try {
      const result = await callAI(buildFeedbackPrompt(answers, episodes, profile, jobType, facility, QUESTIONS));
      const match = result.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("JSONが見つかりません。再試行してください。");
      const parsed = JSON.parse(match[0]);
      setFeedbackList(parsed);
      setStep(2);
    } catch (e) { setErrorMsg(`エラー: ${e.message}`); }
    setLoading(false); setLoadingMsg("");
  };

  const handleConvert = async () => {
    setLoading(true); setLoadingMsg("やさしい日本語に変換中...");
    setConverted(""); setErrorMsg("");
    try {
      const result = await callAI(buildConvertPrompt(answers, episodes, profile, jobType, facility, QUESTIONS));
      setConverted(result);
      saveCandidate(profile.name, result, jobType);
      setStep(3);
    } catch (e) { setErrorMsg(`変換エラー: ${e.message}`); }
    setLoading(false); setLoadingMsg("");
  };

  const handleReset = () => {
    setStep(0); setAnswers({}); setEpisodes({}); setFeedbackList([]);
    setConverted(""); setProfile({ name: "", origin: "", jaLevel: "", experience: "", motivation: "", jobCustom: "" });
    setFacility({ name: "", location: "", jobContent: "", philosophy: "" });
    setEditingId(null); setErrorMsg(""); setShowEpisode({});
    setScreen("list"); setJobType("");
  };

  const templateCount = feedbackList.filter(f => f.originality === "template").length;
  const allGood = feedbackList.length > 0 && feedbackList.every(f => f.status === "good");
  const STEPS = ["基本情報", "回答入力", "フィードバック", "日本語変換"];

  // ========== スタイル ==========
  const s = {
    wrap: { fontFamily: "'Noto Sans JP', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0e9 100%)", padding: "24px 16px" },
    card: { maxWidth: 700, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", overflow: "hidden" },
    header: { background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)", padding: "28px 32px", color: "#fff" },
    body: { padding: "28px 32px" },
    stepper: { display: "flex", background: "#f7faf8", borderBottom: "1px solid #e8ede9" },
    stepItem: (active, done) => ({ flex: 1, padding: "12px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: active ? "#1a5276" : done ? "#2980b9" : "#aaa", borderBottom: active ? "3px solid #1a5276" : "3px solid transparent" }),
    btn: (color) => ({ padding: "13px 28px", background: color || "#1a5276", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }),
    btnOutline: (color) => ({ padding: "10px 20px", background: "#fff", border: `1.5px solid ${color || "#1a5276"}`, color: color || "#1a5276", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }),
    btnSmall: (color) => ({ padding: "6px 14px", background: color || "#1a5276", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }),
    btnTiny: (active) => ({ padding: "4px 10px", background: active ? "#f6b93b" : "#f0f7f3", color: active ? "#fff" : "#555", border: `1px solid ${active ? "#f6b93b" : "#ccc"}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }),
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e0f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fbff" },
    select: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e0f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fbff" },
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0e0f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fbff", resize: "vertical", minHeight: 80 },
    episodeBox: { background: "#fffaf0", border: "1.5px dashed #f6b93b", borderRadius: 10, padding: "10px 14px", marginBottom: 10 },
    episodeTextarea: { width: "100%", padding: "8px 12px", border: "1px solid #f6b93b", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fffef8", resize: "vertical", minHeight: 55 },
    label: { fontSize: 13, fontWeight: 700, color: "#1a5276", marginBottom: 6, display: "block" },
    infoBox: { background: "#f0f7ff", border: "1px solid #cde", borderRadius: 10, padding: "12px 14px", marginBottom: 12 },
    qBlock: { background: "#f8fbff", border: "1px solid #d0e0f0", borderRadius: 12, padding: "16px", marginBottom: 14 },
    divider: { height: 1, background: "#e0ecf8", margin: "20px 0" },
    tip: { background: "#fff8e6", border: "1px solid #ffd580", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5a00", marginBottom: 20 },
    episodeTip: { background: "#fff5e0", border: "1px solid #f6b93b", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a4000", marginBottom: 16 },
    infoTip: { background: "#e8f4ff", border: "1px solid #90caf9", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1a4a7a", marginBottom: 20 },
    error: { background: "#fff0f0", border: "1.5px solid #ffb3b3", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#cc0000", marginBottom: 16 },
    loadingBox: { background: "#e8f4ff", border: "1px solid #a8c8e8", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1a3a6a", marginBottom: 16, textAlign: "center" },
    convertBox: { background: "#e8f4ff", border: "1.5px solid #5a9fd4", borderRadius: 14, padding: "20px", whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 2.0, color: "#1a3a5a" },
    footer: { background: "#f7faf8", borderTop: "1px solid #e0ecf8", padding: "12px 32px", fontSize: 12, color: "#888", textAlign: "center" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
    badge: (bg, border, color) => ({ display: "inline-block", background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color, marginRight: 6, marginBottom: 4 }),
    templateBadge: { display: "inline-block", background: "#fff0e0", border: "1px solid #f6a623", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#c05c00", marginLeft: 6 },
    originalBadge: { display: "inline-block", background: "#e0f7e9", border: "1px solid #4caf50", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#1a6636", marginLeft: 6 },
    jobCard: (selected) => ({ padding: "16px", border: `2px solid ${selected ? "#1a5276" : "#dde"}`, borderRadius: 14, cursor: "pointer", background: selected ? "#e8f4ff" : "#fff", textAlign: "center", transition: "all 0.15s" }),
  };

  // ========== 一覧画面 ==========
  if (screen === "list") return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>🎯</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>面接トレーナー</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>インドネシア語 → やさしい日本語</p>
            </div>
          </div>
        </div>
        <div style={s.body}>
          <button style={{ ...s.btn(), marginBottom: 24, width: "100%", fontSize: 16 }}
            onClick={() => setScreen("jobSelect")}>
            ➕ 新しい候補者を追加
          </button>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>
              <div style={{ fontSize: 48 }}>📋</div>
              <p>まだ候補者がいません</p>
            </div>
          ) : history.map(h => (
            <div key={h.id} style={{ background: "#f8fbff", border: "1px solid #d0e0f0", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1a3a6a" }}>👤 {h.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {h.jobLabel && <span style={s.badge("#e8f4ff", "#90caf9", "#1a4a7a")}>{JOB_TYPES.find(j => j.id === h.jobType)?.emoji} {h.jobLabel}</span>}
                    📅 {h.date}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.btnOutline()} onClick={() => { setSelectedCandidate(h); setScreen("detail"); }}>確認</button>
                  <button style={s.btnOutline("#e53e3e")} onClick={() => deleteCandidate(h.id)}>削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={s.footer}>面接トレーナー for インドネシア人候補者｜Ver 2.0</div>
      </div>
    </div>
  );

  // ========== 職種選択画面 ==========
  if (screen === "jobSelect") return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>🎯</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>職種を選んでください</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Pilih bidang pekerjaan / Select job type</p>
            </div>
          </div>
        </div>
        <div style={s.body}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {JOB_TYPES.map(j => (
              <div key={j.id} style={s.jobCard(jobType === j.id)}
                onClick={() => setJobType(j.id)}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{j.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a3a6a" }}>{j.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{j.labelId}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={s.btnOutline()} onClick={() => setScreen("list")}>← 戻る</button>
            <button style={{ ...s.btn(), opacity: jobType ? 1 : 0.4 }}
              onClick={() => { if (jobType) { setScreen("form"); setStep(0); } }}>
              次へ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== 詳細画面 ==========
  if (screen === "detail" && selectedCandidate) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>👤</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                {JOB_TYPES.find(j => j.id === selectedCandidate.jobType)?.emoji} {selectedCandidate.jobLabel}　📅 {selectedCandidate.date}
              </p>
            </div>
          </div>
        </div>
        <div style={s.body}>
          <p style={{ fontWeight: 700, color: "#1a5276", fontSize: 16, marginBottom: 16 }}>🇯🇵 やさしい日本語</p>
          <div style={s.convertBox}>{selectedCandidate.result}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <button style={s.btn(copied ? "#888" : "#1a5276")}
              onClick={() => { navigator.clipboard.writeText(selectedCandidate.result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
            </button>
            <button style={s.btnOutline()} onClick={() => setScreen("list")}>← 一覧に戻る</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== メインフォーム ==========
  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{jobInfo?.emoji || "🎯"}</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                {jobInfo?.label || "面接"} 面接トレーナー
              </p>
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

          {/* STEP 0: 基本情報 + 企業情報 */}
          {step === 0 && (
            <div>
              <div style={s.infoTip}>
                💡 プロフィールと企業情報を詳しく入力するほど、<strong>その人だけのフィードバック</strong>になります！<br />
                <span style={{ fontSize: 12 }}>Semakin lengkap, semakin personal feedbacknya!</span>
              </div>

              {/* 候補者プロフィール */}
              <p style={{ fontWeight: 700, color: "#1a5276", marginBottom: 12 }}>👤 候補者プロフィール</p>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>候補者名 / Nama Kandidat <span style={{ color: "#e53e3e" }}>*</span></label>
                <input style={{ ...s.input, borderColor: "#2980b9" }} placeholder="例：Siti Rahayu"
                  value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div style={s.grid2}>
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
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>{getExpLabel(jobType)}</label>
                  <select style={s.select} value={profile.experience}
                    onChange={e => setProfile({ ...profile, experience: e.target.value })}>
                    <option value="">選択してください</option>
                    {EXP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>職種詳細 / Posisi Spesifik</label>
                  <input style={s.input} placeholder={`例：${jobInfo?.label}補助、リーダー候補...`}
                    value={profile.jobCustom} onChange={e => setProfile({ ...profile, jobCustom: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>志望動機・特記事項 / Motivasi Khusus</label>
                <textarea style={{ ...s.textarea, minHeight: 60 }}
                  placeholder="例：祖母の介護経験 / 工場でアルバイト経験あり..."
                  value={profile.motivation} onChange={e => setProfile({ ...profile, motivation: e.target.value })} />
              </div>

              <div style={s.divider} />

              {/* 企業・施設情報（入力式） */}
              <p style={{ fontWeight: 700, color: "#1a5276", marginBottom: 12 }}>🏢 企業・施設情報 / Info Perusahaan</p>
              <div style={s.infoTip}>
                📋 求人票を見ながら入力してください。入力するほどAIが企業に合わせたフィードバックをします。<br />
                <span style={{ fontSize: 12 }}>Isi berdasarkan info lowongan kerja untuk feedback yang lebih tepat.</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>企業名・施設名 / Nama Perusahaan</label>
                <input style={s.input} placeholder="例：社会福祉法人さくら会、株式会社○○製作所..."
                  value={facility.name} onChange={e => setFacility({ ...facility, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>所在地 / Lokasi</label>
                <input style={s.input} placeholder="例：東京都品川区南大井（JR大森駅北口 徒歩10分）"
                  value={facility.location} onChange={e => setFacility({ ...facility, location: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>仕事内容 / Deskripsi Pekerjaan</label>
                <textarea style={{ ...s.textarea, minHeight: 60 }}
                  placeholder="例：訪問介護・デイサービス / 自動車部品の組立・検査..."
                  value={facility.jobContent} onChange={e => setFacility({ ...facility, jobContent: e.target.value })} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>企業理念・特徴 / Filosofi & Keunggulan</label>
                <textarea style={{ ...s.textarea, minHeight: 60 }}
                  placeholder="例：地域密着型の介護 / 品質第一主義、残業少なめ..."
                  value={facility.philosophy} onChange={e => setFacility({ ...facility, philosophy: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button style={s.btnOutline()} onClick={() => setScreen("jobSelect")}>← 職種変更</button>
                <button style={s.btn()} onClick={() => { setErrorMsg(""); setStep(1); }}>次へ：回答入力へ →</button>
              </div>
            </div>
          )}

          {/* STEP 1: 回答入力 */}
          {step === 1 && (
            <div>
              {/* プロフィールバッジ */}
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f0f7ff", borderRadius: 10, border: "1px solid #c3deff" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a4a7a" }}>
                  {jobInfo?.emoji} {jobInfo?.label}　👤 {profile.name}　
                </span>
                {facility.name && <span style={s.badge("#e8f4ff", "#90caf9", "#1a4a7a")}>🏢 {facility.name}</span>}
                {profile.jaLevel && <span style={s.badge("#e8f4ff", "#90caf9", "#1a4a7a")}>🇯🇵 {profile.jaLevel}</span>}
                {profile.experience && <span style={s.badge("#e8f4ff", "#90caf9", "#1a4a7a")}>💼 {profile.experience}</span>}
              </div>

              <div style={s.episodeTip}>
                ✨ <strong>オリジナリティのコツ：</strong>各質問の📖エピソード欄に「あなただけの体験」を書くと、テンプレートにならない回答ができます！<br />
                <span style={{ fontSize: 12 }}>Tulis pengalaman PRIBADIMU di kolom 📖 agar jawabanmu tidak terkesan template!</span>
              </div>

              <div style={s.tip}>🇮🇩 回答はインドネシア語で！ / Jawab dalam Bahasa Indonesia!</div>

              {errorMsg && <div style={s.error}>⚠️ {errorMsg}</div>}
              {loading && <div style={s.loadingBox}>⏳ {loadingMsg}</div>}

              {QUESTIONS.map(q => (
                <div key={q.id} style={s.qBlock}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a6a", marginBottom: 10 }}>{q.label} / {q.labelId}</div>

                  {/* エピソード欄 */}
                  <div style={s.episodeBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showEpisode[q.id] ? 8 : 0 }}>
                      <div style={{ fontSize: 12, color: "#c05c00" }}>
                        📖 <strong>あなたのエピソード（任意）</strong>
                        {episodes[q.id] && <span style={{ color: "#2ecc71", marginLeft: 6 }}>✓ 入力済み</span>}
                      </div>
                      <button style={s.btnTiny(showEpisode[q.id])}
                        onClick={() => setShowEpisode({ ...showEpisode, [q.id]: !showEpisode[q.id] })}>
                        {showEpisode[q.id] ? "▲ 閉じる" : (episodes[q.id] ? "✏️ 編集" : "▼ 開く")}
                      </button>
                    </div>
                    {showEpisode[q.id] ? (
                      <div>
                        <div style={{ fontSize: 11, color: "#7a4000", marginBottom: 6 }}>
                          💡 {q.episodeHint}<br />
                          <span style={{ color: "#a07030" }}>→ {q.episodeHintId}</span>
                        </div>
                        <textarea style={s.episodeTextarea}
                          placeholder="日本語・インドネシア語・英語 どれでもOK"
                          value={episodes[q.id] || ""}
                          onChange={e => setEpisodes({ ...episodes, [q.id]: e.target.value })} />
                      </div>
                    ) : (
                      !episodes[q.id] && <div style={{ fontSize: 11, color: "#b07030" }}>💡 {q.episodeHintId}</div>
                    )}
                  </div>

                  <textarea style={s.textarea} placeholder={q.placeholder}
                    value={answers[q.id] || ""}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                </div>
              ))}

              <div style={{ display: "flex", gap: 12 }}>
                <button style={s.btnOutline()} onClick={() => setStep(0)}>← 戻る</button>
                <button style={{ ...s.btn(), opacity: loading ? 0.6 : 1 }}
                  onClick={handleFeedback} disabled={loading}>
                  {loading ? "⏳ AI確認中..." : "✨ フィードバックをもらう"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: フィードバック */}
          {step === 2 && (
            <div>
              <p style={{ fontWeight: 700, color: "#1a5276", fontSize: 16, marginBottom: 4 }}>
                💬 {profile.name} さんへのフィードバック（{jobInfo?.label}）
              </p>

              {feedbackList.length > 0 && (
                <div style={{ background: templateCount > 0 ? "#fff8e6" : "#e8f8f0", border: `1px solid ${templateCount > 0 ? "#f6b93b" : "#5cb882"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: templateCount > 0 ? "#7a4000" : "#1a6636" }}>
                    {templateCount === 0 ? "✅ 全回答がオリジナルです！" : `⚠️ ${templateCount}つがテンプレート傾向 → エピソードを追加して修正しましょう`}
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    🟢 オリジナル: {feedbackList.filter(f => f.originality === "original").length}問　
                    🟠 テンプレート: {templateCount}問
                  </div>
                </div>
              )}

              <div style={s.tip}>🟢 良い回答　🔴 要修正　🟠 テンプレート → エピソードを追加！</div>
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
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a3a6a", flex: 1, marginRight: 8 }}>
                        {isGood && !isTemplate ? "🟢" : isTemplate ? "🟠" : "🔴"} {q.label}
                        {fb && <span style={isTemplate ? s.templateBadge : (fb.originality === "original" ? s.originalBadge : {})}>
                          {isTemplate ? "テンプレート" : fb.originality === "original" ? "オリジナル ✨" : ""}
                        </span>}
                      </div>
                      <button style={s.btnSmall(editingId === q.id ? "#888" : "#1a5276")}
                        onClick={() => setEditingId(editingId === q.id ? null : q.id)}>
                        {editingId === q.id ? "✅ 閉じる" : "✏️ 編集"}
                      </button>
                    </div>

                    {episodes[q.id] && (
                      <div style={{ background: "#fffbf0", border: "1px dashed #f6b93b", borderRadius: 8, padding: "6px 10px", marginBottom: 8, fontSize: 12, color: "#7a4000" }}>
                        📖 {episodes[q.id]}
                      </div>
                    )}

                    {editingId === q.id ? (
                      <textarea style={{ ...s.textarea, marginBottom: 10, borderColor: "#2980b9" }}
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
                        {fb.feedbackJa && <div style={{ fontSize: 12, color: "#666", marginBottom: fb.example ? 8 : 0, fontStyle: "italic" }}>🇯🇵 {fb.feedbackJa}</div>}
                      </div>
                    )}

                    {fb?.example && (!isGood || isTemplate) && (
                      <div style={{ background: "#fffbea", border: "1px solid #ffd580", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#b7791f", marginBottom: 6 }}>
                          💡 {isTemplate ? "エピソードを入れた改善例:" : "改善例文:"}
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
                <button style={s.btnOutline()} onClick={() => { setStep(1); setEditingId(null); }}>← 回答に戻る</button>
                <button style={{ ...s.btn("#1a5276"), opacity: loading ? 0.6 : 1 }} onClick={handleConvert} disabled={loading}>
                  {loading ? "⏳ 変換中..." : "🇯🇵 やさしい日本語に変換する"}
                </button>
                <button style={{ ...s.btnOutline(), opacity: loading ? 0.6 : 1 }} onClick={handleFeedback} disabled={loading}>
                  🔄 再チェック
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 日本語変換 */}
          {step === 3 && (
            <div>
              <p style={{ fontWeight: 700, color: "#1a5276", fontSize: 16, marginBottom: 16 }}>
                🇯🇵 {profile.name} さんのやさしい日本語（{jobInfo?.label}）
              </p>
              <div style={s.convertBox}>{converted}</div>
              <div style={{ background: "#e6f4ff", border: "1px solid #90caf9", borderRadius: 10, padding: "12px 16px", marginTop: 16, fontSize: 13, color: "#0d47a1" }}>
                💡 候補者一覧に自動保存されました！LINEでコピーして送ってください。
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <button style={s.btn(copied ? "#888" : "#1a5276")} onClick={() => { navigator.clipboard.writeText(converted); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? "✅ コピーしました！" : "📋 テキストをコピー"}
                </button>
                <button style={s.btnOutline()} onClick={() => setScreen("list")}>📋 一覧に戻る</button>
                <button style={s.btnOutline()} onClick={handleReset}>🔄 新しい候補者</button>
              </div>
            </div>
          )}

        </div>
        <div style={s.footer}>面接トレーナー for インドネシア人候補者｜Ver 2.0</div>
      </div>
    </div>
  );
}
