from graph_engine import GraphEngine
from risk_scoring import RiskScorer
import json

def quick_test():
    engine = GraphEngine()
    csv_text = "sender_id,receiver_id,amount,timestamp\nU1,U2,100,2025-01-01\nU2,U1,100,2025-01-02"
    graph = engine.build_graph_from_csv(csv_text)
    metrics = engine.get_centrality_metrics()
    risk_scores = RiskScorer.calculate_risk_scores(graph, metrics)
    result = engine.get_graph_json(risk_scores)
    
    print(f"Nodes: {len(result['nodes'])}")
    print(f"Rings: {len(result['fraud_rings'])}")
    print(f"Sample Node Metrics (should NOT have PageRank): {result['nodes'][0]['metrics'].keys()}")

if __name__ == "__main__":
    quick_test()
