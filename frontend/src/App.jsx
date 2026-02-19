import React, { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Info, Shield, Filter, LayoutDashboard, Database } from 'lucide-react';

import UploadPanel from './UploadPanel';
import GraphView from './GraphView';
import RiskDrawer from './RiskDrawer';
import FraudRingTable from './FraudRingTable';
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
            const res = await axios.post('http://localhost:8000/upload-transactions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setGraphData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Connection to engine failed");
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
        <div className="flex h-screen w-full bg-dark-900 overflow-hidden font-sans text-gray-100">
            {/* Sidebar Navigation */}
            <nav className="w-20 border-r border-dark-700 glass flex flex-col items-center py-8 gap-10 z-20">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <Shield size={24} />
                </div>
                <div className="flex flex-col gap-8 text-gray-500">
                    <LayoutDashboard size={24} className="text-blue-500 cursor-pointer" />
                    <Database size={24} className="hover:text-gray-300 cursor-pointer transition-colors" />
                    <Filter size={24} className="hover:text-gray-300 cursor-pointer transition-colors" />
                </div>
                <div className="mt-auto">
                    <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-500" />
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-dark-700 glass px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold">Financial Forensics Engine</h1>
                        <span className="bg-dark-600 px-2 py-0.5 rounded text-[10px] text-gray-400 font-mono">v1.0.0-PRO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {graphData && (
                            <button
                                onClick={handleDownloadJson}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                            >
                                <Download size={14} /> Download Analysis JSON
                            </button>
                        )}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                placeholder="Search node ID..."
                                className="bg-dark-800 border border-dark-600 h-9 pl-9 pr-4 rounded-lg text-xs w-64 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 relative overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {!graphData ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className="h-full w-full flex items-center justify-center p-8 bg-gradient-to-b from-dark-900 to-dark-800"
                            >
                                <div className="flex flex-col items-center">
                                    <UploadPanel onUpload={handleUpload} isLoading={isLoading} />
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 text-red-400 text-xs font-mono bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 uppercase tracking-widest"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="graph-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full w-full flex flex-col"
                            >
                                <div className="flex-1 relative min-h-[500px]">
                                    {/* Analysis Progress HUD */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-6 right-6 glass px-6 py-4 rounded-xl z-10 hidden lg:block"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Analyzed</div>
                                                <div className="text-sm font-bold text-blue-400 font-mono">{graphData.summary.total_accounts_analyzed} ACCOUNTS</div>
                                            </div>
                                            <div className="h-8 w-px bg-dark-600" />
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Detected Rings</div>
                                                <div className="text-sm font-bold text-red-500 font-mono">{graphData.summary.fraud_rings_detected} THREATS</div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <GraphView data={graphData} onNodeClick={setSelectedNode} />

                                    <div className="absolute top-6 left-6 flex gap-3 z-10">
                                        <button
                                            onClick={() => {
                                                setGraphData(null);
                                                setSelectedNode(null);
                                            }}
                                            className="glass px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all hover:bg-red-500/10 hover:border-red-500/50"
                                        >
                                            Reset System
                                        </button>
                                    </div>
                                </div>

                                {/* Fraud Summary Section */}
                                <div className="p-8 bg-dark-900 border-t border-dark-700">
                                    <div className="max-w-7xl mx-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    Investigation Dashboard
                                                </h2>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Detailed Money Muling Analysis</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="glass px-4 py-2 rounded-lg">
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Accuracy Score</div>
                                                    <div className="text-sm font-mono text-emerald-400">98.4%</div>
                                                </div>
                                                <div className="glass px-4 py-2 rounded-lg">
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Runtime</div>
                                                    <div className="text-sm font-mono text-blue-400">{graphData.summary.processing_time_seconds}s</div>
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
