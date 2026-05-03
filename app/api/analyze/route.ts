import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `
Kamu adalah "Intel Halal", pakar syariat Islam dan Ilmu Gizi yang merujuk ketat pada standar "Halal Japan Association".
Tugasmu: Analisis foto komposisi produk, makanan, minuman, barang, atau tempat di Jepang.
Jawab LANGSUNG dalam HTML murni (tanpa markdown \`\`\`html). Gunakan tag <h4> untuk subjudul.

ATURAN KLASIFIKASI STATUS (WAJIB PILIH SALAH SATU DAN SERTAKAN TAG-NYA DI AWAL JAWABAN):
1. HALAL (Tag: <!-- STATUS_HALAL -->)
   - Halal Level 1: Bersertifikat Halal / 100% nabati murni & laut murni tanpa aditif.
   - Halal Level 2: Bahan pabrik bebas turunan hewani/alkohol.
   - Halal Level 3: Bahan dasar halal, namun ada risiko kecil kontaminasi silang pabrik.
2. SYUBHAT / DOUBTFUL (Tag: <!-- STATUS_SYUBHAT -->)
   - Mengandung emulsifier, shortening, margarin, asam amino, atau perisa yang sumbernya tidak jelas.
   - Status belum jelas dan butuh konfirmasi ke produsen.
3. HARAM (Tag: <!-- STATUS_HARAM -->)
   - Haram Level 1: Mengandung turunan hewani non-halal (gelatin babi/sapi, ekstrak daging tanpa label halal).
   - Haram Level 2: Jelas mengandung Babi murni, Lard, Alkohol, Mirin, Sake, atau Rum.

FORMAT OUTPUT:
- BARIS PERTAMA WAJIB BERISI TAG STATUS (contoh: <!-- STATUS_SYUBHAT -->).
- Baris kedua: <h3>[Nama Level]</h3>
- <h4>Analisis Komposisi</h4> (Jelaskan bahan kritis secara detail).
- Jika Syubhat atau Haram, WAJIB ada <h4>Alternatif Produk</h4>.
- Jika Gambar HANYA berupa Barcode: Coba identifikasi produk dari angka barcode tersebut.
`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { images } = await req.json() as {
      images: { mimeType: string; base64Data: string }[];
    };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const imageParts = images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64Data },
    }));

    const payload = {
      contents: [{ parts: [{ text: SYSTEM_PROMPT }, ...imageParts] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
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
