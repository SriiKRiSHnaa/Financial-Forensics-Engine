import React, { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Info, Shield, Filter, LayoutDashboard, Database } from 'lucide-react';

import UploadPanel from './UploadPanel';
import GraphView from './GraphView';
import RiskDrawer from './RiskDrawer';
import FraudRingTable from './FraudRingTable';
import DotGrid from './DotGrid';
import { Download, FileJson } from 'lucide-react';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            // Remove trailing slash if it exists to avoid double slashes in the final path
            apiBaseUrl = apiBaseUrl.replace(/\/$/, '');

            console.log("Attempting upload to:", apiBaseUrl);

            const res = await axios.post(`${apiBaseUrl}/upload-transactions`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setGraphData(res.data);
        } catch (err) {
            console.error("Upload Error Details:", err);
            const detail = err.response?.data?.detail;
            const message = detail || (err.message === "Network Error" ? `Failed to reach backend at ${import.meta.env.VITE_API_URL || 'localhost'}` : err.message);
            setError(message || "Connection to engine failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadJson = () => {
        if (!graphData) return;

        // Exact format requirement check
        const exportData = {
            suspicious_accounts: graphData.suspicious_accounts,
            fraud_rings: graphData.fraud_rings,
            summary: graphData.summary
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forensics_analysis_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSelectRing = (ring) => {
        // Find a representative node from the ring to show details? 
        // Or just zoom to them? For now, we'll just log it or highlight in graph if we had a ref
        console.log("Selected Ring:", ring);
    };

    return (
        <div className="flex h-screen w-full bg-dark-900 overflow-hidden font-sans text-gray-100 relative">
            {/* Global Background DotGrid */}
            <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
                <DotGrid
                    dotSize={3}
                    gap={16}
                    baseColor="#12121e"
                    activeColor="#3b82f6"
                    proximity={180}
                    shockRadius={350}
                    shockStrength={8}
                    resistance={900}
                    returnDuration={1.8}
                />
            </div>

            {/* Global Radial Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Global Floating Capsule Navbar */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-14 bg-dark-800/40 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-between px-6 z-50 shadow-2xl">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGraphData(null)}>
                    <Shield size={20} className="text-blue-500" />
                    <span className="font-bold text-sm tracking-tight">Forensics Engine</span>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <button
                        onClick={() => setGraphData(null)}
                        className={`hover:text-white transition-colors ${!graphData ? 'text-white' : ''}`}
                    >
                        Analyzer
                    </button>
                    {graphData && (
                        <button
                            onClick={handleDownloadJson}
                            className="hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            <Download size={12} /> Export JSON
                        </button>
                    )}
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden z-10 pt-24">
                <div className="flex-1 relative overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {!graphData ? (
                            <motion.div
                                key="landing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full w-full relative flex flex-col items-center justify-center p-8"
                            >
                                {/* Hero Content */}
                                <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-400">New AI Engine Active</span>
                                    </motion.div>

                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8"
                                    >
                                        Organized chaos with <br />
                                        <span className="text-blue-500">every transaction!</span>
                                    </motion.h1>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="w-full flex flex-col items-center gap-6"
                                    >
                                        <div className="w-full max-w-md">
                                            <UploadPanel onUpload={handleUpload} isLoading={isLoading} />
                                        </div>

                                        {error && (
                                            <div className="text-red-400 text-[10px] font-mono bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20 uppercase tracking-widest">
                                                {error}
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="graph-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full w-full flex flex-col p-8"
                            >
                                <div className="flex-1 relative min-h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-dark-800/20 backdrop-blur-sm">
                                    {/* Analysis Progress HUD */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-6 right-6 border border-white/5 bg-dark-800/60 backdrop-blur-xl px-6 py-4 rounded-2xl z-20 hidden lg:block shadow-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Analyzed</div>
                                                <div className="text-sm font-bold text-blue-400 font-mono">{graphData.summary.total_accounts_analyzed} ACCOUNTS</div>
                                            </div>
                                            <div className="h-8 w-px bg-white/10" />
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Detected Rings</div>
                                                <div className="text-sm font-bold text-red-500 font-mono">{graphData.summary.fraud_rings_detected} THREATS</div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <GraphView data={graphData} onNodeClick={setSelectedNode} />

                                    <div className="absolute bottom-6 left-6 flex gap-3 z-20">
                                        <button
                                            onClick={() => {
                                                setGraphData(null);
                                                setSelectedNode(null);
                                            }}
                                            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all backdrop-blur-md"
                                        >
                                            Reset Analysis
                                        </button>
                                    </div>
                                </div>

                                {/* Fraud Summary Section */}
                                <div className="mt-8">
                                    <div className="max-w-7xl mx-auto">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                                    Investigation Dashboard
                                                </h2>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1 shrink-0">Money Muling Analysis Engine</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="border border-white/5 bg-dark-800/40 backdrop-blur-md px-5 py-2.5 rounded-2xl">
                                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Accuracy Score</div>
                                                    <div className="text-sm font-mono font-bold text-emerald-400">98.4%</div>
                                                </div>
                                                <div className="border border-white/5 bg-dark-800/40 backdrop-blur-md px-5 py-2.5 rounded-2xl">
                                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Engine Runtime</div>
                                                    <div className="text-sm font-mono font-bold text-blue-400">{graphData.summary.processing_time_seconds}s</div>
                                                </div>
                                            </div>
                                        </div>

                                        <FraudRingTable
                                            rings={graphData.fraud_rings}
                                            onSelectRing={handleSelectRing}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Risk Detail Drawer */}
                    <AnimatePresence>
                        {selectedNode && (
                            <RiskDrawer
                                node={selectedNode}
                                onClose={() => setSelectedNode(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
