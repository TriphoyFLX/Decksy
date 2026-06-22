import pptxgen from "pptxgenjs";
import { PitchDeck } from "../types";

export function exportToPPTX(deck: PitchDeck, options?: { removeWatermark?: boolean }) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";

  deck.slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    const isTitle = idx === 0 || slide.type === "title";
    const teamMembers = slide.visualData?.teamMembers;

    if (isTitle && slide.image) {
      s.addImage({ data: slide.image, x: 0, y: 0, w: 10, h: 5.625 });
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 5.625,
        fill: { color: "000000", transparency: 45 },
        line: { color: "000000", transparency: 100 },
      });
      s.addText(slide.title, {
        x: 0.7, y: 3.6, w: 8.6, h: 1.0,
        fontSize: 32, bold: true, color: "FFFFFF", fontFace: "Arial",
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.7, y: 4.5, w: 8.6, h: 0.5,
          fontSize: 14, color: "E2E8F0", fontFace: "Arial",
        });
      }
    } else if (teamMembers && teamMembers.length > 0) {
      s.background = { color: "0B0B0F" };
      s.addText(slide.title || "Команда", {
        x: 0.7, y: 0.4, w: 8.6, h: 0.6,
        fontSize: 24, bold: true, color: "A78BFA", fontFace: "Arial",
      });
      const cols = Math.min(teamMembers.length, 4);
      const cardW = 8.6 / cols - 0.15;
      teamMembers.slice(0, 4).forEach((m, i) => {
        const x = 0.7 + i * (cardW + 0.2);
        s.addShape(pptx.ShapeType.roundRect, {
          x, y: 1.3, w: cardW, h: 3.6,
          fill: { color: "1A1A22" },
          line: { color: "333344", pt: 1 },
          rectRadius: 0.08,
        });
        if (m.image) {
          s.addImage({ data: m.image, x: x + 0.25, y: 1.55, w: cardW - 0.5, h: 1.6, sizing: { type: "cover", w: cardW - 0.5, h: 1.6 } });
        }
        s.addText(m.name, {
          x: x + 0.15, y: 3.3, w: cardW - 0.3, h: 0.35,
          fontSize: 12, bold: true, color: "FFFFFF", fontFace: "Arial", align: "center",
        });
        s.addText(m.role, {
          x: x + 0.15, y: 3.65, w: cardW - 0.3, h: 0.3,
          fontSize: 9, color: "10B981", fontFace: "Arial", align: "center",
        });
      });
    } else {
      s.background = { color: "0F172A" };

      s.addText(slide.title, {
        x: 0.7, y: 0.45, w: slide.image ? 4.8 : 8.6, h: 0.75,
        fontSize: 22, bold: true, color: "38BDF8", fontFace: "Arial",
      });

      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.7, y: 1.1, w: slide.image ? 4.8 : 8.6, h: 0.35,
          fontSize: 13, italic: true, color: "94A3B8", fontFace: "Arial",
        });
      }

      const yStart = slide.subtitle ? 1.55 : 1.3;
      const bullets = slide.content.map((bullet) => ({
        text: "  " + bullet,
        options: { bullet: true, color: "F8FAFC", fontSize: 14 },
      }));

      if (bullets.length > 0) {
        // @ts-ignore
        s.addText(bullets, {
          x: 0.7,
          y: yStart,
          w: slide.image ? 4.6 : 8.6,
          h: 4.2,
          fontFace: "Arial",
          lineSpacing: 22,
        });
      }

      if (slide.image) {
        s.addImage({
          data: slide.image,
          x: 5.4,
          y: 0.9,
          w: 4.0,
          h: 4.2,
          sizing: { type: "cover", w: 4.0, h: 4.2 },
        });
      }
    }

    if (!options?.removeWatermark) {
      s.addText("made decksy.ru", {
        x: 0.7, y: 6.85, w: 4.0, h: 0.25,
        fontSize: 9, color: "64748B", fontFace: "Arial",
      });
    } else {
      s.addText(deck.title, {
        x: 0.7, y: 6.85, w: 4.0, h: 0.25,
        fontSize: 9, color: "64748B", fontFace: "Arial",
      });
    }
  });

  pptx.writeFile({
    fileName: `${deck.title.replace(/[^a-zA-Z0-9А-Яа-я]/g, "_")}_Pitch_Deck.pptx`,
  });
}
