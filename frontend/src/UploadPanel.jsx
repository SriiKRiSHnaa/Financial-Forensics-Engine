import React, { useRef } from 'react';
import { Upload, FileCode, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadPanel = ({ onUpload, isLoading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onUpload(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center max-w-md w-full"
        >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-400">
                <Upload size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2">Upload Transactions</h2>
            <p className="text-gray-400 mb-8 text-sm">
                Drag and drop your transaction CSV file here to begin the graph analysis.
            </p>

            <label className="w-full">
                <div className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${isLoading ? 'border-blue-500/50 cursor-wait' : 'border-dark-600 hover:border-blue-500/50 hover:bg-blue-500/5'}
        `}>
                    <FileCode className="text-gray-500 mb-2" size={24} />
                    <span className="text-sm font-medium text-gray-300">
                        {isLoading ? 'Processing algorithms...' : 'Choose CSV File'}
                    </span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </div>
            </label>

            <div className="mt-6 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-left">
                <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <span className="text-[10px] text-yellow-500/80 leading-relaxed">
                    Ensure your CSV has columns: <code className="bg-yellow-500/10 px-1 rounded text-white">sender_id</code>,
                    <code className="bg-yellow-500/10 px-1 rounded text-white">receiver_id</code>,
                    <code className="bg-yellow-500/10 px-1 rounded text-white">amount</code>,
                    <code className="bg-yellow-500/10 px-1 rounded text-white">timestamp</code>.
                </span>
            </div>
        </motion.div>
    );
};

export default UploadPanel;
