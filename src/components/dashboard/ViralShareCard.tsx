import { useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Check, Share2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ViralObject {
  headline?: string;
  stamp?: string;
  shareable_quote?: string;
  score_visual?: number;
  roast_level?: "mild" | "spicy" | string;
}

interface AnalysisData {
  interest_level?: number | string;
  intent?: string;
  tone?: string;
  category?: string;
  emotional_risk?: "low" | "medium" | "high" | string;
  recommended_timing?: string;
  // Support both keys for backward compatibility
  viral_card?: ViralObject;
  viral_summary?: ViralObject;
}

interface ViralShareCardProps {
  analysis: AnalysisData;
}

// Normalized viral object
interface NormalizedViral {
  headline: string | null;
  stamp: string;
  shareable_quote: string;
  score_visual: number;
  roast_level: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseInterestLevel(value: number | string | undefined): number {
  if (typeof value === "number") return Math.min(100, Math.max(0, value));
  if (typeof value === "string") {
    const num = parseInt(value.replace("%", ""), 10);
    return isNaN(num) ? 50 : Math.min(100, Math.max(0, num));
  }
  return 50;
}

function computeStamp(score: number): string {
  if (score < 40) return "RED FLAG";
  if (score < 70) return "MIXED SIGNAL";
  return "GREEN SIGNAL";
}

// Inline colors for html2canvas compatibility
function getStrokeColor(score: number): string {
  if (score < 40) return "#ef4444"; // red-500
  if (score < 70) return "#f59e0b"; // amber-500
  return "#10b981"; // emerald-500
}

function getTextColor(score: number): string {
  if (score < 40) return "#f87171"; // red-400
  if (score < 70) return "#fbbf24"; // amber-400
  return "#34d399"; // emerald-400
}

function getStampInlineStyle(stamp: string): React.CSSProperties {
  const s = stamp.toUpperCase();
  if (s.includes("RED")) return {
    backgroundColor: "rgba(239,68,68,0.2)",
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.5)"
  };
  if (s.includes("MIXED")) return {
    backgroundColor: "rgba(245,158,11,0.2)",
    color: "#fbbf24",
    borderColor: "rgba(245,158,11,0.5)"
  };
  return {
    backgroundColor: "rgba(16,185,129,0.2)",
    color: "#34d399",
    borderColor: "rgba(16,185,129,0.5)"
  };
}

function getScoreColor(score: number): { ring: string; text: string; glow: string; bg: string } {
  if (score < 40) return { 
    ring: "stroke-red-500", 
    text: "text-red-400", 
    glow: "drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]",
    bg: "bg-red-500"
  };
  if (score < 70) return { 
    ring: "stroke-amber-500", 
    text: "text-amber-400", 
    glow: "drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]",
    bg: "bg-amber-500"
  };
  return { 
    ring: "stroke-emerald-500", 
    text: "text-emerald-400", 
    glow: "drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]",
    bg: "bg-emerald-500"
  };
}

function getStampStyle(stamp: string): string {
  const s = stamp.toUpperCase();
  if (s.includes("RED")) return "bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/30";
  if (s.includes("MIXED")) return "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-500/30";
  return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/30";
}

function generateFallbackQuote(score: number): string {
  if (score >= 70) return "Strong interest. Keep it smooth.";
  if (score >= 40) return "Mixed signal. Don't overinvest.";
  return "Red flag energy. Step back.";
}

function cleanVerdict(text: string): string {
  // Strip trailing '?' and clean up
  return text.replace(/\?+$/, "").trim();
}

function formatRisk(risk: string | undefined): string {
  if (!risk) return "Medium";
  const r = risk.toLowerCase();
  if (r === "high") return "High";
  if (r === "low") return "Low";
  return "Medium";
}

function formatTiming(timing: string | undefined): string {
  if (!timing) return "Wait";
  const t = timing.toLowerCase();
  if (t.includes("direct") || t.includes("now") || t.includes("immediate")) return "Now";
  if (t.includes("later") || t.includes("wait") || t.includes("hour")) return "Later";
  if (t.includes("never") || t.includes("don't") || t.includes("avoid")) return "Skip";
  return timing.length > 10 ? timing.substring(0, 10) + "…" : timing;
}

function formatTone(tone: string | undefined): string {
  if (!tone) return "Neutral";
  return tone.charAt(0).toUpperCase() + tone.slice(1).toLowerCase();
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZATION: viral_card OR viral_summary -> normalized viral
// ═══════════════════════════════════════════════════════════════════════════

function normalizeViral(analysis: AnalysisData): NormalizedViral {
  // ALWAYS use interest_level from analysis as the score
  const interestLevel = parseInterestLevel(analysis.interest_level);
  
  // Priority: viral_card > viral_summary > fallback
  const viralSource = analysis.viral_card || analysis.viral_summary || null;
  
  // Score: ALWAYS use interest_level from analysis (not score_visual)
  const score = interestLevel;
  
  // Stamp: use exactly if present, else compute from score
  const stamp = viralSource?.stamp || computeStamp(score);
  
  // Quote: use shareable_quote if present, else generate fallback
  const quote = viralSource?.shareable_quote 
    ? cleanVerdict(viralSource.shareable_quote)
    : generateFallbackQuote(score);
  
  // Headline: optional, use if present
  const headline = viralSource?.headline || null;
  
  // Roast level
  const roastLevel = viralSource?.roast_level || "mild";
  
  return {
    headline,
    stamp,
    shareable_quote: quote,
    score_visual: score,
    roast_level: roastLevel,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ViralShareCard = ({ analysis }: ViralShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [exportFormat, setExportFormat] = useState<"story" | "square">("story");
  const { toast } = useToast();

  // Normalize viral data from analysis_json
  const viral = normalizeViral(analysis);
  const scoreColors = getScoreColor(viral.score_visual);
  const stampStyle = getStampStyle(viral.stamp);

  // Caption: "{headline or stamp} • Interest: {score}% — hintaro.com"
  const caption = `${viral.headline || viral.stamp} • Interest: ${viral.score_visual}% — hintaro.com`;

  const handleCopyCaption = useCallback(() => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    toast({ title: "Copied!", description: "Caption ready to paste" });
    setTimeout(() => setCopiedCaption(false), 2000);
  }, [caption, toast]);

  const handleExport = useCallback(async (format: "story" | "square") => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      
      // Capture at 3x scale for high resolution
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        logging: false,
        scale: 3,
        backgroundColor: "#0a0a0f",
        removeContainer: true,
      } as any);

      // For square format, use the captured canvas as-is (it's already square-ish)
      // For story format, add padding top/bottom to make it 9:16
      if (format === "square") {
        // Square: just use captured canvas directly
        const link = document.createElement("a");
        link.download = `hintaro-square-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      } else {
        // Story: embed canvas in 9:16 ratio with padding
        const aspectRatio = 9 / 16;
        const targetWidth = canvas.width;
        const targetHeight = Math.round(targetWidth / aspectRatio);
        
        const targetCanvas = document.createElement("canvas");
        targetCanvas.width = targetWidth;
        targetCanvas.height = targetHeight;
        const ctx = targetCanvas.getContext("2d");

        if (ctx) {
          // Fill background
          ctx.fillStyle = "#0a0a0f";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          
          // Center the original canvas vertically
          const y = (targetHeight - canvas.height) / 2;
          ctx.drawImage(canvas, 0, y);
        }

        const link = document.createElement("a");
        link.download = `hintaro-story-${Date.now()}.png`;
        link.href = targetCanvas.toDataURL("image/png", 1.0);
        link.click();
      }

      toast({ title: "Downloaded!", description: `${format === "story" ? "Story" : "Square"} saved` });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Export failed", description: "Try again", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  // Generate image and share via Web Share API or fallback
  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      
      // Capture at 3x scale for high resolution
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        logging: false,
        scale: 3,
        backgroundColor: "#0a0a0f",
        removeContainer: true,
      } as any);

      let finalCanvas = canvas;
      
      // For story format, add padding top/bottom
      if (exportFormat === "story") {
        const aspectRatio = 9 / 16;
        const targetWidth = canvas.width;
        const targetHeight = Math.round(targetWidth / aspectRatio);
        
        const targetCanvas = document.createElement("canvas");
        targetCanvas.width = targetWidth;
        targetCanvas.height = targetHeight;
        const ctx = targetCanvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#0a0a0f";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          const y = (targetHeight - canvas.height) / 2;
          ctx.drawImage(canvas, 0, y);
        }
        finalCanvas = targetCanvas;
      }

      // Convert to blob for sharing
      const blob = await new Promise<Blob>((resolve) => {
        finalCanvas.toBlob((b) => resolve(b!), "image/png", 1.0);
      });

      const file = new File([blob], `hintaro-${exportFormat}.png`, { type: "image/png" });

      // 1. Try Web Share API with files (best UX on mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Hintaro Analysis",
          text: caption,
          files: [file],
        });
        toast({ title: "Shared!", description: "Card shared with image and caption." });
      } else if (navigator.share) {
        // 2. Fallback: Web Share API without files (text + url only)
        await navigator.share({
          title: "My Hintaro Analysis",
          text: caption + " https://hintaro.com",
        });
        toast({ title: "Link shared!", description: "Image cannot be attached automatically. Download image below and share manually." });
        // Prompt user to download image after sharing link
        setTimeout(() => {
          const link = document.createElement("a");
          link.download = `hintaro-${exportFormat}-${Date.now()}.png`;
          link.href = finalCanvas.toDataURL("image/png", 1.0);
          link.click();
        }, 500);
      } else {
        // 3. Desktop fallback: copy caption and download image
        await navigator.clipboard.writeText(caption);
        const link = document.createElement("a");
        link.download = `hintaro-${exportFormat}-${Date.now()}.png`;
        link.href = finalCanvas.toDataURL("image/png", 1.0);
        link.click();
        toast({ 
          title: "Ready to share!", 
          description: "Image downloaded and caption copied. Paste caption and upload image in your favorite app." 
        });
      }
    } catch (error: any) {
      // User cancelled share or error
      if (error?.name !== "AbortError") {
        console.error("Share error:", error);
        toast({ title: "Sharing failed", description: "Try downloading instead", variant: "destructive" });
      }
    } finally {
      setIsExporting(false);
    }
  }, [cardRef, exportFormat, caption, toast]);

  // SVG Arc for score - smaller for compact preview
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (viral.score_visual / 100) * circumference;

  // Inline font styles for export fidelity
  const cardFontFamily = {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontWeight: 500,
    letterSpacing: '-0.01em',
  };
  const headingFontFamily = {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontWeight: 700,
    letterSpacing: '-0.02em',
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* COMPACT PREVIEW CARD */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-white/5 p-6"
        style={{ backgroundColor: "#0a0a0f", ...cardFontFamily }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          
          {/* TOP: Mini branding with logo */}
          <div className="flex items-center gap-1.5" style={cardFontFamily}>
            <img
              src="/img/apple-touch-icon.png"
              alt="Hintaro logo"
              className="w-5 h-5"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <span 
              className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: "rgba(255,255,255,0.4)", ...cardFontFamily, fontWeight: 600, fontSize: 10 }}
            >
              Hintaro
            </span>
          </div>

          {/* HERO SCORE - Compact */}
          <div className="relative flex items-center justify-center" style={{ width: "112px", height: "112px" }}>
            <svg 
              width="112" 
              height="112" 
              viewBox="0 0 120 120"
              style={{ display: 'block', transform: "rotate(-90deg)" }}
            >
              {/* Background track */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              {/* Progress arc - use inline stroke color for export */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                stroke={getStrokeColor(viral.score_visual)}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            <div 
              className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none"
              style={{ zIndex: 2 }}
            >
              <span 
                className="text-[8px] uppercase tracking-[0.2em] mb-0.5"
                style={{ color: "rgba(255,255,255,0.35)", ...cardFontFamily, fontWeight: 700, fontSize: 8, lineHeight: 1 }}
              >
                Interest
              </span>
              <span 
                className="text-3xl font-black tracking-tight"
                style={{ color: getTextColor(viral.score_visual), ...headingFontFamily, fontWeight: 900, fontSize: 36, lineHeight: 1 }}
              >
                {viral.score_visual}%
              </span>
            </div>
          </div>

          {/* STAMP BADGE */}
          <div 
            className="inline-flex items-center px-3.5 py-1.5 rounded-full border font-bold text-xs tracking-wider"
            style={{ ...getStampInlineStyle(viral.stamp), ...cardFontFamily, fontWeight: 700, fontSize: 13 }}
          >
            {viral.stamp}
          </div>

          {/* HEADLINE (optional) */}
          {viral.headline && (
            <p 
              className="text-xs italic max-w-[240px]"
              style={{ color: "rgba(255,255,255,0.3)", ...cardFontFamily, fontStyle: 'italic', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              "{viral.headline}"
            </p>
          )}

          {/* VERDICT */}
          <p 
            className="text-base font-semibold max-w-[280px] leading-snug"
            style={{ color: "rgba(255,255,255,0.95)", ...cardFontFamily, fontWeight: 600, fontSize: 16, whiteSpace: 'pre-line' }}
          >
            {viral.shareable_quote}
          </p>

          {/* SIGNAL STRIP */}
          <div 
            className="flex items-center gap-2 text-[11px]"
            style={{ color: "rgba(255,255,255,0.4)", ...cardFontFamily, fontSize: 11 }}
          >
            <span className="flex items-center gap-1">
              <span>🎭</span>
              <span>{formatTone(analysis.tone)}</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
            <span className="flex items-center gap-1">
              <span>⚠️</span>
              <span>{formatRisk(analysis.emotional_risk)}</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>{formatTiming(analysis.recommended_timing)}</span>
            </span>
          </div>

          {/* BOTTOM: URL */}
          <div 
            className="text-xs font-medium tracking-wider pt-1"
            style={{ color: "rgba(255,255,255,0.2)", ...cardFontFamily, fontWeight: 500, fontSize: 13 }}
          >
            hintaro.com
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FORMAT SELECTOR */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
        <button
          onClick={() => setExportFormat("story")}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
            exportFormat === "story" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Story 9:16
        </button>
        <button
          onClick={() => setExportFormat("square")}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
            exportFormat === "square" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Square 1:1
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ACTIONS */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleCopyCaption}
        >
          {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedCaption ? "Copied" : "Caption"}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => handleExport(exportFormat)}
          disabled={isExporting}
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? "..." : exportFormat === "story" ? "Story" : "Square"}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 border-0"
          onClick={handleShare}
          disabled={isExporting}
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>

      {/* Export format info */}
      <p className="text-[10px] text-muted-foreground/50 text-center">
        {exportFormat === "story" ? "1080×1920px" : "1080×1080px"} • Instagram · Snapchat · TikTok · WhatsApp
      </p>
    </div>
  );
};

export default ViralShareCard;
