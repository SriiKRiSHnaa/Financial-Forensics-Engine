class RiskScorer:
    @staticmethod
    def calculate_risk_scores(graph, metrics):
        """
        Optimized Risk Scoring for Demo.
        Factors:
        1. Velocity of Flow (In vs Out balance) - 100%
        """
        risk_scores = {}
        
        for node in graph.nodes():
            m = metrics.get(node, {})
            
            # Flow Intensity (Smurfing or Layering)
            # A node receiving many small hits but dumping one large one is a high-risk hub.
            in_d = m.get('in_degree', 0)
            out_d = m.get('out_degree', 0)
            velocity_score = 0
            if in_d > 1 and out_d >= 1:
                velocity_score = 30 # High activity
            if in_d > 5 and out_d == 1:
                velocity_score += 40 # Classic Smurfing collector
                
            # Composite
            raw_score = velocity_score
            
            # Scale and Normalize
            # For the demo, we want some nodes to definitely hit the "Red" zone (>70)
            if raw_score >= 70:
                raw_score = 85 # Boost critical threats
            
            final_score = int(min(max(raw_score, 0), 100))
            risk_scores[node] = final_score
            
        return risk_scores
