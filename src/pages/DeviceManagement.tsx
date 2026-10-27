// src/pages/DeviceManagement.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import {
  Smartphone,
  Radio,
  Pill,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { DeviceInfo } from "../types";
import { storage } from "../services/storage";

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>(() =>
    storage.get<DeviceInfo[]>("devices", [])
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    const updated = devices.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          connected: !d.connected,
          lastUpdate: "Just now",
        };
      }
      return d;
    });
    setDevices(updated);
    storage.set("devices", updated);
  };

  const handleScanBLE = () => {
    setIsScanning(true);
    setScanMessage("Scanning for nearby 2.4GHz BLE digestive sensors...");
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage("All 3 prototype hardware peripherals verified and communicating with GutHub Hub.");
      setTimeout(() => setScanMessage(null), 4000);
    }, 1400);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "SmartBand":
        return <Activity size={20} className="text-teal-japan" />;
      case "GutPatch":
        return <Radio size={20} className="text-teal-japan" />;
      case "Smart Medication Box":
        return <Pill size={20} className="text-forest-green" />;
      default:
        return <Smartphone size={20} className="text-navy-deep" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Hardware Telemetry
            </span>
            <span className="text-xs text-slate-muted">GATT BLE 2.4GHz</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-navy-deep font-display">
            Connected Medical Sensor Management
          </h1>
          <p className="text-xs text-slate-muted">
            Inspect battery telemetry, firmware versions, signal strength (RSSI), and data stream health
          </p>
        </div>

        <button
          onClick={handleScanBLE}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium shadow-xs transition-colors disabled:opacity-60"
        >
          <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
          <span>{isScanning ? "Scanning BLE..." : "Scan & Pair Sensors"}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="bg-[#EBF7F2] border border-[#C3E8DC] p-3 rounded-lg text-xs text-navy-deep flex items-center gap-2">
          <CheckCircle2 size={15} className="text-forest-green flex-shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Devices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {devices.map((device) => {
          const isLowBattery = device.battery < 20;
          return (
            <Card
              key={device.id}
              className={`flex flex-col justify-between ${
                !device.connected ? "opacity-75 bg-bg-ivory/50" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center">
                    {getDeviceIcon(device.type)}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      device.connected
                        ? "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]"
                        : "bg-coral-refined/10 text-coral-refined border-coral-refined/20"
                    }`}
                  >
                    {device.connected ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {device.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-navy-deep">{device.name}</h3>
                <p className="text-[11px] text-slate-muted mt-0.5">{device.type}</p>

                {/* Specs list */}
                <div className="mt-4 pt-3 border-t border-border-soft space-y-1.5 text-xs text-slate-muted">
                  <div className="flex justify-between">
                    <span>Battery Status:</span>
                    <span className="font-semibold text-navy-deep flex items-center gap-1">
                      <Battery size={13} className={isLowBattery ? "text-coral-refined" : "text-forest-green"} />
                      {device.battery}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Signal Strength:</span>
                    <span className="font-semibold text-navy-deep">
                      {device.signalStrengthDbm} dBm
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Firmware Build:</span>
                    <span className="font-mono text-[10.5px] text-navy-deep">
                      {device.firmware}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span className="text-navy-deep">{device.lastUpdate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Data Source:</span>
                    <span className="text-teal-japan font-medium text-[10.5px]">
                      {device.dataSource}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-border-soft">
                <button
                  onClick={() => toggleConnection(device.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    device.connected
                      ? "bg-surface hover:bg-bg-ivory text-navy-deep border-border-soft"
                      : "bg-teal-japan text-white border-teal-japan hover:bg-teal-dark"
                  }`}
                >
                  {device.connected ? "Simulate Disconnection" : "Reconnect BLE Device"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceManagement;
