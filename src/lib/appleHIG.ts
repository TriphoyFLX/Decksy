import type React from "react";

/** Apple Human Interface Guidelines — design tokens for deck slides */
export const APPLE_SYSTEM = {
  blue: "#007AFF",
  green: "#34C759",
  orange: "#FF9500",
  red: "#FF3B30",
  indigo: "#5856D6",
  gray: "#8E8E93",
  bgDark: "#000000",
  groupedDark: "#1C1C1E",
  secondaryGroupedDark: "#2C2C2E",
  labelDark: "#FFFFFF",
  secondaryLabelDark: "rgba(235, 235, 245, 0.6)",
  separatorDark: "rgba(84, 84, 88, 0.65)",
  bgLight: "#F2F2F7",
  groupedLight: "#FFFFFF",
  groupedLightElevated: "#FFFFFF",
  labelLight: "#000000",
  secondaryLabelLight: "rgba(60, 60, 67, 0.6)",
  separatorLight: "rgba(60, 60, 67, 0.29)",
} as const;

export const APPLE_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";

export function appleGroupedStyle(isLight: boolean, forExport?: boolean): React.CSSProperties {
  return {
    background: isLight ? APPLE_SYSTEM.groupedLight : APPLE_SYSTEM.groupedDark,
    borderRadius: forExport ? 10 : 12,
    overflow: "hidden",
    border: "none",
    boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
  };
}

export function appleSeparatorStyle(isLight: boolean): React.CSSProperties {
  return {
    height: 1,
    background: isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark,
    marginLeft: 44,
  };
}
