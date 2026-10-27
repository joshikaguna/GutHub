// src/pages/LiveMonitoring.tsx
import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Heart,
  Thermometer,
  Zap,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Info,
  Clock,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Measurement } from "../types";
import { storage } from "../services/storage";

interface TelemetryPoint {
  timeStr: string;
  heartRate: number;
  skinTemp: number;
  eda: number;
  acousticRate: number;
  activity: string;
  signalQuality: "Optimal" | "Good" | "Fair" | "Degraded";
  movementArtifact: boolean;
}

const generateInitialHistory = (): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    const hr = Math.round(72 + Math.sin(i * 0.4) * 6 + (Math.random() - 0.5) * 3);
    const temp = parseFloat((36.5 + Math.cos(i * 0.3) * 0.15 + Math.random() * 0.1).toFixed(2));
    const eda = parseFloat((2.3 + Math.sin(i * 0.2) * 0.3 + Math.random() * 0.15).toFixed(2));
    const acoustic = parseFloat((12.4 + Math.sin(i * 0.5) * 4).toFixed(1));
    points.push({
      timeStr: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      heartRate: hr,
      skinTemp: temp,
      eda,
      acousticRate: acoustic,
      activity: i % 8 === 0 ? "Walking" : "Rest",
      signalQuality: "Optimal",
      movementArtifact: false,
    });
  }
  return points;
};

const LiveMonitoring: React.FC = () => {
  const [history, setHistory] = useState<TelemetryPoint[]>(generateInitialHistory);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [artifactSimulated, setArtifactSimulated] = useState(false);
  const [recentEvents, setRecentEvents] = useState<string[]>([
    "12:45:10 - GutPatch acoustic burst detected (SNR 28dB)",
    "12:45:07 - BLE GATT packet received from SmartBand",
    "12:45:04 - Euthermic skin temperature verified (36.6°C)",
  ]);

  useEffect(() => {
    if (!isStreaming || !isConnected) return;

    const interval = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const hrChange = (Math.random() - 0.5) * 3.5;
        const nextHr = Math.round(Math.min(100, Math.max(62, (last ? last.heartRate : 74) + hrChange)));
        const nextTemp = parseFloat(
          Math.min(37.3, Math.max(36.2, (last ? last.skinTemp : 36.6) + (Math.random() - 0.5) * 0.06)).toFixed(2)
        );
        const nextEda = parseFloat(
          Math.min(4.0, Math.max(1.8, (last ? last.eda : 2.4) + (Math.random() - 0.5) * 0.12)).toFixed(2)
        );
        const nextAcoustic = parseFloat(
          Math.min(22.0, Math.max(4.0, (last ? last.acousticRate : 12.0) + (Math.random() - 0.5) * 1.5)).toFixed(1)
        );

        const newPoint: TelemetryPoint = {
          timeStr: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          heartRate: nextHr,
          skinTemp: nextTemp,
          eda: nextEda,
          acousticRate: nextAcoustic,
          activity: artifactSimulated ? "Walking" : Math.random() > 0.8 ? "Sedentary" : "Rest",
          signalQuality: artifactSimulated ? "Degraded" : "Optimal",
          movementArtifact: artifactSimulated,
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });

      // Update event feed
      if (Math.random() > 0.6) {
        const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const evTypes = [
          "GutPatch hydrogel microphone audio packet verified",
          "Autonomic EDA tone sampled (microSiemens)",
          "Peripheral PPG heart rate interval steady",
          "Peristaltic bowel acoustic cluster recorded",
        ];
        const randomEv = evTypes[Math.floor(Math.random() * evTypes.length)];
        setRecentEvents((prev) => [`${nowStr} - ${randomEv}`, ...prev.slice(0, 5)]);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming, isConnected, artifactSimulated]);

  const latest = history[history.length - 1] || {
    timeStr: "--",
    heartRate: 74,
    skinTemp: 36.6,
    eda: 2.4,
    acousticRate: 12.4,
    activity: "Rest",
    signalQuality: "Optimal",
    movementArtifact: false,
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Stream controls */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              {isStreaming && isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-japan opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  !isConnected
                    ? "bg-coral-refined"
                    : isStreaming
                    ? "bg-teal-japan"
                    : "bg-slate-muted"
                }`}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-deep">
              {isConnected
                ? isStreaming
                  ? "Live Clinical Telemetry Workspace"
                  : "Stream Paused"
                : "Sensor Disconnected (Demo Mode)"}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-mist-blue text-navy-deep border border-border-soft">
              Simulated BLE Stream
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-navy-deep font-display">
            Real-Time Multi-Sensor Telemetry
          </h1>
          <p className="text-xs text-slate-muted">
            Continuous streaming photoplethysmography, skin thermometry, and GutPatch acoustic peristalsis
          </p>
        </div>

        {/* Workspace Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isConnected && (
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isStreaming
                  ? "bg-surface text-slate-muted border-border-soft hover:bg-bg-ivory"
                  : "bg-teal-japan text-white border-teal-japan hover:bg-teal-dark"
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause size={13} /> Pause Stream
                </>
              ) : (
                <>
                  <Play size={13} /> Resume Stream
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setArtifactSimulated(!artifactSimulated)}
            disabled={!isConnected}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              artifactSimulated
                ? "bg-amber-muted/15 text-amber-muted border-amber-muted/40"
                : "bg-surface text-slate-muted border-border-soft hover:bg-bg-ivory"
            }`}
          >
            <AlertTriangle size={13} />
            {artifactSimulated ? "Clear Motion Artifact" : "Simulate Motion"}
          </button>

          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              !isConnected
                ? "bg-teal-japan text-white border-teal-japan"
                : "bg-surface text-coral-refined border-coral-refined/30 hover:bg-coral-refined/10"
            }`}
          >
            {isConnected ? (
              <>
                <WifiOff size={13} /> Test Disconnect
              </>
            ) : (
              <>
                <Wifi size={13} /> Reconnect Hardware
              </>
            )}
          </button>
        </div>
      </div>

      {/* Disconnected State Banner if Device Disconnected */}
      {!isConnected && (
        <div className="bg-surface border-2 border-coral-refined/30 rounded-xl p-5 shadow-subtle flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-coral-refined/10 text-coral-refined flex items-center justify-center flex-shrink-0 mt-0.5">
            <WifiOff size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-navy-deep">
              Sensor Hardware Decoupled or Out of Range
            </h3>
            <p className="text-xs text-slate-muted leading-relaxed">
              No incoming BLE advertising packets detected from GutPatch or SmartBand. Live charts are held at the last known timestamp to prevent displaying fabricated live readings. Verify Bluetooth coupling or click "Reconnect Hardware" above.
            </p>
          </div>
        </div>
      )}

      {/* Motion Artifact Alert Banner */}
      {isConnected && artifactSimulated && (
        <div className="bg-surface border border-amber-muted/40 rounded-xl p-4 shadow-subtle flex items-start gap-3">
          <AlertTriangle size={17} className="text-amber-muted flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-semibold text-navy-deep">
              Signal Quality Notice: Accelerometer Displacement Filter Active
            </strong>
            <p className="text-slate-muted mt-0.5">
              Subject motion detected. High-pass audio filtering is actively rejecting ambulatory movement noise to protect peristaltic bowel sound detection accuracy.
            </p>
          </div>
        </div>
      )}

      {/* 4 Real-time Sensor Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Heart Rate */}
        <Card noPadding className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-muted mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Heart Rate</span>
            <Heart size={14} className="text-coral-refined" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-deep font-display">
              {isConnected ? latest.heartRate : "--"}
            </span>
            <span className="text-xs text-slate-muted">BPM</span>
          </div>
          <p className="text-[10.5px] text-slate-muted mt-2">
            PPG Pulse Sensor • {isConnected ? "Optimal SNR" : "Signal Paused"}
          </p>
        </Card>

        {/* Metric 2: Skin Temp */}
        <Card noPadding className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-muted mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Skin Temperature</span>
            <Thermometer size={14} className="text-teal-japan" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-deep font-display">
              {isConnected ? latest.skinTemp : "--"}
            </span>
            <span className="text-xs text-slate-muted">°C</span>
          </div>
          <p className="text-[10.5px] text-slate-muted mt-2">
            Peripheral Wrist Thermistor
          </p>
        </Card>

        {/* Metric 3: EDA */}
        <Card noPadding className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-muted mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>EDA Conductance</span>
            <Zap size={14} className="text-forest-green" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-deep font-display">
              {isConnected ? latest.eda : "--"}
            </span>
            <span className="text-xs text-slate-muted">µS</span>
          </div>
          <p className="text-[10.5px] text-slate-muted mt-2">
            Autonomic Sympathetic Tone
          </p>
        </Card>

        {/* Metric 4: Acoustic Event Rate */}
        <Card noPadding className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-muted mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Acoustic Peristalsis</span>
            <Radio size={14} className="text-teal-japan" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-japan font-display">
              {isConnected ? latest.acousticRate : "--"}
            </span>
            <span className="text-xs text-slate-muted">events/min</span>
          </div>
          <p className="text-[10.5px] text-slate-muted mt-2">
            GutPatch Acoustic Subsystem
          </p>
        </Card>
      </div>

      {/* Main Charts: 1. Heart Rate Line Stream, 2. Acoustic & Skin Temp */}
      <Card
        title="Real-Time Continuous Sensor Stream"
        subtitle="Sampled at 2.8-second intervals over the most recent observation window"
        badge={
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-light text-teal-dark border border-teal-japan/20">
            {isConnected ? "Active Stream" : "Disconnected"}
          </span>
        }
      >
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={isConnected ? history : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
              <XAxis dataKey="timeStr" tick={{ fontSize: 10, fill: "#687985" }} tickMargin={6} />
              <YAxis domain={[55, 110]} tick={{ fontSize: 10, fill: "#687985" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E1E8E7",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#176B5B"
                strokeWidth={2.2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Lower Row: Event Feed & Device Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readable Event Feed */}
        <Card
          title="Telemetry Event Feed"
          subtitle="Real-time BLE packet reception and filtering events"
        >
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {recentEvents.map((ev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-bg-ivory/80 border border-border-soft text-xs text-navy-deep flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-japan" />
                  <span className="font-mono text-[11px] text-slate-muted">{ev}</span>
                </div>
                <span className="text-[10px] text-forest-green font-medium">OK</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Information Panel */}
        <Card
          title="Hardware Telemetry Diagnostics"
          subtitle="GATT connection parameters & sensor calibration data"
        >
          <div className="space-y-2.5 text-xs text-slate-muted">
            <div className="flex justify-between py-1 border-b border-border-soft/60">
              <span>SmartBand BLE MAC:</span>
              <span className="font-mono text-navy-deep">A4:C1:38:9B:41:09</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-soft/60">
              <span>GutPatch Acoustic Node:</span>
              <span className="font-mono text-navy-deep">GP-MED-771 (FW v3.1.0)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-soft/60">
              <span>Signal-to-Noise Ratio (SNR):</span>
              <span className="font-semibold text-teal-japan">28.4 dB (Optimal)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-soft/60">
              <span>Battery Level:</span>
              <span className="font-semibold text-navy-deep">SmartBand 88% • GutPatch 76%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Data Integrity Mode:</span>
              <span className="text-teal-japan font-medium">Simulated Research Profile</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveMonitoring;
