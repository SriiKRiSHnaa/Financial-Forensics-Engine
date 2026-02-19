import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, TrendingUp, TrendingDown, Cpu, ChevronRight } from 'lucide-react';
import axios from 'axios';

const RiskDrawer = ({ node, onClose }) => {
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        if (!node) return;

        const fetchExplanation = async () => {
            setIsExplaining(true);
            try {
                const res = await axios.post('http://localhost:8000/explain-node', {
                    node_id: node.id,
                    risk_score: node.risk,
                    metrics: node.metrics
                });
                setExplanation(res.data.explanation);
            } catch (err) {
                setExplanation("Failed to generate AI explanation.");
            } finally {
                setIsExplaining(false);
            }
        };

        fetchExplanation();
    }, [node]);

    if (!node) return null;

    const riskColor = node.risk >= 70 ? 'text-red-500' : node.risk >= 30 ? 'text-yellow-500' : 'text-emerald-500';
    const riskBg = node.risk >= 70 ? 'bg-red-500/10' : node.risk >= 30 ? 'bg-yellow-500/10' : 'bg-emerald-500/10';

    return (
        <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-[400px] glass border-l border-dark-600 shadow-2xl z-50 flex flex-col"
        >
            <div className="p-6 flex justify-between items-center border-b border-dark-600">
                <div>
                    <h2 className="text-xl font-bold font-mono">NODE_{node.id}</h2>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Entity Investigation</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-full transition-colors text-gray-400">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Risk Score */}
                <div className={`p-6 rounded-2xl ${riskBg} flex flex-col items-center text-center`}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60">Calculated Risk Score</div>
                    <div className={`text-6xl font-black ${riskColor}`}>{node.risk}</div>
                    <div className={`mt-2 flex items-center gap-1 font-bold ${riskColor}`}>
                        <ShieldAlert size={16} />
                        {node.risk >= 70 ? 'CRITICAL RISK' : node.risk >= 30 ? 'ELEVATED RISK' : 'LOW RISK'}
                    </div>
                </div>

                {/* Network Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-xl">
                        <TrendingUp size={16} className="text-blue-400 mb-2" />
                        <div className="text-2xl font-bold">{node.metrics.in_degree}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Input Tx</div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                        <TrendingDown size={16} className="text-purple-400 mb-2" />
                        <div className="text-2xl font-bold">{node.metrics.out_degree}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Output Tx</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Graph Diagnostics</h3>
                    {[
                        { label: 'Network Degree', val: node.metrics.degree },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-dark-700/50 p-3 rounded-lg border border-dark-600/50">
                            <span className="text-xs text-gray-300">{item.label}</span>
                            <span className="text-xs font-mono text-blue-400">{item.val}</span>
                        </div>
                    ))}
                </div>

                {/* AI Explainer Module */}
                <div className="space-y-3 pt-4 border-t border-dark-600/50">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                        <Cpu size={14} /> AI Risk Reasoning
                    </h3>
                    <div className="glass bg-blue-500/5 border-blue-500/20 p-4 rounded-xl">
                        {isExplaining ? (
                            <div className="flex items-center gap-3 space-x-2 animate-pulse py-4">
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-2 bg-blue-500/20 rounded"></div>
                                    <div className="h-2 bg-blue-500/20 rounded w-5/6"></div>
                                    <div className="h-2 bg-blue-500/20 rounded w-4/6"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {explanation}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-dark-700/50 border-t border-dark-600">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    Flag Node for Review <ChevronRight size={14} />
                </button>
            </div>
        </motion.aside>
    );
};

export default RiskDrawer;
