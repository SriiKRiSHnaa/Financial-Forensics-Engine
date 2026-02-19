import networkx as nx
import pandas as pd
from collections import defaultdict
from typing import List, Dict, Set, Tuple
import io

class CycleDetector:
    """
    Detect directed cycles of length 3 to 5 for money muling analysis.
    """

    def __init__(self, edges: List[tuple]):
        """
        edges: List of (sender_id, receiver_id)
        """
        self.graph = defaultdict(set)
        self.nodes = set()

        for u, v in edges:
            self.graph[u].add(v)
            self.nodes.add(u)
            self.nodes.add(v)

        self.cycles = []
        self.seen_cycles = set()

    def normalize_cycle(self, cycle: List[str]) -> tuple:
        """
        Rotate cycle so smallest node lexicographically is first.
        """
        min_index = cycle.index(min(cycle))
        rotated = cycle[min_index:] + cycle[:min_index]
        return tuple(rotated)

    def dfs(self, start, current, depth, path, visited):
        """
        Depth-first search limited to length 5
        """
        visited.add(current)
        path.append(current)

        for neighbor in self.graph[current]:
            # Found cycle
            if neighbor == start and 3 <= len(path) <= 5:
                normalized = self.normalize_cycle(path.copy())
                if normalized not in self.seen_cycles:
                    self.seen_cycles.add(normalized)
                    self.cycles.append(list(normalized))

            # Continue exploring
            if (
                neighbor not in visited
                and depth < 5
                and neighbor > start  # prevents duplicate permutations
            ):
                self.dfs(start, neighbor, depth + 1, path, visited)

        path.pop()
        visited.remove(current)

    def detect_cycles(self) -> List[List[str]]:
        """
        Returns list of cycles (each cycle is list of account IDs)
        """
        for node in sorted(self.nodes):
            self.dfs(node, node, 1, [], set())
        return self.cycles

class ShellNetworkDetector:
    """
    Detect layered shell networks:
    Chains of length >=3 where intermediate nodes
    have low transaction counts (2–3 total).
    """

    def __init__(self, graph: nx.DiGraph):
        self.nx_graph = graph
        self.graph = defaultdict(set)
        self.in_degree = defaultdict(int)
        self.out_degree = defaultdict(int)
        self.in_amount = defaultdict(float)
        self.out_amount = defaultdict(float)
        self.nodes = set()

        # Build graph + degree counts + amount balances
        for u, v, data in graph.edges(data=True):
            self.graph[u].add(v)
            self.out_degree[u] += 1
            self.in_degree[v] += 1
            
            amt = data.get('amount', 0)
            self.out_amount[u] += amt
            self.in_amount[v] += amt
            
            self.nodes.add(u)
            self.nodes.add(v)

        # total transactions per account
        self.total_txn = {
            n: self.in_degree[n] + self.out_degree[n] for n in self.nodes
        }

        self.chains = []
        self.seen_paths = set()

    def is_shell_node(self, node: str) -> bool:
        """
        Refined shell node heuristic:
        1. Total transactions between 2 and 4 (low volume).
        2. High pass-through: outgoing amount is similar to incoming amount (within 20%).
        3. Must be a conduit (at least 1 in, 1 out).
        """
        if self.in_degree[node] < 1 or self.out_degree[node] < 1:
            return False
            
        txn_count = self.total_txn.get(node, 0)
        if not (2 <= txn_count <= 4):
            return False
            
        # Amount balance check (Pass-through logic)
        in_amt = self.in_amount[node]
        out_amt = self.out_amount[node]
        
        if in_amt == 0: return False
        
        balance_ratio = abs(in_amt - out_amt) / max(in_amt, out_amt)
        return balance_ratio <= 0.20 # 20% tolerance

    def normalize_path(self, path: List[str]) -> tuple:
        return tuple(path)

    def dfs(self, start, current, path, visited):
        """
        DFS for chains of length >= 4 nodes (3 hops)
        """
        # Intermediate shell check
        if len(path) > 1: # We are at an intermediate or end node
            # If we are the end of a potential chain (len >= 4)
            if len(path) >= 4:
                # Intermediates are all nodes except first and last
                intermediates = path[1:-1]
                if all(self.is_shell_node(n) for n in intermediates):
                    norm = self.normalize_path(path)
                    if norm not in self.seen_paths:
                        self.seen_paths.add(norm)
                        self.chains.append(path)

        # Stop exploration if too deep
        if len(path) >= 6:
            return

        # Explore neighbors
        for neighbor in self.graph[current]:
            if neighbor in visited:
                continue

            new_visited = visited.copy()
            new_visited.add(neighbor)
            self.dfs(start, neighbor, path + [neighbor], new_visited)

    def detect_shell_chains(self) -> List[List[str]]:
        for node in sorted(self.nodes):
            self.dfs(node, node, [node], {node})
        return self.chains

class SmurfingDetector:
    """
    Detect smurfing patterns (Fan-in / Fan-out):
    Fan-in: 10+ unique senders -> 1 receiver
    Fan-out: 1 sender -> 10+ unique receivers
    Temporal analysis: Transactions within a 72-hour window.
    """

    def __init__(self, graph: nx.DiGraph):
        self.graph = graph

    def get_max_window_participants(self, participants_data: List[tuple]) -> int:
        """
        Calculates the maximum number of unique participants within any 72h window.
        participants_data: List of (participant_id, timestamp_str)
        """
        if not participants_data:
            return 0
            
        # Convert timestamps and sort
        events = []
        for p_id, t_str in participants_data:
            try:
                dt = pd.to_datetime(t_str)
                events.append((dt, p_id))
            except Exception:
                continue
        
        events.sort()
        
        max_unique = 0
        window_size = pd.Timedelta(hours=72)
        
        for i in range(len(events)):
            start_time = events[i][0]
            end_time = start_time + window_size
            
            # Find all unique participants in this window
            unique_in_window = set()
            for j in range(i, len(events)):
                if events[j][0] <= end_time:
                    unique_in_window.add(events[j][1])
                else:
                    break
            
            max_unique = max(max_unique, len(unique_in_window))
            
        return max_unique

    def detect_smurfing(self) -> List[Dict]:
        smurfing_rings = []
        
        for node in sorted(self.graph.nodes()):
            # 1. Fan-in (Aggregator) - Aggregating multiple small deposits
            in_edges = self.graph.in_edges(node, data=True)
            if len(in_edges) >= 5: # Lowered threshold
                participants = []
                for sender, _, data in in_edges:
                    for t in data.get('timestamps', []):
                        participants.append((sender, t))
                
                count = self.get_max_window_participants(participants)
                if count >= 5: # Lowered threshold
                    members = list(set([p[0] for p in participants]))
                    members.append(node)
                    smurfing_rings.append({
                        "member_accounts": members,
                        "pattern_type": "smurfing_fan_in",
                        "risk_score": min(80.0 + (count * 1.5), 100.0)
                    })

            # 2. Fan-out (Disperser) - Quick dispersion to many receivers
            out_edges = self.graph.out_edges(node, data=True)
            if len(out_edges) >= 5: # Lowered threshold
                participants = []
                for _, receiver, data in out_edges:
                    for t in data.get('timestamps', []):
                        participants.append((receiver, t))
                
                count = self.get_max_window_participants(participants)
                if count >= 5: # Lowered threshold
                    members = list(set([p[0] for p in participants]))
                    members.append(node)
                    smurfing_rings.append({
                        "member_accounts": members,
                        "pattern_type": "smurfing_fan_out",
                        "risk_score": min(80.0 + (count * 1.5), 100.0)
                    })
                    
        return smurfing_rings

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
                if 'timestamps' not in self.graph[sender][receiver]:
                    self.graph[sender][receiver]['timestamps'] = []
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
        Identifies money muling rings with deduplication:
        1. Custom Cycle Detection (3-5 hops)
        2. Layered Shell Networks (Chains through low-volume nodes)
        3. Enhanced Smurfing Patterns (Fan-in / Fan-out with 72h window)
        """
        rings = []
        ring_counter = 1
        reported_sets = [] # List of frozensets to track account groups
        
        edges = list(self.graph.edges())

        # 1. Custom Cycle Detection
        cycle_detector = CycleDetector(edges)
        custom_cycles = cycle_detector.detect_cycles()
        
        for cycle in custom_cycles:
            cycle_set = frozenset(cycle)
            # Ensure we don't report permutations of the same cycle
            if cycle_set not in reported_sets:
                ring_id = f"RING_{ring_counter:03d}"
                rings.append({
                    "ring_id": ring_id,
                    "member_accounts": cycle,
                    "pattern_type": "cycle",
                    "risk_score": min(90.0 + (len(cycle) * 0.5), 100.0)
                })
                reported_sets.append(cycle_set)
                ring_counter += 1

        # 2. Layered Shell Network Detection
        shell_detector = ShellNetworkDetector(self.graph)
        shell_chains = shell_detector.detect_shell_chains()

        for chain in shell_chains:
            chain_set = frozenset(chain)
            
            # SUPPRESSION: Check if this chain is already covered by a cycle or a bigger chain
            # 1. Exact match (permutation)
            # 2. Subset (part of a cycle or longer laundering path)
            is_covered = any(chain_set.issubset(rs) for rs in reported_sets)
            
            if not is_covered:
                ring_id = f"RING_{ring_counter:03d}"
                rings.append({
                    "ring_id": ring_id,
                    "member_accounts": chain,
                    "pattern_type": "shell_chain",
                    "risk_score": min(80.0 + (len(chain) * 2.0), 100.0)
                })
                reported_sets.append(chain_set)
                ring_counter += 1
            
        # 3. Enhanced Smurfing Detection
        smurfing_detector = SmurfingDetector(self.graph)
        smurfing_rings = smurfing_detector.detect_smurfing()
        
        for s_ring in smurfing_rings:
            s_set = frozenset(s_ring['member_accounts'])
            
            # Smurfing is a different topology (hub-and-spoke), 
            # but we still check if the EXACT group is already reported.
            if s_set not in reported_sets:
                ring_id = f"RING_{ring_counter:03d}"
                rings.append({
                    "ring_id": ring_id,
                    "member_accounts": s_ring['member_accounts'],
                    "pattern_type": s_ring['pattern_type'],
                    "risk_score": s_ring['risk_score']
                })
                reported_sets.append(s_set)
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
