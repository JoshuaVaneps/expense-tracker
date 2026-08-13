export const CATEGORIES = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

// One validated hue per category, indexed to match CATEGORIES so a category
// keeps its color everywhere it appears — the chart bars and the list's
// category dots. Adding a category means adding a hue in the same position.
export const CATEGORY_COLORS = [
  "#2a78d6", // food
  "#eb6834", // housing
  "#1baf7a", // utilities
  "#eda100", // transport
  "#e87ba4", // entertainment
  "#008300", // salary
  "#4a3aa7", // other
];

const FALLBACK_COLOR = "#5c6579";

export const colorForCategory = (category) =>
  CATEGORY_COLORS[CATEGORIES.indexOf(category)] || FALLBACK_COLOR;
