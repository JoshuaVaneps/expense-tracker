export const CATEGORIES = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

// The hue for each category lives in CSS (`--cat-*` in index.css) rather than
// here, because it has to change between light and dark mode and a JS array
// cannot answer a media query. Everything that needs a category color — the
// chart bars, the dots in the list — carries this class and lets CSS paint it.
// Adding a category means adding it to CATEGORIES above *and* adding the
// matching `--cat-<name>` pair plus a `.cat-<name>` rule in index.css.
export const categoryClass = (category) => `cat-${category}`;
