import { PitchDeck } from "../types";

// Generates an incredibly clean, highly-styled python-pptx script that reproduces the slides and speaker notes locally
export function generatePythonPPTXCode(deck: PitchDeck): string {
  let py = `# -*- coding: utf-8 -*-
"""
Презентация: ${deck.title}
Автоматически сгенерировано Decksy AI.

Инструкция по запуску:
1. Установите python-pptx:
   pip install python-pptx

2. Запустите этот скрипт:
   python generate_presentation.py
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def apply_background(slide, color):
    # Заливка фона слайда
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color

def create_textbox(slide, left, top, width, height):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0)
    tf.margin_right = Inches(0)
    tf.margin_top = Inches(0)
    tf.margin_bottom = Inches(0)
    return tf

def add_header_badge(slide, title_text, slide_num_text):
    # Линейка-разделитель вверху
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.8), Inches(12.33), Inches(0.01))
    line.fill.solid()
    line.fill.fore_color.rgb = RGBColor(40, 40, 48)
    line.line.color.rgb = RGBColor(40, 40, 48)
    
    tf = create_textbox(slide, Inches(0.5), Inches(0.4), Inches(8), Inches(0.3))
    p = tf.paragraphs[0]
    p.text = title_text.upper()
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    
    tf2 = create_textbox(slide, Inches(10), Inches(0.4), Inches(2.83), Inches(0.3))
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.RIGHT
    p2.text = slide_num_text.upper()
    p2.font.name = "Courier New"
    p2.font.size = Pt(9)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(120, 120, 140)

def add_footer(slide, title_text):
    # Копирайт футер
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(6.8), Inches(12.33), Inches(0.01))
    line.fill.solid()
    line.fill.fore_color.rgb = RGBColor(40, 40, 48)
    line.line.color.rgb = RGBColor(40, 40, 48)
    
    tf = create_textbox(slide, Inches(0.5), Inches(6.95), Inches(8), Inches(0.3))
    p = tf.paragraphs[0]
    p.text = f"© {title_text} • Seed Round"
    p.font.name = "Courier New"
    p.font.size = Pt(8)
    p.font.color.rgb = RGBColor(100, 100, 110)
    
    tf2 = create_textbox(slide, Inches(9), Inches(6.95), Inches(3.83), Inches(0.3))
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.RIGHT
    p2.text = f"ПРОЕКТ: {title_text.upper()}"
    p2.font.name = "Courier New"
    p2.font.size = Pt(8)
    p2.font.color.rgb = RGBColor(16, 185, 129)

def main():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    BG_DARK = RGBColor(11, 11, 15)
    CARD_BG = RGBColor(22, 22, 28)
    TEXT_LIGHT = RGBColor(248, 250, 252)
    TEXT_MUTED = RGBColor(148, 163, 184)
    ACCENT_GREEN = RGBColor(16, 185, 129)
    ACCENT_BLUE = RGBColor(59, 130, 246)
    ACCENT_RED = RGBColor(239, 68, 68)
    
    blank_layout = prs.slide_layouts[6] # completely blank layout
`;

  deck.slides.forEach((slide, idx) => {
    const slNum = idx + 1;
    const titleVal = (slide.title || "").replace(/"/g, '\\"');
    const subtitleVal = (slide.subtitle || "").replace(/"/g, '\\"');
    const speechVal = (slide.speechScript || "").replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const type = slide.type || "";

    py += `\n    # ==========================================
    # СЛАЙД ${slNum}: ${titleVal}
    # ==========================================
    slide_${slNum} = prs.slides.add_slide(blank_layout)
    apply_background(slide_${slNum}, BG_DARK)
`;

    if (idx === 0 || type === "title") {
      // Title slide design
      py += `    # Title layout
    tf_title = create_textbox(slide_${slNum}, Inches(1.5), Inches(2.2), Inches(10.33), Inches(2.5))
    p_main = tf_title.paragraphs[0]
    p_main.alignment = PP_ALIGN.CENTER
    p_main.text = "${titleVal.toUpperCase()}"
    p_main.font.name = "Arial"
    p_main.font.size = Pt(36)
    p_main.font.bold = True
    p_main.font.color.rgb = TEXT_LIGHT
    
    p_sub = tf_title.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "${subtitleVal}"
    p_sub.font.name = "Arial"
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.space_before = Pt(20)
    
    # 3-column content items at the bottom
`;
      const contents = slide.content || [];
      contents.slice(0, 3).forEach((item: string, i: number) => {
        const itemVal = item.replace(/"/g, '\\"');
        py += `    # Column ${i + 1}
    card_${slNum}_${i} = slide_${slNum}.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(${1.5 + i * 3.6}), Inches(5.2), Inches(3.2), Inches(1.2))
    card_${slNum}_${i}.fill.solid()
    card_${slNum}_${i}.fill.fore_color.rgb = CARD_BG
    card_${slNum}_${i}.line.color.rgb = RGBColor(60, 60, 70)
    
    tf_c = card_${slNum}_${i}.text_frame
    tf_c.word_wrap = True
    p_label = tf_c.paragraphs[0]
    p_label.text = "РАЗДЕЛ 0${i + 1}"
    p_label.font.name = "Courier New"
    p_label.font.size = Pt(9)
    p_label.font.bold = True
    p_label.font.color.rgb = ACCENT_GREEN
    
    p_val = tf_c.add_paragraph()
    p_val.text = "${itemVal}"
    p_val.font.name = "Arial"
    p_val.font.size = Pt(11)
    p_val.font.color.rgb = TEXT_LIGHT
    p_val.space_before = Pt(8)
`;
      });
    } else if (idx === 1 || type === "problem") {
      // Problem Slide
      py += `    add_header_badge(slide_${slNum}, "${deck.title.replace(/"/g, '\\"')}", "Слайд ${slNum} из ${deck.slides.length}")
    add_footer(slide_${slNum}, "${deck.title.replace(/"/g, '\\"')}")
    
    # Title
    tf_h = create_textbox(slide_${slNum}, Inches(0.5), Inches(1.1), Inches(12.33), Inches(0.8))
    p_th = tf_h.paragraphs[0]
    p_th.text = "${titleVal.toUpperCase()}"
    p_th.font.name = "Arial"
    p_th.font.size = Pt(22)
    p_th.font.bold = True
    p_th.font.color.rgb = TEXT_LIGHT
    
    # Hero Problem Left Card
    card_p = slide_${slNum}.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(2.2), Inches(5.5), Inches(4.2))
    card_p.fill.solid()
    card_p.fill.fore_color.rgb = RGBColor(45, 20, 20)
    card_p.line.color.rgb = ACCENT_RED
    
    tf_cp = card_p.text_frame
    tf_cp.word_wrap = True
    tf_cp.margin_left = Inches(0.3)
    tf_cp.margin_right = Inches(0.3)
    tf_cp.margin_top = Inches(0.3)
    tf_cp.margin_bottom = Inches(0.3)
    
    p_fact = tf_cp.paragraphs[0]
    p_fact.text = "КРИТИЧЕСКИЙ ФАКТОР"
    p_fact.font.name = "Courier New"
    p_fact.font.size = Pt(10)
    p_fact.font.bold = True
    p_fact.font.color.rgb = ACCENT_RED
    
    p_desc = tf_cp.add_paragraph()
    p_desc.text = "${(slide.content?.[0] || 'Проблема рынка').replace(/"/g, '\\"')}"
    p_desc.font.name = "Arial"
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = RGBColor(255, 200, 200)
    p_desc.space_before = Pt(14)
    
    # Right-side custom bullets list
`;
      const bullets = (slide.content || []).slice(1);
      bullets.forEach((bullet: string, i: number) => {
        const bulletVal = bullet.replace(/"/g, '\\"');
        py += `    card_b${i} = slide_${slNum}.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.33), Inches(${2.2 + i * 1.3}), Inches(6.5), Inches(1.1))
    card_b${i}.fill.solid()
    card_b${i}.fill.fore_color.rgb = CARD_BG
    card_b${i}.line.color.rgb = RGBColor(60, 60, 70)
    
    tf_b${i} = card_b${i}.text_frame
    tf_b${i}.word_wrap = True
    tf_b${i}.margin_left = Inches(0.2)
    tf_b${i}.margin_right = Inches(0.2)
    p_b${i} = tf_b${i}.paragraphs[0]
    p_b${i}.text = "• ${bulletVal}"
    p_b${i}.font.name = "Arial"
    p_b${i}.font.size = Pt(11)
    p_b${i}.font.color.rgb = TEXT_LIGHT
`;
      });
    } else {
      // Generic Template Slide (Market/Solution/etc.)
      py += `    add_header_badge(slide_${slNum}, "${deck.title.replace(/"/g, '\\"')}", "Слайд ${slNum} из ${deck.slides.length}")
    add_footer(slide_${slNum}, "${deck.title.replace(/"/g, '\\"')}")
    
    # Title
    tf_h = create_textbox(slide_${slNum}, Inches(0.5), Inches(1.1), Inches(12.33), Inches(0.8))
    p_th = tf_h.paragraphs[0]
    p_th.text = "${titleVal.toUpperCase()}"
    p_th.font.name = "Arial"
    p_th.font.size = Pt(22)
    p_th.font.bold = True
    p_th.font.color.rgb = TEXT_LIGHT
    
    # Bento dynamic block layouts
`;
      const contents = slide.content || [];
      contents.forEach((item: string, i: number) => {
        const itemVal = item.replace(/"/g, '\\"');
        const count = contents.length;
        const width = count <= 3 ? 3.8 : 5.8;
        const height = count <= 3 ? 4.2 : 1.9;
        const col = i % (count <= 3 ? 3 : 2);
        const row = Math.floor(i / (count <= 3 ? 3 : 2));
        
        const cardX = count <= 3 ? 0.5 + col * 4.25 : 0.5 + col * 6.33;
        const cardY = count <= 3 ? 2.2 : 2.2 + row * 2.2;
        
        py += `    card_${slNum}_b${i} = slide_${slNum}.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(${cardX}), Inches(${cardY}), Inches(${width}), Inches(${height}))
    card_${slNum}_b${i}.fill.solid()
    card_${slNum}_b${i}.fill.fore_color.rgb = CARD_BG
    card_${slNum}_b${i}.line.color.rgb = RGBColor(60, 60, 70)
    
    tf_cb${i} = card_${slNum}_b${i}.text_frame
    tf_cb${i}.word_wrap = True
    tf_cb${i}.margin_left = Inches(0.2)
    tf_cb${i}.margin_right = Inches(0.2)
    tf_cb${i}.margin_top = Inches(0.2)
    
    p_bitem${i} = tf_cb${i}.paragraphs[0]
    p_bitem${i}.text = "${itemVal}"
    p_bitem${i}.font.name = "Arial"
    p_bitem${i}.font.size = Pt(11)
    p_bitem${i}.font.color.rgb = TEXT_LIGHT
`;
      });
    }

    if (speechVal) {
      py += `    # Speaker Notes (Доклад спикера)
    notes_${slNum} = slide_${slNum}.notes_slide
    notes_${slNum}.notes_text_frame.text = "${speechVal}"
`;
    }
  });

  py += `
    prs.save("presentation.pptx")
    print("✓ Презентация успешно создана и сохранена в файл presentation.pptx!")

if __name__ == "__main__":
    main()
`;

  return py;
}
