import { getScopeBorderColor } from "./scopes";

const DEFAULT_BORDER_COLOR = "#6b7280";

function colorsFromItems(items) {
  return items.map((item) => item.borderColor ?? getScopeBorderColor(item.key));
}

function cssGradient(colors) {
  return `linear-gradient(135deg, ${colors.join(", ")})`;
}

function svgGradientStops(colors) {
  if (colors.length === 1) {
    return [
      { offset: "0%", color: colors[0] },
      { offset: "100%", color: colors[0] },
    ];
  }

  return colors.map((color, index) => ({
    offset: `${(index / (colors.length - 1)) * 100}%`,
    color,
  }));
}

export function getBadgeBorderStyle(items) {
  const colors = colorsFromItems(items);

  if (colors.length === 0) {
    return {
      type: "solid",
      color: DEFAULT_BORDER_COLOR,
      colors: [DEFAULT_BORDER_COLOR],
      cssGradient: cssGradient([DEFAULT_BORDER_COLOR]),
      svgGradientStops: svgGradientStops([DEFAULT_BORDER_COLOR]),
    };
  }

  if (colors.length === 1) {
    return {
      type: "solid",
      color: colors[0],
      colors,
      cssGradient: cssGradient(colors),
      svgGradientStops: svgGradientStops(colors),
    };
  }

  return {
    type: "gradient",
    colors,
    cssGradient: cssGradient(colors),
    svgGradientStops: svgGradientStops(colors),
  };
}
