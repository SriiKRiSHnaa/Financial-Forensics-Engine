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
        <div
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass p-8 rounded-2xl flex flex-col items-center justify-center text-center w-full">
                <h2 className="text-xl font-bold mb-1">Start Analysis</h2>
                <p className="text-gray-500 mb-6 text-xs uppercase tracking-widest font-bold">
                    Drop transactions CSV
                </p>

                <label className="w-full">
                    <div className={`
              flex items-center justify-center gap-3 px-8 py-3 bg-white text-black rounded-full font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer
              ${isLoading ? 'opacity-50 cursor-wait' : ''}
            `}>
                        <Upload size={18} />
                        <span>{isLoading ? 'Processing...' : 'Get Started'}</span>
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

                <p className="mt-4 text-[10px] text-gray-600 font-mono tracking-tighter">
                    Accepts standard financial dataset exports (.csv)
                </p>
            </div>
        </div>
    );
};

export default UploadPanel;
