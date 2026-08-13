// Brazos Transit District uses green as its brand color (see the BTD logo
// and the green "Fares, Tickets, & Passes" header on their printed map) —
// kept separate from the shared AggieSpirit maroon/red tint so BTD's own
// screens read as a distinct mode rather than a re-skinned AggieSpirit.
export const BTD_TINT = {
  light: '#1B7F3C',
  dark: '#3DBA6D',
};

// BTD_TINT.dark is tuned as a text/icon color (great contrast on the dark
// background). Used as a solid button fill under white labels it only hits
// ~2.5:1, well under WCAG AA - this darker green is what BTD_TINT.light
// already uses, which keeps ~5:1 with white text in either scheme.
export const BTD_BUTTON_TINT = {
  light: '#1B7F3C',
  dark: '#1B7F3C',
};
