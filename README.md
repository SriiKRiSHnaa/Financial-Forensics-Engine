# Financial Forensics Engine — Money Muling Detection Platform

A complete hackathon-ready platform for detecting suspicious multi-hop transaction networks and potential money muling activity.

## 🚀 Features
- **Graph Analytics**: Powered by NetworkX (Degree Centrality, PageRank, Betweenness).
- **Mule Risk Scoring**: Automated logic to rank nodes by suspicious behavior.
- **Interactive Visualization**: Real-time graph rendering with Cytoscape.js.
- **AI Risk Insights**: Simulated LLM explanations for detected anomalies.
- **Dark Fintech UI**: High-performance dashboard built with React and Tailwind.

## 📁 Structure
- `/backend`: Python FastAPI service.
- `/frontend`: React + Vite application.
- `/data`: Sample CSV transaction data.

## 🛠️ Setup Instructions

### Backend
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```
   *Runs on http://localhost:8000*

### Frontend
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Runs on http://localhost:3000*

## 📊 Sample Data
Use the provided `data/transactions.csv` to test the platform. Nodes with high betweenness and cascading flows will be flagged as **High Risk (Red)**.
