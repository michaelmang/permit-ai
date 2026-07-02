import { DISCLOSURE_LABEL } from "../lib/disclosure";

export default function DisclosureBadge({ items, rid, className = "", testId }) {
  return (
    <div className={`disclosure-badge${className ? ` ${className}` : ""}`} data-testid={testId}>
      <div className="disclosure-badge-header">
        <span className="disclosure-badge-label">{DISCLOSURE_LABEL}</span>
        {rid ? <span className="disclosure-badge-rid">#{rid}</span> : null}
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
