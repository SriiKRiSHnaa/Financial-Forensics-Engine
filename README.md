# Financial Forensics Engine — Money Muling Detection Platform

A complete platform for detecting suspicious multi-hop transaction networks and potential money muling activity using advanced graph algorithms.

## 🚀 Features
- **Graph Analytics**: Specialized detectors for Cycles, Shell Chains, and Smurfing.
- **Dynamic Risk Scoring**: Real-time heuristic scoring based on network topology and flow velocity.
- **Interactive Visualization**: High-performance graph rendering with Cytoscape.js.
- **Deduplication Engine**: Results are filtered to prioritize high-level patterns (Cycles) over sub-paths.

## 📁 Structure
- `/backend`: Python FastAPI service implementing the `GraphEngine`.
- `/frontend`: React + Vite dashboard.
- `/data`: Sample CSV datasets for verification.

## 🛠️ Algorithm Approach

### 1. Cycle Detection (Circular Fund Routing)
- **Logic**: Identifies closed loops of transactions where funds return to the origin or a close associate.
- **Constraints**: Specifically targets directed cycles of length **3, 4, and 5**.
- **Normalization**: Cycles are lexicographically rotated to ensure `[A, B, C]` and `[B, C, A]` are treated as a single entity.
- **Complexity**: $O(V \cdot d^{k-1})$, where $V$ is the number of nodes, $d$ is the average degree, and $k=5$. The fixed depth limit ensures high performance even on large datasets.

### 2. Layered Shell Network Detection
- **Logic**: Detects multi-hop chains (length $\ge 4$) passing through "shell" accounts.
- **Heuristic**: An intermediate node is flagged as a "shell" only if:
    1. It has low transaction volume (2–4 total).
    2. It exhibits **High Pass-through**: Incoming amount matches outgoing amount (within 20% tolerance).
- **Complexity**: $O(V \cdot d^k)$ with $k=6$. The strong pruning by the shell heuristic (ignoring 95%+ of normal nodes) significantly reduces practical execution time.

### 3. Smurfing Pattern Detection (Fan-in / Fan-out)
- **Logic**: Identifies "Aggregators" (many-to-one) and "Dispersers" (one-to-many).
- **Temporal Analysis**: Uses a **72-hour sliding window** to identify clusters of activity.
- **Threshold**: Requires **5+ unique participants** within the window to trigger a flag.
- **Complexity**: $O(V \cdot T \log T)$, where $T$ is the number of transactions per hub. This is dominated by the timestamp sorting required for the sliding window calculation.

---

## 🛠️ Setup Instructions

### Backend
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `python main.py`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## 📊 Sample Data
Use the provided `data/money_muling_test_dataset.csv` to test the platform. The system will automatically detect the three archetypes described above and assign risk scores.
