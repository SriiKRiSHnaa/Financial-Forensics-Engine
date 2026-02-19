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
            <div className="absolute bottom-6 left-6 glass p-4 rounded-xl text-xs space-y-2 pointer-events-none">
                <div className="font-bold mb-2 uppercase tracking-widest text-[10px] opacity-60">Risk Profile</div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> High Risk (70-100)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" /> Medium Risk (30-69)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" /> Low Risk (0-29)
                </div>
            </div>
        </div>
    );
};

export default GraphView;
