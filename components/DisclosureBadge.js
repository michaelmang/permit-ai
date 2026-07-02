import { DISCLOSURE_LABEL } from "../lib/disclosure";
import { getBadgeBorderStyle } from "../lib/badgeBorder";

export default function DisclosureBadge({ items, className = "", testId }) {
  const border = getBadgeBorderStyle(items);
  const isGradient = border.type === "gradient";

  return (
    <div
      className={`disclosure-badge${isGradient ? " disclosure-badge--gradient" : ""}${className ? ` ${className}` : ""}`}
      style={
        isGradient
          ? { "--badge-border-gradient": border.cssGradient }
          : { "--badge-border-color": border.color }
      }
      data-testid={testId}
    >
      <div className="disclosure-badge-header">
        <span className="disclosure-badge-label">{DISCLOSURE_LABEL}</span>
      </div>
      <ul className="disclosure-badge-items">
        {items.map((item) => (
          <li key={item.key} className="disclosure-badge-item">
            <span className="disclosure-badge-key">{item.key}</span>
            <span className="disclosure-badge-desc">{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
