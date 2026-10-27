// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Radio,
  Pill,
  ShieldAlert,
} from "lucide-react";

interface LoginPageProps {
  onLogin: (role: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [patientName] = useState("Alex Morgan");
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin("patient");
    navigate("/patient");
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans text-charcoal">
      {/* Top Header bar */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto py-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/guthub-logo.jpg"
            alt="GutHub Logo"
            className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 border border-[#68DCC0]/40 shadow-glow-mint"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-midnight font-display leading-none">
              Gut<span className="text-emerald">Hub</span>
            </h1>
            <p className="text-[9px] font-semibold tracking-wider text-slate-grey uppercase mt-0.5">
              DIGESTIVE HEALTH INTELLIGENCE
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sage text-midnight border border-emerald/20">
          MEDAITHON '26
        </span>
      </header>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-surface rounded-2xl border border-border-soft shadow-elevated p-7 sm:p-9 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <img
                src="/guthub-logo.jpg"
                alt="GutHub Official Logo"
                className="w-20 h-20 rounded-2xl object-contain bg-white p-2 border border-border-soft shadow-subtle hover:scale-105 transition-transform"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-midnight text-[11px] font-bold border border-emerald/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-subtle-pulse" />
              Wearable Sensor-Based Transit & Adherence
            </div>
            <h2 className="text-2xl font-bold text-charcoal font-display tracking-tight">
              Welcome to GutHub
            </h2>
            <p className="text-xs text-slate-grey leading-relaxed">
              Continuous bio-acoustic peristalsis tracking, gastrocolic motility dynamics, and verified medication compliance.
            </p>
          </div>

          {/* Demonstration Notice Box */}
          <div className="rounded-xl bg-[#F0F7F4] border border-sage p-3.5 text-xs text-slate-grey">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-midnight">
                  Demonstration Platform:
                </strong>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-grey">
                  Developed for MEDAITHON '26. Physiological acoustic motility and adherence data are generated from local client sensor models for healthcare demonstration.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Subject Dossier Badge */}
            <div className="p-3.5 rounded-xl border border-border-soft bg-ivory flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage border border-emerald/30 text-midnight font-bold text-xs flex items-center justify-center">
                  AM
                </div>
                <div>
                  <h3 className="font-bold text-xs text-charcoal">{patientName}</h3>
                  <p className="text-[10px] text-slate-grey font-medium">
                    Subject #GH-4091 • Monitoring Active
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage text-midnight border border-emerald/20">
                Patient
              </span>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald hover:bg-emerald-hover text-white font-bold text-xs tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>Launch GutHub Patient Platform</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Bottom Sensor Badges */}
          <div className="pt-4 border-t border-border-soft grid grid-cols-3 gap-2 text-center text-[10.5px] text-slate-grey font-medium">
            <div className="p-2.5 rounded-xl bg-ivory">
              <Radio size={15} className="mx-auto mb-1 text-emerald" />
              <span>GutPatch</span>
            </div>
            <div className="p-2.5 rounded-xl bg-ivory">
              <Activity size={15} className="mx-auto mb-1 text-emerald" />
              <span>Vitals</span>
            </div>
            <div className="p-2.5 rounded-xl bg-ivory">
              <Pill size={15} className="mx-auto mb-1 text-emerald" />
              <span>SmartBox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-grey py-3">
        <p>GutHub Platform • MEDAITHON '26 Healthcare Technology Challenge • Non-Diagnostic</p>
      </footer>
    </div>
  );
};

export default LoginPage;
