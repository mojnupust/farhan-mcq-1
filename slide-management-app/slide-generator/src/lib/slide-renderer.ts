import { Question } from "@workspace/api-client-react";

export interface SlideSettings {
  bgColor: string;
  questionTextColor: string;
  optionTextColor: string;
  correctColor: string;
  questionTextSize: number;
  slideWidth: number;
  questionsPerSlide: number;
  showExplanation: boolean;
  mode: "multi" | "single";
}

export const defaultSettings: SlideSettings = {
  bgColor: "#ffffff",
  questionTextColor: "#1e293b",
  optionTextColor: "#334155",
  correctColor: "#22c55e",
  questionTextSize: 16,
  slideWidth: 1080,
  questionsPerSlide: 5,
  showExplanation: false,
  mode: "multi",
};

export async function renderSlide(
  questions: Question[],
  settings: SlideSettings,
  slideIndex: number,
  totalSlides: number
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context");

  const width = settings.slideWidth;
  const padding = 60;
  const modeSingle = settings.mode === "single";
  
  const qFontSize = modeSingle ? 32 : settings.questionTextSize;
  const qFont = `bold ${qFontSize}px 'Outfit', 'Noto Sans Bengali', 'Mukti', sans-serif`;
  const optFontSize = modeSingle ? 24 : settings.questionTextSize - 2;
  const optFont = `${optFontSize}px 'Inter', 'Noto Sans Bengali', 'Mukti', sans-serif`;
  const expFontSize = optFontSize - 2;
  const expFont = `italic ${expFontSize}px 'Inter', 'Noto Sans Bengali', 'Mukti', sans-serif`;

  // Helper for text wrapping
  const measureTextHeight = (text: string, font: string, maxWidth: number, lineHeight: number) => {
    ctx.font = font;
    const words = text.split(" ");
    let line = "";
    let height = lineHeight;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        line = words[n] + " ";
        height += lineHeight;
      } else {
        line = testLine;
      }
    }
    return height;
  };

  const drawWrappedText = (text: string, x: number, y: number, font: string, maxWidth: number, lineHeight: number, color: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  const contentMaxWidth = width - (padding * 2);
  const qLineHeight = qFontSize * 1.4;
  const optLineHeight = optFontSize * 1.4;
  const expLineHeight = expFontSize * 1.4;

  // First pass: Calculate required height
  let currentHeight = padding + 40; // Top padding + title space
  
  questions.forEach((q, i) => {
    const qNum = modeSingle ? slideIndex + 1 : (slideIndex * settings.questionsPerSlide) + i + 1;
    const qText = `${qNum}. ${q.questionText}`;
    
    currentHeight += measureTextHeight(qText, qFont, contentMaxWidth, qLineHeight);
    currentHeight += 10; // gap after question
    
    const options = [
      { label: 'A', text: q.optionA, key: 'optionA' },
      { label: 'B', text: q.optionB, key: 'optionB' },
      { label: 'C', text: q.optionC, key: 'optionC' },
      { label: 'D', text: q.optionD, key: 'optionD' }
    ];

    options.forEach(opt => {
      const optText = `${opt.label}) ${opt.text}`;
      currentHeight += measureTextHeight(optText, optFont, contentMaxWidth - 40, optLineHeight);
      currentHeight += 8; // gap after option
    });
    
    if (settings.showExplanation && q.explanation) {
      currentHeight += 10;
      const expText = `Explanation: ${q.explanation}`;
      currentHeight += measureTextHeight(expText, expFont, contentMaxWidth - 20, expLineHeight);
      currentHeight += 20; // box padding
    }

    currentHeight += 40; // gap between questions
  });

  currentHeight += 60; // footer space
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = Math.max(width * (9/16), currentHeight); // Minimum 16:9 aspect ratio

  // Draw background
  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw borders
  ctx.strokeStyle = settings.questionTextColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

  // Corner decorations
  const drawCorner = (x: number, y: number) => {
    ctx.fillStyle = settings.questionTextColor;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCorner(26, 26);
  drawCorner(canvas.width - 26, 26);
  drawCorner(26, canvas.height - 26);
  drawCorner(canvas.width - 26, canvas.height - 26);

  // Draw content
  let drawY = padding + 20;

  if (modeSingle) {
    drawY += 40; // Extra top padding for single mode
  }

  questions.forEach((q, i) => {
    const qNum = modeSingle ? slideIndex + 1 : (slideIndex * settings.questionsPerSlide) + i + 1;
    const qText = `${qNum}. ${q.questionText}`;
    
    drawY = drawWrappedText(qText, padding, drawY, qFont, contentMaxWidth, qLineHeight, settings.questionTextColor);
    drawY += 10;
    
    const options = [
      { label: 'A', text: q.optionA, key: 'optionA' },
      { label: 'B', text: q.optionB, key: 'optionB' },
      { label: 'C', text: q.optionC, key: 'optionC' },
      { label: 'D', text: q.optionD, key: 'optionD' }
    ];

    options.forEach(opt => {
      const isCorrect = q.correctAnswer === opt.key;
      const optText = `${opt.label}) ${opt.text}`;
      
      const optHeight = measureTextHeight(optText, optFont, contentMaxWidth - 40, optLineHeight);
      
      // Highlight background for correct answer
      if (isCorrect) {
        ctx.fillStyle = settings.correctColor + '33'; // 20% opacity hex
        ctx.beginPath();
        ctx.roundRect(padding + 10, drawY - optLineHeight + 6, contentMaxWidth - 20, optHeight + 8, 8);
        ctx.fill();
      }

      ctx.textBaseline = "bottom";
      drawWrappedText(optText, padding + 20, drawY, optFont, contentMaxWidth - 40, optLineHeight, settings.optionTextColor);
      drawY += optHeight + 4;
    });

    if (settings.showExplanation && q.explanation) {
      drawY += 10;
      const expText = `Explanation: ${q.explanation}`;
      const expHeight = measureTextHeight(expText, expFont, contentMaxWidth - 40, expLineHeight);
      
      ctx.fillStyle = settings.optionTextColor + '11';
      ctx.beginPath();
      ctx.roundRect(padding, drawY - expLineHeight + 6, contentMaxWidth, expHeight + 16, 8);
      ctx.fill();

      drawWrappedText(expText, padding + 15, drawY + 4, expFont, contentMaxWidth - 30, expLineHeight, settings.optionTextColor);
      drawY += expHeight + 30;
    } else {
      drawY += 30;
    }
  });

  // Footer
  ctx.font = `14px 'Inter', sans-serif`;
  ctx.fillStyle = settings.optionTextColor;
  ctx.textAlign = "right";
  ctx.fillText(`Slide ${slideIndex + 1} of ${totalSlides}`, canvas.width - padding, canvas.height - 30);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}
