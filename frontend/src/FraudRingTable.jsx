import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Users, ShieldAlert, ChevronRight } from 'lucide-react';

const FraudRingTable = ({ rings, onSelectRing }) => {
    if (!rings || rings.length === 0) return null;

    return (
        <div className="mt-8 border border-white/5 bg-dark-800/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="text-red-500" size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-300">Detected Fraud Rings</h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Automated Threat Detection</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-500 font-bold">
                        {rings.length} RINGS IDENTIFIED
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                    <thead>
                        <tr className="text-gray-500 border-b border-white/5">
                            <th className="px-8 py-4 font-bold uppercase tracking-widest">Ring ID</th>
                            <th className="px-8 py-4 font-bold uppercase tracking-widest">Pattern</th>
                            <th className="px-8 py-4 font-bold uppercase tracking-widest text-center">Members</th>
                            <th className="px-8 py-4 font-bold uppercase tracking-widest">Risk Score</th>
                            <th className="px-8 py-4 font-bold uppercase tracking-widest">Target Accounts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rings.map((ring, idx) => (
                            <motion.tr
                                key={ring.ring_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-white/5 transition-all group cursor-pointer"
                                onClick={() => onSelectRing(ring)}
                            >
                                <td className="px-8 py-5">
                                    <div className="font-mono text-blue-400 font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                        {ring.ring_id}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${ring.pattern_type === 'cycle' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}>
                                        {ring.pattern_type}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-gray-300 font-mono">
                                        <Users size={12} className="text-gray-500" />
                                        {ring.member_accounts.length}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ring.risk_score}%` }}
                                                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                            />
                                        </div>
                                        <span className="font-mono font-bold text-red-500">{ring.risk_score.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="font-mono text-[10px] text-gray-500 truncate max-w-[200px] bg-white/5 px-2 py-1 rounded">
                                        {ring.member_accounts.join(', ')}
                                    </div>
                                </td>
                                <div className="font-mono text-[10px] text-gray-500 truncate max-w-[200px] bg-white/5 px-2 py-1 rounded">
                                    {ring.member_accounts.join(', ')}
                                </div>
                            </td>
                            </motion.tr>
                        ))}
                </tbody>
            </table>
        </div>
        </div >
    );
};

export default FraudRingTable;
