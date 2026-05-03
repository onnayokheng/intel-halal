export const compressImage = (dataUrl: string, maxWidth = 800): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = dataUrl;
  });

export const parseStatus = (text: string): { status: "halal" | "syubhat" | "haram" | "idle"; cleaned: string } => {
  if (text.includes("<!-- STATUS_HARAM -->")) {
    return { status: "haram", cleaned: text.replace("<!-- STATUS_HARAM -->", "") };
  }
  if (text.includes("<!-- STATUS_SYUBHAT -->") || text.includes("<!-- STATUS_DOUBTFUL -->")) {
    return { status: "syubhat", cleaned: text.replace("<!-- STATUS_SYUBHAT -->", "").replace("<!-- STATUS_DOUBTFUL -->", "") };
  }
  if (text.includes("<!-- STATUS_HALAL -->")) {
    return { status: "halal", cleaned: text.replace("<!-- STATUS_HALAL -->", "") };
  }
  return { status: "idle", cleaned: text };
};
