// src/components/Card.tsx
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  badge,
  icon,
  children,
  className = "",
  noPadding = false,
  ...rest
}) => {
  return (
    <div
      className={`bg-surface rounded-xl border border-border-soft shadow-subtle transition-all duration-200 ${
        noPadding ? "" : "p-5 sm:p-6"
      } ${className}`}
      {...rest}
    >
      {(title || subtitle || action || badge || icon) && (
        <div
          className={`flex items-start justify-between gap-3 mb-4 pb-3 border-b border-border-soft/70 ${
            noPadding ? "p-5 pb-3 sm:p-6 sm:pb-3 mb-0" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-teal-light text-teal-japan flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-japan/15">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {typeof title === "string" ? (
                  <h3 className="text-navy-deep text-base font-bold tracking-tight font-display">
                    {title}
                  </h3>
                ) : (
                  title
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-muted mt-0.5 font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
