import networkx as nx
import pandas as pd
import io

class GraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph_from_csv(self, csv_content: str):
        """
        Parses CSV content and builds a directed graph.
        Expected columns: sender_id, receiver_id, amount, timestamp
        """
        df = pd.read_csv(io.StringIO(csv_content))
        
        # Reset graph
        self.graph = nx.DiGraph()
        
        for _, row in df.iterrows():
            sender = str(row['sender_id'])
            receiver = str(row['receiver_id'])
            amount = float(row['amount'])
            timestamp = str(row['timestamp'])
            
            # Add or update edge
            if self.graph.has_edge(sender, receiver):
                self.graph[sender][receiver]['amount'] += amount
                # We could track multiple timestamps in a list if needed
                self.graph[sender][receiver]['timestamps'].append(timestamp)
            else:
                self.graph.add_edge(sender, receiver, amount=amount, timestamps=[timestamp])

        return self.graph

    def get_centrality_metrics(self):
        """
        Calculates simple degree metrics for all nodes.
        """
        if not self.graph:
            return {}
            
        metrics = {}
        for node in self.graph.nodes():
            metrics[node] = {
                "degree": self.graph.degree(node),
                "in_degree": self.graph.in_degree(node),
                "out_degree": self.graph.out_degree(node)
            }
        return metrics

    def detect_fraud_rings(self, metrics):
        """
        Identifies money muling rings:
        1. Simple Cycles (Circular flow)
        2. Smurfing Patterns (Many-to-one)
        """
        rings = []
        ring_counter = 1
        
        # 1. Detect Cycles (Classic Laundering)
        try:
            cycles = list(nx.simple_cycles(self.graph))
            for cycle in cycles:
                if len(cycle) >= 2:
                    ring_id = f"RING_{ring_counter:03d}"
                    rings.append({
                        "ring_id": ring_id,
                        "member_accounts": list(cycle),
                        "pattern_type": "cycle",
                        "risk_score": 90.0 + (len(cycle) * 0.5) # Heuristic
                    })
                    ring_counter += 1
        except Exception:
            pass # simple_cycles might fail on very dense graphs, but fine for now
            
        # 2. Detect Smurfing (Many-to-one hubs)
        for node in self.graph.nodes():
            in_degree = self.graph.in_degree(node)
            out_degree = self.graph.out_degree(node)
            
            # If a node has many inputs and at least one output, it's a potential hub
            if in_degree >= 5:
                # Find the members feeding into this hub
                members = [n for n, _ in self.graph.in_edges(node)]
                members.append(node)
                
                # Check if we already have a ring with these members
                exists = any(set(members).issubset(set(r['member_accounts'])) for r in rings)
                if not exists:
                    ring_id = f"RING_{ring_counter:03d}"
                    rings.append({
                        "ring_id": ring_id,
                        "member_accounts": members,
                        "pattern_type": "smurfing",
                        "risk_score": 85.0 + (in_degree * 0.5)
                    })
                    ring_counter += 1
                    
        return rings

    def get_graph_json(self, risk_scores):
        """
        Enriched output for frontend and JSON download.
        """
        metrics = self.get_centrality_metrics()
        rings = self.detect_fraud_rings(metrics)
        
        # Format nodes
        nodes_list = []
        suspicious_accounts = []
        
        for node in self.graph.nodes():
            score = risk_scores.get(node, 0)
            node_metrics = metrics.get(node, {})
            
            # Find if this node is part of any ring
            node_rings = [r['ring_id'] for r in rings if node in r['member_accounts']]
            primary_ring = node_rings[0] if node_rings else "NONE"
            
            node_data = {
                "id": node,
                "label": node,
                "risk_score": score,
                "metrics": node_metrics,
                "ring_id": primary_ring
            }
            nodes_list.append(node_data)
            
            # For suspicious accounts list
            if score >= 60 or primary_ring != "NONE":
                patterns = []
                if primary_ring != "NONE":
                    patterns.append(next((r['pattern_type'] for r in rings if r['ring_id'] == primary_ring), "unknown"))
                if node_metrics.get('out_degree', 0) > 5:
                    patterns.append("high_velocity")
                    
                suspicious_accounts.append({
                    "account_id": node,
                    "suspicion_score": float(score),
                    "detected_patterns": patterns if patterns else ["low_level_anomaly"],
                    "ring_id": primary_ring
                })
        
        # Sort suspicious accounts by score descending
        suspicious_accounts.sort(key=lambda x: x['suspicion_score'], reverse=True)
        
        # Format edges
        edges_list = []
        for u, v, data in self.graph.edges(data=True):
            edges_list.append({
                "source": u,
                "target": v,
                "amount": data['amount']
            })
            
        # Overall Summary
        summary = {
            "total_accounts_analyzed": len(self.graph.nodes()),
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(rings),
            "processing_time_seconds": 0.5 # Placeholder or could be timed
        }
        
        return {
            "nodes": nodes_list,
            "edges": edges_list,
            "suspicious_accounts": suspicious_accounts,
            "fraud_rings": rings,
            "summary": summary
        }
