import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productCache } from "@/db/schema";
import { eq, gt } from "drizzle-orm";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT_ID = `
Kamu adalah "Intel Halal", pakar syariat Islam dan Ilmu Gizi yang merujuk ketat pada standar "Halal Japan Association".
Tugasmu: Analisis foto komposisi produk, makanan, minuman, barang, atau tempat di Jepang.
Jawab LANGSUNG dalam HTML murni (tanpa markdown \`\`\`html). Gunakan tag <h4> untuk subjudul.
BAHASA: Tulis SELURUH jawaban dalam Bahasa Indonesia.

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

const SYSTEM_PROMPT_EN = `
You are "Intel Halal", an Islamic law and nutrition expert strictly following the "Halal Japan Association" standards.
Your task: Analyze photos of product ingredients, food, beverages, items, or places in Japan.
Respond DIRECTLY in pure HTML (no markdown \`\`\`html). Use <h4> tags for subheadings.
LANGUAGE: Write your ENTIRE response in English.

STATUS CLASSIFICATION RULES (MUST CHOOSE ONE AND INCLUDE ITS TAG AT THE START):
1. HALAL (Tag: <!-- STATUS_HALAL -->)
   - Halal Level 1: Halal certified / 100% pure plant-based or pure seafood without additives.
   - Halal Level 2: Factory ingredients free from animal derivatives/alcohol.
   - Halal Level 3: Halal base ingredients, but small risk of cross-contamination in factory.
2. DOUBTFUL (Tag: <!-- STATUS_SYUBHAT -->)
   - Contains emulsifiers, shortening, margarine, amino acids, or flavoring with unclear source.
   - Status unclear and needs confirmation from the manufacturer.
3. HARAM (Tag: <!-- STATUS_HARAM -->)
   - Haram Level 1: Contains non-halal animal derivatives (pork/beef gelatin, meat extract without halal label).
   - Haram Level 2: Clearly contains pork, lard, alcohol, mirin, sake, or rum.

OUTPUT FORMAT:
- FIRST LINE MUST CONTAIN THE STATUS TAG (e.g. <!-- STATUS_SYUBHAT -->).
- Second line: <h3>[Level Name]</h3>
- <h4>Ingredient Analysis</h4> (Explain critical ingredients in detail).
- If Doubtful or Haram, MUST include <h4>Product Alternatives</h4>.
- If the image is ONLY a Barcode: Try to identify the product from the barcode number.
`;

// ── Step 1: ekstrak nama produk / barcode dari gambar (call AI murah) ──
const EXTRACT_PROMPT = `
Lihat gambar ini. Ekstrak HANYA salah satu dari berikut (pilih yang paling relevan):
1. Jika ada barcode/JAN code: kembalikan HANYA angka barcode-nya (contoh: 4901085022245)
2. Jika ada nama produk dalam huruf latin/kanji: kembalikan nama produk yang paling spesifik (contoh: "Yamazaki Lemon Cake" atau "ヤマザキ レモンケーキ")
3. Jika tidak ada keduanya: kembalikan "UNKNOWN"

Jawab dengan 1 baris teks saja, tanpa penjelasan tambahan.
`;

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { images, locale = "id" } = await req.json() as {
      images: { mimeType: string; base64Data: string }[];
      locale?: string;
    };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const imageParts = images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64Data },
    }));

    // ── Step 1: ekstrak lookup key ──
    let lookupKey: string | null = null;
    try {
      const extractRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: EXTRACT_PROMPT }, ...imageParts] }],
          generationConfig: { temperature: 0, maxOutputTokens: 64 },
        }),
      });
      const extractData = await extractRes.json();
      const raw = extractData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const key = normalizeKey(raw);
      if (key && key !== "unknown") lookupKey = `${locale}:${key}`;
    } catch {
      // extraction gagal → lanjut tanpa cache
    }

    // ── Step 2: cek cache ──
    if (lookupKey && process.env.DATABASE_URL) {
      const cached = await db
        .select()
        .from(productCache)
        .where(
          eq(productCache.lookupKey, lookupKey) &&
          gt(productCache.expiresAt, new Date())
        )
        .limit(1);

      if (cached.length > 0) {
        // update hit count
        await db
          .update(productCache)
          .set({ hitCount: cached[0].hitCount + 1 })
          .where(eq(productCache.id, cached[0].id));

        return NextResponse.json({
          result: cached[0].resultHtml,
          fromCache: true,
        });
      }
    }

    // ── Step 3: full AI analysis ──
    const systemPrompt = locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;
    const payload = {
      contents: [{ parts: [{ text: systemPrompt }, ...imageParts] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini API error");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // ── Step 4: simpan ke cache ──
    if (lookupKey && text && process.env.DATABASE_URL) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // detect status from text
      const status = text.includes("STATUS_HARAM") ? "haram"
        : text.includes("STATUS_SYUBHAT") || text.includes("STATUS_DOUBTFUL") ? "syubhat"
        : text.includes("STATUS_HALAL") ? "halal"
        : "idle";

      try {
        await db.insert(productCache).values({
          lookupKey,
          resultHtml: text,
          status,
          hitCount: 1,
          expiresAt,
        }).onConflictDoUpdate({
          target: productCache.lookupKey,
          set: { resultHtml: text, status, expiresAt, hitCount: 1 },
        });
      } catch {
        // cache write gagal → tidak masalah, hasil tetap dikembalikan
      }
    }

    return NextResponse.json({ result: text, fromCache: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
