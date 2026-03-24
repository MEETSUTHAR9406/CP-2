import React, { useEffect, useState, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useAuth } from '../../context/AuthContext';
import { getKnowledgeMap } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { ArrowLeft, Brain, ZoomIn, ZoomOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const KnowledgeMap = () => {
    const fgRef = useRef();
    const { user } = useAuth();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const fetchMapConstraints = async () => {
            try {
                const data = await getKnowledgeMap();
                setGraphData(data);
            } catch (error) {
                console.error("Failed to load knowledge map:", error);
                // Fallback to empty state
                setGraphData({ nodes: [], links: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchMapConstraints();
    }, []);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-gray-900 rounded-3xl relative shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-gray-800">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <Link to="/student/dashboard">
                        <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                    >
                        <h1 className="text-3xl font-bold text-white flex items-center drop-shadow-lg">
                            <Brain className="mr-3 text-indigo-400" size={32} />
                            Your Knowledge Map
                        </h1>
                        <p className="text-gray-300 mt-2 max-w-md drop-shadow-md text-sm leading-relaxed">
                            This 3D constellation represents your learning journey. Larger nodes indicate stronger mastery. Click on any topic to explore relationships.
                        </p>
                    </motion.div>
                </div>

                {/* Node Details Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.95 }}
                            className="pointer-events-auto"
                        >
                            <Card className="w-80 bg-white/10 backdrop-blur-xl border-white/20 text-white p-6 shadow-2xl rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-indigo-300">{selectedNode.id}</h3>
                                    <button
                                        onClick={() => setSelectedNode(null)}
                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Description</div>
                                        <div className="text-sm text-gray-200">{selectedNode.description || 'No description available for this topic.'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Mastery Level</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                    style={{ width: `${Math.min(100, selectedNode.val * 4)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-indigo-300">{Math.min(100, selectedNode.val * 4)}%</span>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 border-none">
                                        Practice This Topic
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                <button
                    onClick={() => {
                        const { x, y, z } = fgRef.current.cameraPosition();
                        fgRef.current.cameraPosition({ x: x * 0.5, y: y * 0.5, z: z * 0.5 }, null, 500);
                    }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={() => {
                        const { x, y, z } = fgRef.current.cameraPosition();
                        fgRef.current.cameraPosition({ x: x * 1.5, y: y * 1.5, z: z * 1.5 }, null, 500);
                    }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
                >
                    <ZoomOut size={20} />
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="text-indigo-400 font-bold animate-pulse">Mapping your brain...</span>
                    </div>
                </div>
            )}

            {/* 3D Graph */}
            <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="" // Custom label handled by click panel
                    nodeColor={node => {
                        // Color palette based on groups
                        const colors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'];
                        return colors[(node.group || 1) % colors.length];
                    }}
                    nodeResolution={32}
                    nodeRelSize={6}
                    linkColor={() => 'rgba(255,255,255,0.2)'}
                    linkWidth={1.5}
                    linkResolution={16}
                    backgroundColor="#111827" // Tailwind gray-900
                    showNavInfo={false}
                    onNodeClick={handleNodeClick}
                    enableNodeDrag={false}
                    onEngineStop={() => {
                        if (fgRef.current) {
                            fgRef.current.zoomToFit(400);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default KnowledgeMap;
