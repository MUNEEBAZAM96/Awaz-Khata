/**
 * Awaz Khata brand palette.
 * Deep emerald + warm cream + gold, inspired by classic ledger books (bahi khata).
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1C2A24',
    tint: '#0E5F49',

    // Core surfaces
    background: '#F7F3EA',
    foreground: '#1C2A24',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#1C2A24',

    // Primary action color (mic button, links, active states)
    primary: '#0E5F49',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E9E2D2',
    secondaryForeground: '#33413A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EDE7DA',
    mutedForeground: '#6E7B72',

    // Accent highlights (gold)
    accent: '#C9A227',
    accentForeground: '#1C2A24',

    // Destructive / money owed
    destructive: '#C03A2B',
    destructiveForeground: '#FFFFFF',

    // Settled / payments
    success: '#1F7A4D',

    // Listening state
    recording: '#C03A2B',

    // Borders and input outlines
    border: '#DCD3BF',
    input: '#DCD3BF',
  },

  // Border radius (in px)
  radius: 16,
};

export default colors;
