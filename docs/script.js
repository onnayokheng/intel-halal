import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, RefreshCw, Loader2, AlertTriangle, Upload, X, 
  CheckCircle, HelpCircle, ShieldCheck, Calculator, Map, Navigation, MapPin, Compass, Search, LocateFixed, Smartphone, Barcode
} from 'lucide-react';

// ==========================================
// 1. KOMPONEN: CEK HALAL
// ==========================================

const compressImage = (dataUrl, maxWidth = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
};

function CekHalal({ isActive }) {
  const [images, setImages] = useState([]); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultHtml, setResultHtml] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'halal', 'syubhat', 'haram'
  const [error, setError] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('general');
  const [mediaStream, setMediaStream] = useState(null); 
  const streamRef = useRef(null); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (!isActive) stopCamera();
  }, [isActive]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const originalDataUrl = event.target.result;
              const compressedDataUrl = await compressImage(originalDataUrl);
              const base64Data = compressedDataUrl.split(',')[1];
              resolve({ file, dataUrl: compressedDataUrl, base64Data, mimeType: 'image/jpeg' });
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      })
    );
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = ''; 
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMediaStream(null);
    setIsCameraOpen(false);
  };

  const startCamera = async (mode = 'general') => {
    setError(null);
    setCameraMode(mode);
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream; 
      setMediaStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      setError("Gagal mengakses kamera. Pastikan browser memiliki izin akses kamera atau gunakan fitur Galeri.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [isCameraOpen, mediaStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const maxWidth = 800;
      let dWidth = video.videoWidth;
      let dHeight = video.videoHeight;

      if (dWidth > maxWidth) {
        dHeight = Math.round((dHeight * maxWidth) / dWidth);
        dWidth = maxWidth;
      }
      
      canvas.width = dWidth;
      canvas.height = dHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, dWidth, dHeight);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = dataUrl.split(',')[1];
      
      setImages(prev => [...prev, { file: null, dataUrl, base64Data, mimeType: 'image/jpeg' }]);
      stopCamera();
    }
  };

  useEffect(() => stopCamera, []);

  const resetApp = () => {
    setImages([]);
    setResultHtml(null);
    setStatus('idle');
    setError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    stopCamera();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setResultHtml(null);
    setError(null);
    setStatus('idle');

    try {
      const apiKey = ""; // MASUKKAN API KEY GEMINI DI SINI
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const systemPrompt = `
        Kamu adalah "Intel Halal", pakar syariat Islam dan Ilmu Gizi yang merujuk ketat pada standar "Halal Japan Association".
        Tugasmu: Analisis foto komposisi produk, makanan, minuman, barang, atau tempat di Jepang.
        Jawab LANGSUNG dalam HTML murni (tanpa markdown \`\`\`html). Gunakan tag <h4> untuk subjudul.
        
        ATURAN KLASIFIKASI STATUS (WAJIB PILIH SALAH SATU DAN SERTAKAN TAG-NYA DI AWAL JAWABAN):
        1. HALAL (Tag: <!-- STATUS_HALAL -->)
           - Halal Level 1: Bersertifikat Halal / 100% nabati murni & laut murni tanpa aditif.
           - Halal Level 2: Bahan pabrik bebas turunan hewani/alkohol.
           - Halal Level 3: Bahan dasar halal, namun ada risiko kecil kontaminasi silang pabrik.
        2. SYUBHAT / DOUBTFUL (Tag: <!-- STATUS_SYUBHAT -->)
           - Mengandung emulsifier, shortening, margarin, asam amino, atau perisa yang sumbernya tidak jelas (bisa dari hewani atau nabati).
           - Status belum jelas dan butuh konfirmasi ke produsen.
        3. HARAM (Tag: <!-- STATUS_HARAM -->)
           - Haram Level 1: Mengandung turunan hewani non-halal (gelatin babi/sapi, ekstrak daging tanpa label halal).
           - Haram Level 2: Jelas mengandung Babi murni, Ekstrak Babi, Lard (Lemak Babi), Alkohol, Mirin, Sake, atau Rum.

        FORMAT OUTPUT:
        - BARIS PERTAMA WAJIB BERISI TAG STATUS (contoh: <!-- STATUS_SYUBHAT -->).
        - Baris kedua: <h3>[Nama Level: contoh "Syubhat / Doubtful"]</h3>
        - <h4>Analisis Komposisi</h4> (Jelaskan bahan kritis secara detail berdasarkan level).
        - Jika Syubhat atau Haram, WAJIB ada section <h4>Alternatif Produk</h4> (Rekomendasikan produk serupa yang aman dan lokasi belinya, misal: Gyomu Super, Kaldi).
        - Jika itu Tempat/Barang/Skincare: Sesuaikan analisisnya (fungsi, tata krama, dll) dan tetap berikan tag status jika relevan dengan kehalalan/keamanan.
        - Jika Gambar HANYA berupa Barcode: Cobalah identifikasi produk dari angka barcode tersebut.
      `;

      const imageParts = images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.base64Data } }));
      const payload = { contents: [{ parts: [{ text: systemPrompt }, ...imageParts] }], generationConfig: { temperature: 0.3, maxOutputTokens: 4096 } };

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "Terjadi kesalahan API");

      let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada hasil.";
      
      // Deteksi Tag Pintar untuk Perubahan Tema UI
      if (textResult.includes('<!-- STATUS_HARAM -->')) { 
        setStatus('haram'); 
        textResult = textResult.replace('<!-- STATUS_HARAM -->', ''); 
      } else if (textResult.includes('<!-- STATUS_SYUBHAT -->') || textResult.includes('<!-- STATUS_DOUBTFUL -->')) { 
        setStatus('syubhat'); 
        textResult = textResult.replace('<!-- STATUS_SYUBHAT -->', '').replace('<!-- STATUS_DOUBTFUL -->', ''); 
      } else if (textResult.includes('<!-- STATUS_HALAL -->')) { 
        setStatus('halal'); 
        textResult = textResult.replace('<!-- STATUS_HALAL -->', ''); 
      }

      setResultHtml(textResult);
    } catch (err) {
      setError(err.message || "Gagal memproses gambar. Pastikan internet stabil.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const theme = {
    bg: status === 'haram' ? 'bg-red-50' : status === 'syubhat' ? 'bg-yellow-50' : status === 'halal' ? 'bg-green-50' : 'bg-gray-50',
    headerBg: status === 'haram' ? 'from-red-700 to-red-900' : status === 'syubhat' ? 'from-yellow-500 to-yellow-600' : status === 'halal' ? 'from-green-600 to-green-800' : 'from-[#FF8A00] to-[#E2725B]',
    text: status === 'haram' ? 'text-red-900' : status === 'syubhat' ? 'text-yellow-900' : status === 'halal' ? 'text-green-900' : 'text-gray-800',
    btnPrimary: status === 'haram' ? 'bg-red-700 hover:bg-red-800' : status === 'syubhat' ? 'bg-yellow-500 hover:bg-yellow-600' : status === 'halal' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#FF8A00] hover:bg-[#E2725B]',
    btnOutline: status === 'haram' ? 'text-red-700 border-red-700 hover:bg-red-50' : status === 'syubhat' ? 'text-yellow-600 border-yellow-500 hover:bg-yellow-50' : status === 'halal' ? 'text-green-700 border-green-700 hover:bg-green-50' : 'text-[#E2725B] border-[#E2725B] hover:bg-orange-50',
    borderColor: status === 'haram' ? 'border-red-500' : status === 'syubhat' ? 'border-yellow-400' : status === 'halal' ? 'border-green-500' : 'border-[#FF8A00]',
    cardBorder: status === 'haram' ? 'border-t-red-700' : status === 'syubhat' ? 'border-t-yellow-500' : status === 'halal' ? 'border-t-green-600' : 'border-t-[#FF8A00]',
  };

  return (
    <div className={`transition-colors duration-500 pb-28 min-h-screen flex flex-col ${theme.bg} ${theme.text}`}>
      <div className={`bg-gradient-to-br ${theme.headerBg} text-white p-6 text-center shadow-lg rounded-b-2xl transition-all duration-500 relative`}>
        <div className="flex items-center justify-center gap-3 mb-1 animate-fade-in">
          <ShieldCheck className="w-9 h-9 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight">Intel Halal</h1>
        </div>
        <p className="text-sm font-medium opacity-90">Asisten Pribadi Anda di Jepang</p>
      </div>

      <div className="max-w-xl w-full mx-auto px-4 mt-6 flex-grow">
        <div className={`p-6 mb-6 border-2 border-dashed rounded-2xl bg-white shadow-sm transition-all duration-300 ${theme.borderColor}`}>
          <h3 className={`text-center text-lg font-bold mb-4 ${status === 'haram' ? 'text-red-800' : status === 'syubhat' ? 'text-yellow-700' : status === 'halal' ? 'text-green-800' : 'text-[#E2725B]'}`}>Mulai Pindai & Analisis</h3>
          <div className="flex gap-3">
            <button onClick={() => startCamera('general')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${theme.btnOutline}`}>
              <Camera className="w-7 h-7 mb-2" />
              <span className="text-xs font-semibold">Kamera</span>
            </button>
            <button onClick={() => startCamera('barcode')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${theme.btnOutline}`}>
              <Barcode className="w-7 h-7 mb-2" />
              <span className="text-xs font-semibold">Barcode</span>
            </button>
            <label className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 ${theme.btnOutline}`}>
              <Upload className="w-7 h-7 mb-2" />
              <span className="text-xs font-semibold">Galeri</span>
              <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </label>
          </div>
        </div>

        {images.length === 0 && (
          <div className="animate-fade-in space-y-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -z-0"></div>
              <h4 className="flex items-center text-[#E2725B] font-bold text-lg mb-3 relative z-10">
                <CheckCircle className="w-5 h-5 mr-2 text-[#FF8A00]" /> Fitur Intel Halal
              </h4>
              <ul className="space-y-3 text-gray-700 text-sm relative z-10">
                <li className="flex items-start">
                  <span className="text-[#FF8A00] font-bold mr-2 mt-0.5 text-lg leading-none">•</span> 
                  <span className="flex-1 leading-relaxed"><strong>Deteksi Makanan:</strong> Cek akurat Halal, Haram & Syubhat beserta alternatif tempat belanja.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FF8A00] font-bold mr-2 mt-0.5 text-lg leading-none">•</span> 
                  <span className="flex-1 leading-relaxed"><strong>Scan Tempat:</strong> Info restoran/stasiun lengkap dengan tata krama (Manners) setempat.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FF8A00] font-bold mr-2 mt-0.5 text-lg leading-none">•</span> 
                  <span className="flex-1 leading-relaxed"><strong>Terjemah Cerdas:</strong> Baca rambu, surat, atau pengumuman Jepang beserta maksud konteksnya.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -z-0"></div>
              <h4 className="flex items-center text-[#E2725B] font-bold text-lg mb-4 relative z-10">
                <HelpCircle className="w-5 h-5 mr-2 text-[#FF8A00]" /> Cara Penggunaan
              </h4>
              <ul className="space-y-4 text-gray-700 text-sm relative z-10">
                <li className="flex items-start">
                  <span className="bg-[#FF8A00] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 shrink-0 shadow-sm mt-0.5">1</span> 
                  <span className="flex-1 leading-relaxed">Tap <strong>Kamera</strong> untuk memotret kemasan/tulisan, atau <strong>Barcode</strong>.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#FF8A00] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 shrink-0 shadow-sm mt-0.5">2</span> 
                  <span className="flex-1 leading-relaxed">Pastikan tulisan Kanji/Hiragana (komposisi bahan) terlihat jelas.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#FF8A00] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 shrink-0 shadow-sm mt-0.5">3</span> 
                  <span className="flex-1 leading-relaxed">Tap <strong>Mulai Analisis Holistik</strong> dan tunggu AI memproses data.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {isCameraOpen && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-fade-in">
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                {cameraMode === 'barcode' ? (
                  <div className="relative w-full max-w-sm aspect-[5/3] border border-white/20">
                    <style>{`
                      @keyframes scanline {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                      .animate-scanline {
                        animation: scanline 2s linear infinite;
                      }
                    `}</style>
                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-[#FF8A00]"></div>
                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-[#FF8A00]"></div>
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-[#FF8A00]"></div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-[#FF8A00]"></div>
                    
                    <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-scanline z-50"></div>

                    <div className="absolute -top-12 left-0 right-0 text-center">
                      <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm tracking-wide">
                        Arahkan Barcode ke dalam bingkai
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full max-w-sm aspect-[3/4] border border-white/20">
                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-[#FF8A00]"></div>
                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-[#FF8A00]"></div>
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-[#FF8A00]"></div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-[#FF8A00]"></div>
                    
                    <div className="absolute -top-12 left-0 right-0 text-center">
                      <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm tracking-wide">
                        Arahkan komposisi ke dalam bingkai
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h-32 bg-black flex items-center justify-around pb-6 px-6 z-10 relative">
              <button onClick={stopCamera} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"><X className="w-6 h-6" /></button>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-[#FF8A00] flex items-center justify-center"><div className="w-16 h-16 rounded-full bg-white"></div></button>
              <div className="w-12 h-12"></div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {images.map((img, idx) => (
              <div key={idx} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${theme.borderColor} shadow-sm group`}>
                <img src={img.dataUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && !isAnalyzing && !resultHtml && (
          <button onClick={analyzeImages} className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-colors duration-300 mb-4 ${theme.btnPrimary}`}>
            Mulai Analisis Holistik
          </button>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center my-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className={`w-12 h-12 animate-spin mb-4 ${status === 'haram' ? 'text-red-600' : status === 'syubhat' ? 'text-yellow-500' : status === 'halal' ? 'text-green-600' : 'text-[#FF8A00]'}`} />
            <p className={`text-center font-semibold italic ${status === 'haram' ? 'text-red-700' : status === 'syubhat' ? 'text-yellow-700' : status === 'halal' ? 'text-green-700' : 'text-[#E2725B]'}`}>Memproses gambar... AI sedang menganalisis.</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 text-center flex flex-col items-center">
            <AlertTriangle className="w-6 h-6 mb-2 text-red-600" />
            <p className="font-semibold text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {resultHtml && (
          <div className={`mt-6 bg-white rounded-2xl p-6 shadow-lg border-t-8 ${theme.cardBorder}`}>
            {status === 'haram' && (<div className="mb-6 text-center animate-pulse"><h2 className="text-5xl font-black text-red-600 uppercase mb-2">HARAM</h2></div>)}
            {status === 'syubhat' && (
              <div className="mb-6 text-center animate-pulse">
                <h2 className="text-4xl font-black text-yellow-500 uppercase mb-2">SYUBHAT / DOUBTFUL</h2>
                <p className="font-bold text-yellow-800 bg-yellow-100 py-2 px-4 rounded-lg inline-block">Status belum jelas, disarankan untuk dihindari.</p>
              </div>
            )}
            {status === 'halal' && (<div className="mb-6 text-center"><h2 className="text-4xl font-black text-green-600 uppercase mb-2">HALAL / AMAN</h2></div>)}
            <div className={`prose prose-sm md:prose-base max-w-none 
              [&>h4]:text-lg [&>h4]:font-bold [&>h4]:border-b-2 [&>h4]:pb-1 [&>h4]:mb-3 [&>h4]:mt-6 
              ${status === 'haram' ? '[&>h4]:text-red-700 [&>h4]:border-red-200' : status === 'syubhat' ? '[&>h4]:text-yellow-600 [&>h4]:border-yellow-200' : status === 'halal' ? '[&>h4]:text-green-700 [&>h4]:border-green-200' : '[&>h4]:text-[#E2725B] [&>h4]:border-orange-200'}
              [&>h3]:text-2xl [&>h3]:font-black [&>h3]:text-red-700 [&>h3]:uppercase [&>h3]:mb-4
            `} dangerouslySetInnerHTML={{ __html: resultHtml }} />
          </div>
        )}

        {(images.length > 0 || resultHtml || error) && (
          <button onClick={resetApp} className={`w-full flex items-center justify-center gap-2 py-4 px-4 mt-6 rounded-xl font-bold text-base border-2 ${theme.btnOutline} bg-white shadow-sm`}>
            <RefreshCw className="w-5 h-5" /> Mulai Baru (Reset)
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. KOMPONEN: BEA IMPOR
// ==========================================

const ImeiCalculator = () => {
  const [currency, setCurrency] = useState('JPY');
  const [price, setPrice] = useState('');
  const [hasNpwp, setHasNpwp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => setRates(data.rates))
      .catch(err => console.error("Gagal memuat kurs:", err));
  }, []);

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handleCalculate = () => {
    const parsedPrice = Math.max(0, parseFloat(price));
    if (!parsedPrice || isNaN(parsedPrice)) return;
    
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      const usdToIdr = rates?.IDR || 17000;
      const jpyToUsd = rates?.JPY || 151;
      const sgdToUsd = rates?.SGD || 1.35;
      const myrToUsd = rates?.MYR || 4.7;

      let priceInIdr = 0;
      if (currency === 'USD') priceInIdr = parsedPrice * usdToIdr;
      else if (currency === 'JPY') priceInIdr = parsedPrice * (usdToIdr / jpyToUsd);
      else if (currency === 'SGD') priceInIdr = parsedPrice * (usdToIdr / sgdToUsd);
      else if (currency === 'MYR') priceInIdr = parsedPrice * (usdToIdr / myrToUsd);

      const priceInUsd = priceInIdr / usdToIdr;
      const taxableUsd = Math.max(0, priceInUsd - 500);
      
      const ndpz = taxableUsd * usdToIdr;
      const bm = Math.ceil(0.10 * ndpz); 
      const ni = ndpz + bm; 
      const ppn = Math.ceil(0.11 * ni); 
      const pph = Math.ceil((hasNpwp ? 0.10 : 0.20) * ni); 
      const totalTax = Math.ceil(bm + ppn + pph); 

      setResult({
        priceUsd: priceInUsd,
        priceIdr: priceInIdr,
        taxableUsd,
        ndpz,
        bm,
        ni,
        ppn,
        pph,
        totalTax,
        usdToIdr,
        jpyToIdr: (usdToIdr / jpyToUsd) * 100 
      });
      setIsLoading(false);
    }, 1500); 
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-28 font-sans">
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white p-6 text-center shadow-lg rounded-b-2xl relative">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Smartphone className="w-9 h-9 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight">Bea Impor</h1>
        </div>
        <p className="text-sm font-medium opacity-90">Kalkulator Pajak IMEI Handphone</p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#3B82F6] mb-4" />
          <p className="animate-pulse text-[#1E40AF] font-bold text-lg">Sedang menghitung pajak...</p>
        </div>
      )}

      <div className="max-w-xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col">
        <div className="p-6 mb-6 border-2 border-blue-200 rounded-2xl bg-white shadow-sm">
          <h3 className="text-center text-lg font-bold mb-6 text-[#1E40AF]">Detail Perangkat</h3>
          
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mata Uang Asal</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-[#3B82F6] outline-none transition-colors">
                <option value="JPY">JPY (Yen Jepang)</option>
                <option value="USD">USD (Dollar AS)</option>
                <option value="SGD">SGD (Dollar Singapura)</option>
                <option value="MYR">MYR (Ringgit Malaysia)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Harga Beli HP</label>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCalculate()} placeholder="Contoh: 150000" className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-[#3B82F6] outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status NPWP / NIK</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                  <input type="radio" name="npwp" checked={hasNpwp} onChange={() => setHasNpwp(true)} className="w-5 h-5 text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB]" />
                  <span className="text-sm font-semibold text-gray-700">Ada (10%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                  <input type="radio" name="npwp" checked={!hasNpwp} onChange={() => setHasNpwp(false)} className="w-5 h-5 text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB]" />
                  <span className="text-sm font-semibold text-gray-700">Tidak (20%)</span>
                </label>
              </div>
            </div>

            <button onClick={handleCalculate} disabled={!rates} className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-colors duration-300 ${!rates ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1E40AF]'}`}>
              {!rates ? 'MEMUAT KURS...' : 'HITUNG ESTIMASI'}
            </button>
          </div>
        </div>

        {result && !isLoading && (
          <div className="mt-2 bg-white rounded-2xl p-6 shadow-lg border-t-8 border-t-[#2563EB] mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center shadow-inner">
              <p className="text-sm font-bold text-gray-600 mb-1">Total Estimasi Bayar</p>
              {result.totalTax === 0 ? (
                <p className="text-3xl font-black text-[#1E40AF] tracking-tight">BEBAS PAJAK</p>
              ) : (
                <p className="text-3xl font-black text-[#1E40AF] tracking-tight">{formatRp(result.totalTax)}</p>
              )}
              <p className="text-green-600 text-sm mt-3 font-semibold px-2">
                {result.totalTax === 0 ? "Aman Kang, harga di bawah limit $500." : `Kena pajak dari selisih $${result.taxableUsd.toFixed(2)}`}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center shadow-inner mt-4">
              <p className="text-xs font-bold text-emerald-800 mb-1">Total Modal Keseluruhan (IDR)</p>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatRp(result.priceIdr + result.totalTax + 25000)}</p>
              <p className="text-[10px] text-emerald-700 mt-1">*Termasuk Harga HP, Pajak & Biaya Transaksi Bank (Rp 25.000)</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mt-4">
              <p className="text-xs font-bold text-[#1E40AF] mb-2 uppercase">Kurs Referensi (Realtime)</p>
              <div className="flex justify-between text-xs text-gray-700">
                <span className="font-medium">1 USD</span><span className="font-bold">{formatRp(result.usdToIdr)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span className="font-medium">100 JPY</span><span className="font-bold">{formatRp(result.jpyToIdr)}</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-5 mt-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Nilai Barang (USD)</span><span className="font-bold">${result.priceUsd.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Pembebasan Bea</span><span className="font-bold text-green-600">-$500.00</span></div>
              <div className="flex justify-between text-base mt-2"><span className="text-gray-800 font-bold">Dasar Pajak / NDPZ</span><span className="font-black text-red-600">{formatRp(result.ndpz)}</span></div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 mt-3">
                <div className="flex justify-between text-sm"><span className="text-gray-700 font-medium">1. Bea Masuk (10%)</span><span className="font-bold text-gray-800">{formatRp(result.bm)}</span></div>
                <div className="flex justify-between text-xs text-gray-400 italic px-2"><span>Nilai Impor (NDPZ + BM)</span><span>{formatRp(result.ni)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-700 font-medium">2. PPN (11%)</span><span className="font-bold text-gray-800">{formatRp(result.ppn)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-700 font-medium">3. PPh ({hasNpwp ? '10%' : '20%'})</span><span className="font-bold text-gray-800">{formatRp(result.pph)}</span></div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl mt-4 border border-yellow-200 flex gap-3 items-start">
              <HelpCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                Estimasi menggunakan logika Kurs Kemenkeu. Pastikan lapor di <strong>Jalur Merah</strong> untuk mendapatkan batas bebas $500.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN: TRIP PLAN
// ==========================================

const TripPlan = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultHtml, setResultHtml] = useState(null);
  const [error, setError] = useState(null);

  const handleGo = async () => {
    if (!origin.trim() || !destination.trim()) return;
    
    setIsLoading(true);
    setResultHtml(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const apiKey = ""; // MASUKKAN API KEY GEMINI DI SINI
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const systemPrompt = `
        Kamu adalah "Pemandu Perjalanan Jepang" yang sangat ramah, asyik, dan komunikatif.
        Pengguna ingin melakukan perjalanan:
        - Titik Asal: "${origin}"
        - Tujuan Akhir: "${destination}"

        TUGAS:
        Berikan MAKSIMAL 3 alternatif rute perjalanan yang hanya menggunakan transportasi umum di Jepang (Kereta, Kereta Bawah Tanah/Subway, Bus, atau Jalan Kaki).
        
        URUTAN PENYAJIAN:
        1. Rute Tercepat (Waktu tempuh paling singkat)
        2. Rute Termurah (Biaya paling hemat)
        3. Rute Santai / Pemandangan (Jika ada).

        GAYA BAHASA:
        Gunakan gaya "story-telling" seolah-olah memandu mereka (misal: "Dari stasiun A, kamu bisa jalan santai... lalu naik jalur Yamanote warna hijau..."). Sebutkan nama jalur secara spesifik, stasiun transit, estimasi waktu, dan biayanya.

        FORMAT OUTPUT (HTML MURNI):
        Jangan gunakan markdown \`\`\`html.
        Untuk setiap rute, WAJIB buat struktur HTML seperti ini:
        
        <div style="background-color: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h4 style="color: #047857; font-size: 1.2rem; font-weight: 800; margin-top: 0; margin-bottom: 12px; border-bottom: 2px solid #34d399; padding-bottom: 8px;">Alternatif 1: Rute Tercepat</h4>
          <div style="color: #374151; line-height: 1.7; margin-bottom: 20px; font-size: 0.95rem;">
            [Tuliskan cerita perjalanan/story-telling yang asyik di sini]
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&origin=[TITIK ASAL]&destination=[TITIK TUJUAN]&travelmode=transit" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #059669; color: white; padding: 14px; border-radius: 12px; font-weight: bold; text-decoration: none;">
            Buka Rute Ini di Google Maps
          </a>
        </div>
      `;

      const payload = {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 3000 }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Terjadi kesalahan API");

      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada rute yang ditemukan.";
      setResultHtml(textResult);

    } catch (err) {
      setError(err.message || "Gagal menyusun rute. Pastikan koneksi internet stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-28 font-sans">
      <div className="bg-gradient-to-br from-[#047857] to-[#10B981] text-white p-6 text-center shadow-lg rounded-b-2xl relative">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Map className="w-9 h-9 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight">Trip Plan</h1>
        </div>
        <p className="text-sm font-medium opacity-90">Jelajahi Jepang dengan Transportasi Umum</p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-4 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#10B981] mb-4" />
          <p className="animate-pulse text-[#047857] font-bold text-lg">Menganalisis stasiun & jalur...</p>
          <p className="text-[#059669] text-sm mt-2 opacity-80">Mencari kombinasi kereta dan bus terbaik buat kamu.</p>
        </div>
      )}

      <div className="max-w-xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col">
        <div className="p-6 mb-6 border-2 border-emerald-200 rounded-2xl bg-white shadow-sm">
          <h3 className="text-center text-lg font-bold mb-6 text-[#047857] flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" /> Rencana Perjalanan
          </h3>
          
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-emerald-200 z-0 border-l-2 border-dashed"></div>

            <div className="relative z-10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-emerald-500">
                <span className="text-emerald-700 font-bold text-sm">A</span>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Saya Berada Di :</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Misal: Shinjuku Station"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-[#10B981] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-3 mt-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tujuan Saya Ke :</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGo()}
                  placeholder="Misal: Tokyo Tower"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-[#10B981] outline-none transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleGo}
              disabled={!origin || !destination}
              className={`w-full mt-4 py-4 px-4 rounded-xl text-white font-black text-xl shadow-md transition-all duration-300 tracking-wider ${
                !origin || !destination
                  ? 'bg-gray-300 opacity-70 cursor-not-allowed'
                  : 'bg-[#10B981] hover:bg-[#047857] active:scale-[0.98]'
              }`}
            >
              GO
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 text-center flex flex-col items-center">
            <AlertTriangle className="w-6 h-6 mb-2 text-red-600" />
            <p className="font-semibold text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {resultHtml && !isLoading && (
          <div className="flex flex-col gap-4 mb-6 animate-[fadeIn_0.5s_ease-in-out_forwards]">
            <div dangerouslySetInnerHTML={{ __html: resultHtml }} className="w-full" />
            <button onClick={() => { setResultHtml(null); setOrigin(''); setDestination(''); window.scrollTo(0,0); }} className="w-full flex items-center justify-center gap-2 py-4 px-4 mt-2 rounded-xl font-bold text-base border-2 border-[#10B981] text-[#047857] bg-white shadow-sm hover:bg-emerald-50 transition-colors">
              <RefreshCw className="w-5 h-5" /> Buat Rencana Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. KOMPONEN: FIND PLACE
// ==========================================

const FindPlace = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
  const [locationName, setLocationName] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const placeData = {
    "Akomodasi (Tempat Menginap)": [
      "Hotel Budget", "Hotel Bintang 3–5", "Hostel / Capsule Hotel", 
      "Guest House / Homestay", "Ryokan (penginapan tradisional Jepang)", "Apartment Rental (Airbnb-style)"
    ],
    "Kuliner & Makanan": [
      "Street Food Area", "Food Court", "Restoran Vegetarian / Vegan", 
      "Restoran Seafood", "Bakery / Dessert Shop", "Bar / Izakaya (non-halal opsional)"
    ],
    "Transportasi & Mobilitas": [
      "Stasiun Kereta", "Terminal Bus", "Bandara", 
      "Taxi Stand", "Rental Mobil / Motor", "Penyewaan Sepeda"
    ],
    "Belanja & Retail": [
      "Shopping Mall", "Pasar Tradisional", "Outlet Brand / Factory Outlet", 
      "Duty Free Shop", "Supermarket", "Toko Elektronik"
    ],
    "Wisata & Atraksi": [
      "Museum", "Taman Kota / Public Park", "Landmark Ikonik / Spot Foto", 
      "Pantai / Nature Spot", "Theme Park / Wahana", "Zoo / Aquarium"
    ],
    "Relaksasi & Lifestyle": [
      "Spa & Massage", "Salon / Barbershop", "Gym / Fitness Center", 
      "Onsen / Sauna", "Yoga Studio"
    ],
    "Layanan & Kesehatan": [
      "Klinik / Rumah Sakit", "Money Changer", "ATM / Bank", 
      "Laundry", "Tourist Information Center"
    ],
    "Tempat Ibadah": [
      "Masjid / Musholla", "Praying room"
    ]
  };

  const fetchLocationFromIP = async () => {
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data && data.success) {
        setLocationName(`${data.city}, ${data.region}`);
      } else {
        const resFallback = await fetch('https://freeipapi.com/api/json');
        const dataFallback = await resFallback.json();
        if (dataFallback && dataFallback.cityName) {
          setLocationName(`${dataFallback.cityName}, ${dataFallback.regionName}`);
        } else {
          throw new Error("Semua API IP gagal");
        }
      }
    } catch (err) {
      setLocationError('Gagal mendapatkan lokasi. GPS diblokir dan deteksi jaringan gagal. Coba matikan VPN.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      fetchLocationFromIP(); 
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, {
            headers: { 'Accept-Language': 'id' }
          });
          const data = await response.json();

          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.county || data.address.state || "";
            const country = data.address.country || "";
            const finalLocation = `${city}${city && country ? ', ' : ''}${country}`;
            setLocationName(finalLocation || data.display_name.split(',').slice(0, 3).join(', '));
          } else if (data && data.display_name) {
            setLocationName(data.display_name.split(',').slice(0, 3).join(', '));
          } else {
            setLocationName(`Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setIsLocating(false);
        } catch (err) {
          fetchLocationFromIP();
        }
      },
      (error) => {
        console.warn("GPS diblokir/gagal. Memaksa pencarian via Jaringan (IP)...");
        fetchLocationFromIP();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory('');
  };

  const handleSearch = () => {
    if (!selectedSubCategory) return;
    
    const locationContext = locationName ? locationName : "me";
    const searchQuery = encodeURIComponent(`${selectedSubCategory} near ${locationContext} within 2 miles`);
    
    window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-28 font-sans">
      <div className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white p-6 text-center shadow-lg rounded-b-2xl transition-all duration-500 relative">
        <div className="flex items-center justify-center gap-3 mb-1 animate-fade-in">
          <Compass className="w-9 h-9 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight">Find Place</h1>
        </div>
        <p className="text-sm font-medium opacity-90">Temukan lokasi penting di sekitarmu</p>
      </div>

      <div className="max-w-xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col">
        
        <div className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-200 mb-6 flex flex-col items-center justify-center text-center shadow-sm transition-all duration-300">
          {isLocating ? (
            <div className="flex items-center gap-3 text-purple-700 py-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold animate-pulse">Mendeteksi koordinat satelit...</span>
            </div>
          ) : locationName ? (
            <div className="flex flex-col items-center gap-2 w-full animate-fade-in">
              <span className="text-[11px] font-black text-purple-500 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
                Satelit Terhubung
              </span>
              <p className="text-xs text-gray-500 font-medium mt-1">Anda Berada di :</p>
              <div className="flex items-center justify-center gap-2 text-purple-900 font-bold w-full bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                <MapPin className="w-5 h-5 text-[#8B5CF6] shrink-0" />
                <span className="text-sm line-clamp-2 text-left">{locationName}</span>
              </div>
              <button onClick={handleGetLocation} className="text-xs text-purple-600 font-semibold mt-2 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Perbarui Lokasi
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="bg-purple-100 p-3 rounded-full mb-1">
                <LocateFixed className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-purple-900">Cek Lokasi Saya</span>
              <p className="text-xs text-gray-500 mb-2 text-center">Aplikasi akan mengambil data dari Handphone tempat Anda berada.</p>
              
              <button
                onClick={handleGetLocation}
                className="flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#6D28D9] text-white py-3 px-6 rounded-xl font-bold text-sm transition-colors w-full shadow-md active:scale-95"
              >
                <Navigation className="w-4 h-4" /> Deteksi Sekarang
              </button>
              
              {locationError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-3 bg-red-50 p-3 rounded-xl border border-red-100 text-left">
                  <AlertTriangle className="w-8 h-8 shrink-0 text-red-500" />
                  <p className="leading-relaxed">{locationError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 mb-6 border-2 border-purple-200 rounded-2xl bg-white shadow-sm transition-all duration-300">
          <h3 className="text-center text-lg font-bold mb-6 text-[#6D28D9] flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Direktori Pencarian
          </h3>
          
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Jenis Tempat</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-[#8B5CF6] outline-none transition-colors"
              >
                <option value="" disabled>-- Silakan Pilih Kategori --</option>
                {Object.keys(placeData).map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="animate-fade-in">
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Spesifik Tempat</label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full border-2 border-purple-100 rounded-xl p-3 bg-purple-50 focus:bg-white focus:border-[#8B5CF6] outline-none transition-colors text-purple-900"
                >
                  <option value="" disabled>-- Pilih Detail Tempat --</option>
                  {placeData[selectedCategory].map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedCategory && selectedSubCategory && (
              <button
                onClick={handleSearch}
                className="w-full mt-2 py-4 px-4 rounded-xl text-white font-black text-xl shadow-md transition-all duration-300 tracking-wider bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-95 animate-fade-in flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" /> CARI DI GOOGLE MAPS
              </button>
            )}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 items-start animate-fade-in">
          <HelpCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <p className="text-xs text-purple-800 leading-relaxed font-medium">
            Saat tombol <strong>CARI</strong> ditekan, aplikasi otomatis membuka Google Maps dan mencarikan lokasi terdekat dalam <strong>radius maksimal 2 mil (sekitar 3,2 km)</strong> dari titik acuan Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP WRAPPER (TABS)
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('cek-halal');

  useEffect(() => {
    if (activeTab === 'cek-halal') document.title = "Intel Halal - AI Scanner";
    else if (activeTab === 'bea-impor') document.title = "Kalkulator IMEI - Bea Impor";
    else if (activeTab === 'trip-plan') document.title = "Trip Plan - Rute Jepang";
    else if (activeTab === 'find-place') document.title = "Find Place - Direktori Jepang";
  }, [activeTab]);

  return (
    <div className="bg-gray-100 min-h-screen relative font-sans">
      
      {/* "Keep-Alive" Tabs Implementation */}
      <div className={activeTab === 'cek-halal' ? 'block' : 'hidden'}>
        <CekHalal isActive={activeTab === 'cek-halal'} />
      </div>
      
      <div className={activeTab === 'bea-impor' ? 'block' : 'hidden'}>
        <ImeiCalculator />
      </div>
      
      <div className={activeTab === 'trip-plan' ? 'block' : 'hidden'}>
        <TripPlan />
      </div>

      <div className={activeTab === 'find-place' ? 'block' : 'hidden'}>
        <FindPlace />
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div 
        className="fixed bottom-0 w-full bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.05)] border-t border-gray-200 z-[999]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16 max-w-xl mx-auto px-2">
          
          <button
            onClick={() => setActiveTab('cek-halal')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'cek-halal' ? 'text-[#FF8A00]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck className={`w-6 h-6 ${activeTab === 'cek-halal' ? 'fill-orange-50' : ''}`} />
            <span className="text-[10px] font-bold">Cek Halal</span>
          </button>

          <button
            onClick={() => setActiveTab('bea-impor')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'bea-impor' ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calculator className={`w-6 h-6 ${activeTab === 'bea-impor' ? 'fill-blue-50' : ''}`} />
            <span className="text-[10px] font-bold">Bea Impor</span>
          </button>

          <button
            onClick={() => setActiveTab('trip-plan')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'trip-plan' ? 'text-[#10B981]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Map className={`w-6 h-6 ${activeTab === 'trip-plan' ? 'fill-emerald-50' : ''}`} />
            <span className="text-[10px] font-bold">Trip Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('find-place')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'find-place' ? 'text-[#6D28D9]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Compass className={`w-6 h-6 ${activeTab === 'find-place' ? 'fill-purple-50' : ''}`} />
            <span className="text-[10px] font-bold">Find Place</span>
          </button>
          
        </div>
      </div>
      
    </div>
  );
}