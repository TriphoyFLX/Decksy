import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import pptxgen from "pptxgenjs";
import JSZip from "jszip";

// Mathematical converters to translate OKLCH and OKLAB color formats back to sRGB.
// This is critical because html2canvas/jsPDF color engines fail with "unsupported color function oklab/oklch".
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  const hRad = isNaN(h) ? 0 : (h * Math.PI) / 180;
  
  const L = l;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855414 * b_;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const rCurrent = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gCurrent = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bCurrent = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  const f = (x: number) => {
    if (isNaN(x)) return 0;
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  
  const r = Math.max(0, Math.min(255, Math.round(f(rCurrent) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gCurrent) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(bCurrent) * 255)));
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function oklabToRgb(L: number, a_: number, b_: number, a: number = 1): string {
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855414 * b_;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const rCurrent = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gCurrent = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bCurrent = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  const f = (x: number) => {
    if (isNaN(x)) return 0;
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  
  const r = Math.max(0, Math.min(255, Math.round(f(rCurrent) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gCurrent) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(bCurrent) * 255)));
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function convertOklchToRgbFallback(value: any): any {
  if (typeof value !== 'string') return value;
  if (!value.includes('oklch') && !value.includes('oklab')) return value;

  let result = value;

  // Pattern: oklch(0.62 0.17 256.4 / 0.15) or similar
  const oklchRegex = /oklch\(\s*([\d.e%+\-]+)\s+([\d.e%+\-]+)\s+([\d.e%a-z+\-]+)(?:\s*\/\s*([\d.e%+\-]+))?\s*\)/gi;
  result = result.replace(oklchRegex, (match, lStr, cStr, hStr, aStr) => {
    let l = parseFloat(lStr);
    if (lStr.endsWith('%')) l = l / 100;
    
    let c = parseFloat(cStr);
    if (cStr.endsWith('%')) c = c / 100;
    
    let h = parseFloat(hStr.replace('deg', ''));
    if (hStr.endsWith('%')) h = (parseFloat(hStr) * 360) / 100;
    
    let a = 1;
    if (aStr) {
      if (aStr.endsWith('%')) {
        a = parseFloat(aStr) / 100;
      } else {
        a = parseFloat(aStr);
      }
    }
    return oklchToRgb(l, c, h, a);
  });

  // Pattern: oklab(L A B / alpha) or color(oklab L A B / alpha)
  const oklabRegex = /(?:color\(\s*)?oklab\(\s*([\d.e%+\-]+)\s+([\d.e%+\-]+)\s+([\d.e%+\-]+)(?:\s*\/\s*([\d.e%+\-]+))?\s*\)?/gi;
  result = result.replace(oklabRegex, (match, lStr, aStr_val, bStr_val, aStr) => {
    let l = parseFloat(lStr);
    if (lStr.endsWith('%')) l = l / 100;
    
    const aVal = parseFloat(aStr_val);
    const bVal = parseFloat(bStr_val);
    
    let a = 1;
    if (aStr) {
      if (aStr.endsWith('%')) {
        a = parseFloat(aStr) / 100;
      } else {
        a = parseFloat(aStr);
      }
    }
    return oklabToRgb(l, aVal, bVal, a);
  });

  return result;
}

// Temporary global patch during high-DPI export passes
export function patchComputedStyle(): () => void {
  const originalGetComputedStyle = window.getComputedStyle;
  
  window.getComputedStyle = function(elt, pseudoElt) {
    const style = originalGetComputedStyle(elt, pseudoElt);
    
    return new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return (propertyName: string) => {
            const val = target.getPropertyValue(propertyName);
            return convertOklchToRgbFallback(val);
          };
        }
        
        const value = target[prop as any] as any;
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return convertOklchToRgbFallback(value);
      }
    });
  };
  
  return () => {
    window.getComputedStyle = originalGetComputedStyle;
  };
}

/** Fix CSS features that html2canvas renders incorrectly (gradient text, blur, animations). */
export function applyExportSafeStyles(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[style*="blur"]').forEach((el) => {
    el.style.display = "none";
  });

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const nextCls = typeof el.className === "string" ? el.className : "";
    const hasClipText =
      nextCls.includes("bg-clip-text") ||
      nextCls.includes("text-transparent") ||
      el.style.webkitBackgroundClip === "text" ||
      el.style.backgroundClip === "text";

    if (hasClipText) {
      el.style.background = "none";
      el.style.backgroundImage = "none";
      el.style.webkitBackgroundClip = "border-box";
      el.style.backgroundClip = "border-box";
      el.style.color = "#ffffff";
      el.style.webkitTextFillColor = "#ffffff";
    }

    if (nextCls.includes("truncate") || nextCls.includes("line-clamp")) {
      el.style.overflow = "visible";
      el.style.textOverflow = "clip";
      el.style.whiteSpace = "normal";
      el.style.webkitLineClamp = "unset";
      el.style.display = "block";
    }

    el.style.animation = "none";
    el.style.transition = "none";
  });
}

/** Base slide frame size before scale-up to 1280×720 export. */
export const EXPORT_SLIDE_WIDTH = 1280;
export const EXPORT_SLIDE_HEIGHT = 720;
export const EXPORT_BASE_WIDTH = 512;
export const EXPORT_BASE_HEIGHT = 288;
export const EXPORT_FRAME_SCALE = EXPORT_SLIDE_WIDTH / EXPORT_BASE_WIDTH;

export function getExportHtml2canvasOptions(element: HTMLElement) {
  const w = element.offsetWidth || EXPORT_BASE_WIDTH;
  const h = element.offsetHeight || EXPORT_BASE_HEIGHT;
  const scale = Math.max(1, EXPORT_SLIDE_WIDTH / w);
  return {
    scale,
    useCORS: true,
    backgroundColor: "#000000",
    logging: false,
    width: w,
    height: h,
    windowWidth: w,
    windowHeight: h,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc: Document) => {
      const cloned = clonedDoc.getElementById(element.id);
      if (cloned) applyExportSafeStyles(cloned);
    },
  } as const;
}

// Captures a specific set of DOM nodes sequentially and returns their image data URLs
export async function captureSlidesToImages(
  slideIds: string[], 
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const images: string[] = [];
  const total = slideIds.length;

  for (let i = 0; i < total; i++) {
    const element = document.getElementById(slideIds[i]);
    if (!element) {
      console.warn(`Slide element with id ${slideIds[i]} not found for export.`);
      continue;
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Wait slightly to make sure the slide is rendered fully and style bindings are applied
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Capture with high quality (2x scale for Retina) and proper color settings
    const canvas = await html2canvas(element, getExportHtml2canvasOptions(element));

    const imgDataUrl = canvas.toDataURL("image/png");
    images.push(imgDataUrl);
  }

  return images;
}

export function exportImagesToPDF(images: string[], title: string) {
  // 16:9 standard landscape proportions in mm based on A4 width (297mm)
  const width = 297;
  const height = 167.0625; // 297 * 9 / 16
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [width, height]
  });

  images.forEach((imgDataUrl, idx) => {
    if (idx > 0) {
      pdf.addPage([width, height], "landscape");
    }
    pdf.addImage(imgDataUrl, "PNG", 0, 0, width, height, undefined, "MEDIUM");
  });

  pdf.save(`${title.replace(/[^a-zA-Z0-9А-Яа-я]/g, "_")}_Pitch_Deck.pdf`);
}

export function exportImagesToPPTX(images: string[], title: string) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";

  images.forEach((imgDataUrl) => {
    const s = pptx.addSlide();
    s.addImage({
      data: imgDataUrl,
      x: 0,
      y: 0,
      w: 10,
      h: 5.625, // 16:9 scale in pptxgenjs
    });
  });

  pptx.writeFile({ fileName: `${title.replace(/[^a-zA-Z0-9А-Яа-я]/g, "_")}_Pitch_Deck.pptx` });
}

export async function downloadSlidesAsZIP(images: string[], title: string) {
  const zip = new JSZip();
  const folderName = `${title.replace(/[^a-zA-Z0-9А-Яа-я]/g, "_")}_Slides_JPEG`;
  const folder = zip.folder(folderName);
  
  if (!folder) throw new Error("Could not create ZIP folder");

  images.forEach((imgDataUrl, idx) => {
    // strip out the data:image/... header to get raw base64 contents
    const base64Data = imgDataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const slideNumber = String(idx + 1).padStart(2, '0');
    folder.file(`Slide_${slideNumber}.jpg`, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
