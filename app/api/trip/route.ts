import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { origin, destination } = await req.json() as {
      origin: string;
      destination: string;
    };

    if (!origin?.trim() || !destination?.trim()) {
      return NextResponse.json({ error: "Origin and destination required" }, { status: 400 });
    }

    const prompt = `
Kamu adalah "Pemandu Perjalanan Jepang" yang sangat ramah, asyik, dan komunikatif.
Pengguna ingin melakukan perjalanan:
- Titik Asal: "${origin}"
- Tujuan Akhir: "${destination}"

TUGAS:
Berikan MAKSIMAL 3 alternatif rute perjalanan yang hanya menggunakan transportasi umum di Jepang (Kereta, Subway, Bus, atau Jalan Kaki).

URUTAN PENYAJIAN:
1. Rute Tercepat
2. Rute Termurah
3. Rute Santai / Pemandangan (jika ada)

GAYA BAHASA:
Gunakan gaya "story-telling" seolah-olah memandu mereka. Sebutkan nama jalur, stasiun transit, estimasi waktu, dan biayanya.

FORMAT OUTPUT (HTML MURNI, tanpa markdown):
Untuk setiap rute buat struktur:

<div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:16px;padding:20px;margin-bottom:24px;">
  <h4 style="color:#047857;font-size:1.1rem;font-weight:800;margin:0 0 12px;border-bottom:2px solid #34d399;padding-bottom:8px;">Alternatif 1: Rute Tercepat</h4>
  <div style="color:#374151;line-height:1.7;font-size:0.9rem;margin-bottom:16px;">[cerita perjalanan]</div>
  <a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit" target="_blank" style="display:block;text-align:center;background:#059669;color:white;padding:12px;border-radius:12px;font-weight:bold;text-decoration:none;">Buka di Google Maps</a>
</div>
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 3000 },
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ result: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
