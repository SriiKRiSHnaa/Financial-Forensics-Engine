import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Users, ShieldAlert, ChevronRight } from 'lucide-react';

const FraudRingTable = ({ rings, onSelectRing }) => {
    if (!rings || rings.length === 0) return null;

    return (
        <div className="mt-8 glass rounded-2xl overflow-hidden border border-dark-600">
            <div className="p-4 border-b border-dark-600 bg-dark-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Detected Fraud Rings</h3>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">
                    {rings.length} RINGS IDENTIFIED
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-gray-500 bg-dark-900/30">
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Ring ID</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Pattern</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Members</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Risk Score</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Account IDs</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {rings.map((ring, idx) => (
                            <motion.tr
                                key={ring.ring_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="hover:bg-blue-500/5 transition-colors group"
                            >
                                <td className="px-6 py-4 font-mono text-blue-400 font-bold">{ring.ring_id}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${ring.pattern_type === 'cycle' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
                                        }`}>
                                        {ring.pattern_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <Users size={12} className="text-gray-500" />
                                        {ring.member_accounts.length}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{ width: `${ring.risk_score}%` }}
                                            />
                                        </div>
                                        <span className="font-mono font-bold text-red-500">{ring.risk_score.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-500 truncate max-w-[200px]">
                                    {ring.member_accounts.join(', ')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onSelectRing(ring)}
                                        className="text-gray-500 group-hover:text-blue-400 hover:scale-110 transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FraudRingTable;
