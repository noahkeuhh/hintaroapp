import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
} from "lucide-react";

export interface ViralCard {
  headline: string;
  stamp: "GREEN SIGNAL" | "MIXED SIGNAL" | "RED FLAG";
  shareable_quote: string;
  score_visual: number;
  roast_level: "mild" | "spicy";
}

interface ShareableScorecardProps {
  viralCard: ViralCard;
  brandName?: string;
  brandDomain?: string;
}

const STAMP_STYLES: Record<string, { bg: string; text: string; glow: string }> = {
  "GREEN SIGNAL": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  "MIXED SIGNAL": {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/30",
  },
  "RED FLAG": {
    bg: "bg-red-500/20",
    text: "text-red-400",
    glow: "shadow-red-500/30",
  },
};

const SCORE_COLORS = {
  low: { ring: "stroke-red-500", text: "text-red-400" },
  medium: { ring: "stroke-amber-500", text: "text-amber-400" },
  high: { ring: "stroke-emerald-500", text: "text-emerald-400" },
};

function getScoreColorKey(score: number): "low" | "medium" | "high" {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

export const ShareableScorecard = ({
  viralCard,
  brandName = "Hintaro",
  brandDomain = "hintaro.com",
}: ShareableScorecardProps) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"story" | "square">("story");
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const stampStyle = STAMP_STYLES[viralCard.stamp] || STAMP_STYLES["MIXED SIGNAL"];
  const scoreColorKey = getScoreColorKey(viralCard.score_visual);
  const scoreColors = SCORE_COLORS[scoreColorKey];

  // Caption template
  const caption = `${viralCard.headline} • ${viralCard.stamp} • Interest: ${viralCard.score_visual}% — ${brandDomain}`;

  const handleCopyCaption = useCallback(() => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    toast({
      title: "Caption Copied!",
      description: "Ready to paste on social media",
    });
    setTimeout(() => setCopiedCaption(false), 2000);
  }, [caption, toast]);

  const handleDownload = useCallback(async (format: "story" | "square") => {
    if (!cardRef.current) return;

    setIsExporting(true);
    setExportFormat(format);

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      // Set dimensions based on format
      const dimensions = format === "story" 
        ? { width: 1080, height: 1920 }
        : { width: 1080, height: 1080 };

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        useCORS: true,
        logging: false,
      });

      // Create a new canvas with target dimensions
      const targetCanvas = document.createElement("canvas");
      targetCanvas.width = dimensions.width;
      targetCanvas.height = dimensions.height;
      const ctx = targetCanvas.getContext("2d");

      if (ctx) {
        // Fill background
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Calculate scaling to fit content
        const scale = Math.min(
          (dimensions.width - 80) / canvas.width,
          (dimensions.height - 80) / canvas.height
        );
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const x = (dimensions.width - scaledWidth) / 2;
        const y = (dimensions.height - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      // Download
      const link = document.createElement("a");
      link.download = `hintaro-scorecard-${format}-${Date.now()}.png`;
      link.href = targetCanvas.toDataURL("image/png", 1.0);
      link.click();

      toast({
        title: "Scorecard Downloaded!",
        description: `${format === "story" ? "Story (1080x1920)" : "Square (1080x1080)"} format saved`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  // SVG Circle Progress
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (viralCard.score_visual / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Shareble Card Preview */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] border border-white/10 p-6 sm:p-8"
      >
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 opacity-60">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">
              {brandName}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight max-w-[280px]">
            {viralCard.headline}
          </h2>

          {/* Score Ring */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/10"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={scoreColors.ring}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: "stroke-dashoffset 0.5s ease-out",
                }}
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl sm:text-4xl font-bold ${scoreColors.text}`}>
                {viralCard.score_visual}%
              </span>
              <span className="text-xs text-white/40 mt-1">interest</span>
            </div>
          </div>

          {/* Stamp Badge */}
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full ${stampStyle.bg} ${stampStyle.text} font-semibold text-sm tracking-wide shadow-lg ${stampStyle.glow}`}
          >
            {viralCard.stamp}
          </div>

          {/* Shareable Quote */}
          <p className="text-white/70 text-sm sm:text-base italic max-w-[300px] leading-relaxed">
            "{viralCard.shareable_quote}"
          </p>

          {/* Roast indicator (subtle) */}
          {viralCard.roast_level === "spicy" && (
            <span className="text-xs text-orange-400/60">🌶️ spicy take</span>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 w-full">
            <span className="text-xs text-white/30 font-medium tracking-wider">
              {brandDomain}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleCopyCaption}
        >
          {copiedCaption ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Caption
            </>
          )}
        </Button>

        <div className="flex gap-2 flex-1">
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={() => handleDownload("story")}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting && exportFormat === "story" ? "..." : "Story"}
          </Button>
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={() => handleDownload("square")}
            disabled={isExporting}
          >
            <Share2 className="h-4 w-4" />
            {isExporting && exportFormat === "square" ? "..." : "Square"}
          </Button>
        </div>
      </div>

      {/* Format info */}
      <p className="text-xs text-muted-foreground text-center">
        Story: 1080×1920 • Square: 1080×1080 • Perfect for Instagram & TikTok
      </p>
    </motion.div>
  );
};
