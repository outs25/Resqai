import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return "Just now";
  const date = new Date(isoDate);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return "Just now";
  if (diffSec < 90) return "1 min ago";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
}

export function generateReportId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Remove easily confused chars
  let code = "RQ-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getSeverityBadgeColor(severity: string): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return {
        bg: "bg-status-critical/15",
        text: "text-red-400",
        border: "border-status-critical/40",
        glow: "shadow-[0_0_12px_rgba(217,56,41,0.5)]",
      };
    case "HIGH":
      return {
        bg: "bg-status-high/15",
        text: "text-amber-400",
        border: "border-status-high/40",
        glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]",
      };
    case "MEDIUM":
      return {
        bg: "bg-status-medium/15",
        text: "text-yellow-400",
        border: "border-status-medium/40",
        glow: "shadow-[0_0_8px_rgba(234,179,8,0.3)]",
      };
    default:
      return {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30",
        glow: "shadow-[0_0_8px_rgba(59,130,246,0.3)]",
      };
  }
}

export function getStatusBadgeColor(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case "REPORTED":
    case "ANALYZING":
      return { bg: "bg-amber-500/20", text: "text-amber-300" };
    case "ACTIVE":
    case "DISPATCHED":
      return { bg: "bg-blue-500/20", text: "text-blue-300" };
    case "RESPONDERS_EN_ROUTE":
      return { bg: "bg-purple-500/20", text: "text-purple-300" };
    case "ON_SCENE":
      return { bg: "bg-emerald-500/20", text: "text-emerald-300" };
    case "RESOLVED":
    case "CLOSED":
      return { bg: "bg-zinc-700/40", text: "text-zinc-400" };
    default:
      return { bg: "bg-zinc-800", text: "text-zinc-300" };
  }
}
