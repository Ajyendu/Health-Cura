import React from "react";
import "./console-layout.css";

const ConsoleLayout = ({
  title,
  subtitle,
  actions = null,
  children,
}) => {
  return (
    <div className="hc-console-bg">
      <div className="hc-console-shell">
        <section className="hc-console-content">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h3 className="mb-1">{title}</h3>
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
};

export default ConsoleLayout;
