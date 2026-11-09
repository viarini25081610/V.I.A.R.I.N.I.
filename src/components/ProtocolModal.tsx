import React from 'react';
import { Terminal, Shield, Zap, Wind, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { playSciFiSound } from '../utils/audio';

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteProtocol: (protocolId: string) => Promise<void>;
}

export const ProtocolModal: React.FC<ProtocolModalProps> = ({
  isOpen,
  onClose,
  onExecuteProtocol,
}) => {
  if (!isOpen) return null;

  const protocols = [
    {
      id: 'house-party',
      title: 'HOUSE PARTY PROTOCOL',
      code: 'PROTOCOL-08-41',
      description: 'Summon and deploy all automated combat armors from subterranean vault under autonomous control.',
      icon: Shield,
      color: 'border-cyan-500/50 hover:border-cyan-400 text-cyan-300',
      badge: 'COMBAT INITIATIVE',
    },
    {
      id: 'clean-slate',
      title: 'CLEAN SLATE PROTOCOL',
      code: 'PROTOCOL-OMEGA-99',
      description: 'Initiate self-detonation sequence across all secondary armor units and purge experimental telemetry.',
      icon: AlertTriangle,
      color: 'border-red-500/50 hover:border-red-400 text-red-300',
      badge: 'DESTRUCT SEQUENCE',
    },
    {
      id: 'flight-calibration',
      title: 'FLIGHT SURFACE CALIBRATION',
      code: 'AERO-VECTOR-100',
      description: 'Zero stabilization gyros, test variable geometry air-flaps, and sync supersonic thruster outputs.',
      icon: Wind,
      color: 'border-blue-500/50 hover:border-blue-400 text-blue-300',
      badge: 'PROPULSION',
    },
    {
      id: 'repulsor-test',
      title: 'REPULSOR CAPACITOR OVERCHARGE',
      code: 'WEAPONS-GRID-ALPHA',
      description: 'Route 85% of Arc Reactor current to dual-palm repulsors and chest unibeam capacitor array.',
      icon: Zap,
      color: 'border-amber-500/50 hover:border-amber-400 text-amber-300',
      badge: 'WEAPONS CHARGE',
    },
    {
      id: 'stealth-grid',
      title: 'STEALTH & RADAR ABSORPTION',
      code: 'CLOAK-HEX-04',
      description: 'Baffle engine thermal exhaust, activate radar-absorbent hull geometry, and mask satellite signals.',
      icon: Shield,
      color: 'border-purple-500/50 hover:border-purple-400 text-purple-300',
      badge: 'COVERT GRID',
    },
    {
      id: 'armor-diagnostic',
      title: 'MARK VII ARMOR DIAGNOSTIC',
      code: 'ALLOY-GOLD-TI-7',
      description: 'Analyze structural strain, micrometeorite shielding, neural link latency, and emergency life support.',
      icon: CheckCircle,
      color: 'border-emerald-500/50 hover:border-emerald-400 text-emerald-300',
      badge: 'SUIT VITALS',
    },
  ];

  const handleSelect = async (id: string) => {
    playSciFiSound('repulsor');
    await onExecuteProtocol(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#080d19] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden glow-gold">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-gradient-to-r from-amber-950/40 via-[#0c1424] to-[#080d19]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-orbitron font-bold text-sm text-amber-300 tracking-wider">
                V.I.A.R.I.N.I. STARK PROTOCOL CONSOLE
              </h3>
              <p className="font-tech text-[10px] text-amber-500/80 tracking-widest uppercase">
                Authorized Override Level 5 // High Command
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSciFiSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg border border-amber-900/60 hover:border-amber-400 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {protocols.map((proto) => {
            const IconComponent = proto.icon;
            return (
              <div
                key={proto.id}
                onClick={() => handleSelect(proto.id)}
                className={`p-4 rounded-xl bg-[#050a14]/90 border ${proto.color} transition-all duration-200 hover:scale-[1.02] cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-tech text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-xs bg-slate-900/80 border border-slate-700/60 text-slate-300">
                      {proto.badge}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{proto.code}</span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <h4 className="font-orbitron font-bold text-xs tracking-wide">
                      {proto.title}
                    </h4>
                  </div>

                  <p className="font-tech text-xs text-slate-400 leading-relaxed">
                    {proto.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-tech text-slate-500 group-hover:text-amber-300">
                  <span>CLICK TO TRANSMIT</span>
                  <span>[EXECUTE] &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-900/40 bg-[#050812] flex items-center justify-between text-[10px] font-tech text-slate-500">
          <span>STARK PROTOCOL NETWORK ONLINE</span>
          <span>VOICE CONFIRMATION ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
