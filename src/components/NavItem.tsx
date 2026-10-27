// src/components/NavItem.tsx
import React from "react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[#164E44] text-white font-semibold shadow-sidebar-active border border-[#68DCC0]/25"
          : "text-[#DCEFE7]/75 hover:text-white hover:bg-[#164E44]/60"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3 min-w-0">
          {/* Subtle Aurora Mint left active indicator pill */}
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#68DCC0] rounded-r-full shadow-glow-mint" />
          )}
          <span
            className={`w-4 h-4 flex items-center justify-center transition-colors ${
              isActive
                ? "text-[#68DCC0]"
                : "text-[#DCEFE7]/60 group-hover:text-[#68DCC0] transition-colors"
            }`}
          >
            {icon}
          </span>
          <span className="truncate tracking-normal">{label}</span>
        </div>
        {badge && (
          <span
            className={`text-[9.5px] px-1.5 py-0.5 rounded font-semibold border ${
              isActive
                ? "bg-[#68DCC0]/20 text-[#68DCC0] border-[#68DCC0]/30"
                : "bg-[#0B2723] text-[#DCEFE7]/70 border-[#164E44]"
            }`}
          >
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

export default NavItem;
