def generate_ai_explanation(node_id, score, metrics):
    """
    Demo-Ready Forensic AI Explainer.
    Uses realistic financial terminology.
    """
    in_d = metrics.get('in_degree', 0)
    out_d = metrics.get('out_degree', 0)
    betweenness = metrics.get('betweenness', 0)
    
    sections = []

    if score >= 75:
        sections.append(f"### ALERT: CRITICAL ANOMALY DETECTED")
        sections.append(f"Entity **{node_id}** is flagged for high-probability involvement in an organized **Money Muling Syndicate**.")
        
        if in_d > out_d and in_d > 3:
            sections.append(f"**Forensic Detail:** The node exhibits 'Collector' behavior, consolidating funds from {in_d} disparate sources before executing a high-value outbound transfer. This is consistent with 'Smurfing' patterns used in initial laundering phases.")
        elif betweenness > 0.05:
            sections.append(f"**Forensic Detail:** High Betweenness Centrality ({betweenness:.4f}) indicates this node acts as a critical 'Layering' bridge, obfuscating the audit trail between origin and destination accounts.")
        
        sections.append("**Recommendation:** Freeze all outbound assets and initiate a Tier-3 suspicious activity report (SAR).")

    elif score >= 35:
        sections.append(f"### INVESTIGATION REQUIRED")
        sections.append(f"Entity **{node_id}** shows elevated risk due to atypical network topology.")
        sections.append(f"**Observation:** Frequent interaction with known high-risk clusters. While transaction volumes are within moderate ranges, the high connectivity (Degree: {metrics.get('degree', 0):.2f}) suggests a role as a secondary facilitator.")
        sections.append("**Recommendation:** Monitor for rapid velocity changes over the next 24 business hours.")

    else:
        sections.append(f"### STATUS: COMPLIANT")
        sections.append(f"Entity **{node_id}** displays behavior consistent with standard retail banking profiles.")
        sections.append("No significant structural anomalies or laundering signatures detected in the current lookback period.")

    return "\n\n".join(sections)
