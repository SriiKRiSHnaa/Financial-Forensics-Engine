import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const GraphView = ({ data, onNodeClick }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !data) return;

        // Transform API data to Cytoscape elements
        const elements = [
            ...data.nodes.map(node => ({
                data: {
                    id: node.id,
                    label: node.label,
                    risk: node.risk_score,
                    metrics: node.metrics,
                    ring_id: node.ring_id
                }
            })),
            ...data.edges.map((edge, index) => {
                // Find if this edge connects members of the same ring
                const sourceNode = data.nodes.find(n => n.id === edge.source);
                const targetNode = data.nodes.find(n => n.id === edge.target);
                const inSameRing = sourceNode && targetNode &&
                    sourceNode.ring_id !== "NONE" &&
                    sourceNode.ring_id === targetNode.ring_id;

                return {
                    data: {
                        id: `e${index}`,
                        source: edge.source,
                        target: edge.target,
                        amount: edge.amount,
                        inSameRing: inSameRing,
                        ring_id: inSameRing ? sourceNode.ring_id : null
                    }
                };
            })
        ];

        cyRef.current = cytoscape({
            container: containerRef.current,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'color': '#fff',
                        'font-size': '12px',
                        'font-weight': 'bold',
                        'text-valign': 'bottom',
                        'text-margin-y': '5px',
                        'text-outline-width': 1,
                        'text-outline-color': '#0a0a0c',
                        'background-color': (node) => {
                            const risk = node.data('risk');
                            if (risk >= 70) return '#ff1e1e'; // Brighter Red
                            if (risk >= 30) return '#facc15'; // Brighter Yellow
                            return '#10b981'; // Green
                        },
                        'width': (node) => 25 + (node.data('risk') / 1.5),
                        'height': (node) => 25 + (node.data('risk') / 1.5),
                        'border-width': (node) => node.data('ring_id') !== "NONE" ? 4 : 2,
                        'border-color': (node) => node.data('ring_id') !== "NONE" ? '#3b82f6' : '#ffffff22',
                        'border-opacity': (node) => node.data('ring_id') !== "NONE" ? 1 : 0.5,
                        'transition-property': 'background-color, width, height, border-color',
                        'transition-duration': '0.5s'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': (edge) => edge.data('inSameRing') ? 3 : 1.5,
                        'line-color': (edge) => edge.data('inSameRing') ? '#3b82f6' : '#3b82f633',
                        'target-arrow-color': (edge) => edge.data('inSameRing') ? '#3b82f6' : '#3b82f633',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': (edge) => edge.data('inSameRing') ? 1 : 0.8,
                        'arrow-scale': 0.8
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': 5,
                        'border-color': '#ffffff',
                        'border-opacity': 1,
                        'overlay-color': '#3b82f6',
                        'overlay-opacity': 0.2
                    }
                }
            ],
            layout: {
                name: 'cose', // Better for clusters/rings
                padding: 60,
                animate: true,
                animationDuration: 1000
            }
        });

        cyRef.current.on('tap', 'node', (evt) => {
            onNodeClick(evt.target.data());
        });

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [data, onNodeClick]);

    return (
        <div className="w-full h-full relative">
            <div ref={containerRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute bottom-6 left-6 border border-white/10 bg-dark-800/60 backdrop-blur-xl p-5 rounded-2xl text-[10px] space-y-4 pointer-events-none shadow-2xl">
                <div>
                    <div className="font-extrabold mb-2 uppercase tracking-[0.2em] text-gray-500">Risk Profile</div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 font-bold text-gray-300">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" /> High Risk (70-100)
                        </div>
                        <div className="flex items-center gap-3 font-bold text-gray-300">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]" /> Medium Risk (30-69)
                        </div>
                        <div className="flex items-center gap-3 font-bold text-gray-300">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Low Risk (0-29)
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                    <div className="font-extrabold mb-2 uppercase tracking-[0.2em] text-gray-500">Fraud Detection</div>
                    <div className="flex items-center gap-3 font-bold text-gray-300">
                        <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-blue-500 bg-transparent shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                        <span>Fraud Ring Member</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphView;
