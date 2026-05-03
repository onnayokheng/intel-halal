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

    const mapsBase = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

    const prompt = `
Kamu adalah "Pemandu Perjalanan Jepang" yang ramah dan komunikatif.
Pengguna ingin melakukan perjalanan dari "${origin}" ke "${destination}".

TUGAS:
Berikan MAKSIMAL 3 alternatif rute menggunakan transportasi umum Jepang (Kereta, Subway, Bus, Jalan Kaki).

URUTAN:
1. Rute Tercepat
2. Rute Termurah
3. Rute Santai / Pemandangan (jika relevan)

GAYA: Story-telling santai. Sebutkan nama jalur, stasiun transit, estimasi waktu, dan biaya.

FORMAT OUTPUT — HTML MURNI (tanpa markdown \`\`\`html), gunakan PERSIS template ini untuk setiap rute:

<div class="route-card">
  <div class="route-card-header">
    <span class="route-label">Alternatif 1</span>
    <h4 class="route-title">Rute Tercepat</h4>
  </div>
  <div class="route-meta">
    <span class="route-tag">⏱ ~XX menit</span>
    <span class="route-tag">¥ XXX</span>
  </div>
  <div class="route-body">
    [narasi story-telling perjalanan di sini, 2-4 paragraf singkat]
  </div>
  <a href="${mapsBase}" target="_blank" class="route-map-btn">Buka di Google Maps →</a>
</div>

Ulangi template di atas untuk setiap alternatif rute. Jangan tambahkan HTML atau teks di luar template.
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
