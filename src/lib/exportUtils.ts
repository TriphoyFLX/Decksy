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
    const cls = typeof el.className === "string" ? el.className : "";
    if (cls) {
      const classes = cls.split(/\s+/).filter(Boolean);
      
      // Determine if this element has desktop grid columns
      let hasDesktopColumns = false;
      let desktopColClass = "";
      for (const c of classes) {
        if (c.includes("grid-cols-2") || c.includes("grid-cols-3") || c.includes("grid-cols-4")) {
          hasDesktopColumns = true;
          if (c.includes("grid-cols-2")) desktopColClass = "grid-cols-2";
          if (c.includes("grid-cols-3")) desktopColClass = "grid-cols-3";
          if (c.includes("grid-cols-4")) desktopColClass = "grid-cols-4";
        }
      }

      let updatedClasses = classes.map((c) => {
        let activeClass = c;
        // Strip responsive prefixes
        if (c.includes(":")) {
          const parts = c.split(":");
          const prefix = parts[0];
          const actual = parts[1];
          if (["sm", "md", "lg", "xl", "2xl"].includes(prefix)) {
            activeClass = actual;
          }
        }
        
        // Remove mobile-only grid-cols-1 if we have a multi-column desktop layout
        if (hasDesktopColumns && activeClass === "grid-cols-1") {
          return "";
        }
        
        // Match specific font size scaling
        const textMap: Record<string, string> = {
          'text-[7px]': 'text-[18px]',
          'text-[7.5px]': 'text-[19px]',
          'text-[8px]': 'text-[21px]',
          'text-[8.5px]': 'text-[22px]',
          'text-[9px]': 'text-[23px]',
          'text-[9.5px]': 'text-[25px]',
          'text-[10px]': 'text-[26px]',
          'text-[10.5px]': 'text-[27px]',
          'text-[11px]': 'text-[29px]',
          'text-xs': 'text-[30px]',
          'text-sm': 'text-[36px]',
          'text-md': 'text-[42px]',
          'text-base': 'text-[42px]',
          'text-lg': 'text-[48px]',
          'text-xl': 'text-[54px]',
          'text-2xl': 'text-[62px]',
          'text-3xl': 'text-[72px]',
          'text-4xl': 'text-[82px]',
          'text-5xl': 'text-[96px]',
        };

        if (textMap[activeClass]) return textMap[activeClass];

        // Custom pixel check (e.g. text-[9.5px])
        const customTextMatch = activeClass.match(/^text-\[(\d+\.?\d*)px\]$/);
        if (customTextMatch) {
          const originalSize = parseFloat(customTextMatch[1]);
          const scaledSize = Math.round(originalSize * 2.6);
          return `text-[${scaledSize}px]`;
        }

        const customLeadingMatch = activeClass.match(/^leading-\[(\d+\.?\d*)px\]$/);
        if (customLeadingMatch) {
          const originalSize = parseFloat(customLeadingMatch[1]);
          const scaledSize = Math.round(originalSize * 2.6);
          return `leading-[${scaledSize}px]`;
        }

        // Match standard spacings, widths, heights
        const spacingMap: Record<string, string> = {
          'gap-1': 'gap-[10px]',
          'gap-1.5': 'gap-[15px]',
          'gap-2': 'gap-[20px]',
          'gap-2.5': 'gap-[24px]',
          'gap-3': 'gap-[30px]',
          'gap-4': 'gap-[40px]',
          'gap-5': 'gap-[50px]',
          'gap-6': 'gap-[60px]',
          'p-1': 'p-[10px]',
          'p-1.5': 'p-[15px]',
          'p-2': 'p-[20px]',
          'p-2.5': 'p-[25px]',
          'p-3': 'p-[30px]',
          'p-4': 'p-[40px]',
          'p-5': 'p-[50px]',
          'py-1': 'py-[10px]',
          'py-1.5': 'py-[15px]',
          'py-2': 'py-[20px]',
          'px-2': 'px-[20px]',
          'px-2.5': 'px-[25px]',
          'px-3': 'px-[30px]',
          'px-4': 'px-[40px]',
          'pb-1': 'pb-[10px]',
          'pb-1.5': 'pb-[15px]',
          'pb-2': 'pb-[20px]',
          'pt-1': 'pt-[10px]',
          'pt-2': 'pt-[20px]',
          'h-5': 'h-[48px]',
          'w-5': 'w-[48px]',
          'h-4': 'h-[38px]',
          'w-4': 'w-[38px]',
          'h-3': 'h-[28px]',
          'w-3': 'w-[28px]',
          'h-12': 'h-[110px]',
          'w-12': 'w-[110px]',
          'h-9': 'h-[80px]',
          'w-9': 'w-[80px]',
          'h-1.5': 'h-[15px]',
          'w-1.5': 'w-[15px]',
          'h-[100px]': 'h-[250px]',
          'h-[50px]': 'h-[125px]',
          'rounded-lg': 'rounded-[20px]',
          'rounded-xl': 'rounded-[30px]',
          'rounded-2xl': 'rounded-[40px]',
        };

        if (spacingMap[activeClass]) return spacingMap[activeClass];

        return activeClass;
      }).filter(Boolean);

      if (hasDesktopColumns && !updatedClasses.includes(desktopColClass)) {
        updatedClasses.push(desktopColClass);
      }

      el.className = updatedClasses.join(" ");
    }

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

export const EXPORT_SLIDE_WIDTH = 1280;
export const EXPORT_SLIDE_HEIGHT = 720;

export function getExportHtml2canvasOptions(element: HTMLElement) {
  return {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    width: EXPORT_SLIDE_WIDTH,
    height: EXPORT_SLIDE_HEIGHT,
    windowWidth: EXPORT_SLIDE_WIDTH,
    windowHeight: EXPORT_SLIDE_HEIGHT,
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
