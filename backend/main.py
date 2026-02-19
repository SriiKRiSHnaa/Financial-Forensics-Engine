from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from graph_engine import GraphEngine
from risk_scoring import RiskScorer
from ai_explainer import generate_ai_explanation

app = FastAPI(title="Financial Forensics Engine API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for the current graph state (in-memory for hackathon)
current_state = {
    "graph": None,
    "metrics": {},
    "risk_scores": {}
}

engine = GraphEngine()

class ExplainRequest(BaseModel):
    node_id: str
    risk_score: int
    metrics: dict

@app.get("/")
async def root():
    return {"status": "Engine Running", "version": "1.0.0"}

@app.post("/upload-transactions")
async def upload_transactions(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        csv_text = content.decode('utf-8')
        
        # Build graph
        graph = engine.build_graph_from_csv(csv_text)
        metrics = engine.get_centrality_metrics()
        risk_scores = RiskScorer.calculate_risk_scores(graph, metrics)
        
        # Save state
        current_state["graph"] = graph
        current_state["metrics"] = metrics
        current_state["risk_scores"] = risk_scores
        
        # Return graph JSON for visualization
        return engine.get_graph_json(risk_scores)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.post("/explain-node")
async def explain_node(req: ExplainRequest):
    explanation = generate_ai_explanation(req.node_id, req.risk_score, req.metrics)
    return {"explanation": explanation}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
