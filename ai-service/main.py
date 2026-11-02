"""
SmartSpend AI Microservice
FastAPI-based AI service for transaction categorization, anomaly detection, and spending prediction.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import logging
import re
from datetime import datetime, date

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SmartSpend AI Service",
    description="AI-powered transaction categorization, anomaly detection, and spending prediction",
    version="1.0.0"
)

# CORS for Spring Boot backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class CategorizeRequest(BaseModel):
    description: str
    amount: float
    userId: Optional[int] = None

class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    alternativeCategories: List[str]

class AnomalyRequest(BaseModel):
    userId: int
    amount: float
    category: str
    recentTransactions: Optional[List[Dict]] = []

class AnomalyResponse(BaseModel):
    isAnomaly: bool
    anomalyScore: float
    reason: Optional[str] = None

class PredictionRequest(BaseModel):
    userId: int
    historicalData: List[Dict]  # [{month, year, category, amount}]

class PredictionResponse(BaseModel):
    predictions: Dict[str, float]
    totalPredicted: float
    confidence: str
    message: str

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str

# ============================================================
# TRANSACTION CATEGORIZATION ENGINE
# ============================================================

# Keyword-based categorization rules (Indian context)
CATEGORY_RULES = {
    "Food & Dining": [
        "zomato", "swiggy", "restaurant", "hotel", "cafe", "coffee", "tea",
        "pizza", "burger", "food", "dining", "meal", "lunch", "dinner",
        "breakfast", "bakery", "dominos", "kfc", "mcdonalds", "biryani",
        "dhabha", "canteen", "tiffin", "mess"
    ],
    "Transportation": [
        "uber", "ola", "rapido", "metro", "bus", "auto", "rickshaw",
        "taxi", "cab", "travel", "petrol", "diesel", "fuel", "parking",
        "toll", "irctc", "railway", "train", "flight", "airline", "indigo",
        "airindia", "spicejet"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa",
        "mall", "store", "shop", "purchase", "buy", "order", "delivery",
        "market", "bazaar", "retail", "clothes", "fashion", "shoes"
    ],
    "Utilities": [
        "electricity", "water", "gas", "internet", "wifi", "broadband",
        "jio", "airtel", "bsnl", "vodafone", "vi", "mobile", "recharge",
        "bill", "utility", "pipe", "tata sky", "dth"
    ],
    "Healthcare": [
        "hospital", "clinic", "doctor", "medicine", "pharmacy", "chemist",
        "medical", "health", "dental", "eye", "test", "lab", "apollo",
        "fortis", "max", "aiims", "prescription", "tablet", "injection"
    ],
    "Education": [
        "school", "college", "university", "course", "tuition", "class",
        "fees", "book", "stationery", "exam", "udemy", "coursera",
        "coaching", "academy", "institute", "library"
    ],
    "Entertainment": [
        "netflix", "amazon prime", "hotstar", "disney", "spotify", "youtube",
        "movie", "cinema", "pvr", "inox", "game", "gaming", "concert",
        "event", "ticket", "amusement", "park", "fun"
    ],
    "Groceries": [
        "bigbasket", "grofers", "blinkit", "zepto", "supermarket", "grocery",
        "vegetables", "fruits", "milk", "bread", "rice", "dal", "atta",
        "sabzi", "kirana", "dmart", "reliance fresh"
    ],
    "Rent & Housing": [
        "rent", "house", "apartment", "flat", "pg", "hostel", "maintenance",
        "society", "landlord", "tenant", "deposit", "lease"
    ],
    "Investment & Savings": [
        "mutual fund", "sip", "fd", "fixed deposit", "rd", "recurring",
        "shares", "stocks", "zerodha", "groww", "upstox", "insurance",
        "lic", "policy", "ppf", "epf", "nps"
    ],
    "Personal Care": [
        "salon", "barber", "haircut", "spa", "gym", "fitness", "yoga",
        "cosmetics", "beauty", "grooming", "parlour"
    ],
    "Transfers": [
        "transfer", "upi", "neft", "rtgs", "imps", "gpay", "phonepe",
        "paytm", "bhim", "sent to", "received from"
    ]
}

def categorize_transaction(description: str, amount: float) -> tuple:
    """Categorize transaction based on keyword matching with confidence score."""
    desc_lower = description.lower()
    
    category_scores = {}
    for category, keywords in CATEGORY_RULES.items():
        score = 0
        for keyword in keywords:
            if keyword in desc_lower:
                # Longer keyword match = higher confidence
                score += len(keyword) / len(desc_lower) * 10
        if score > 0:
            category_scores[category] = min(score, 1.0)
    
    if not category_scores:
        # Default based on amount ranges
        if amount < 100:
            return "Food & Dining", 0.4, ["Transportation", "Personal Care"]
        elif amount > 10000:
            return "Rent & Housing", 0.3, ["Investment & Savings", "Shopping"]
        else:
            return "Shopping", 0.3, ["Utilities", "Food & Dining"]
    
    # Sort by score
    sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    top_category = sorted_categories[0][0]
    confidence = min(sorted_categories[0][1], 0.98)
    alternatives = [c[0] for c in sorted_categories[1:4]]
    
    return top_category, confidence, alternatives

# ============================================================
# ANOMALY DETECTION ENGINE
# ============================================================

# Store in-memory user spending history for anomaly detection
user_spending_history: Dict[int, List[float]] = {}

def detect_transaction_anomaly(user_id: int, amount: float, category: str, recent_txns: List[Dict]) -> tuple:
    """Use statistical methods to detect anomalous transactions."""
    
    amounts = [t.get("amount", 0) for t in recent_txns if t.get("amount", 0) > 0]
    
    if len(amounts) < 5:
        # Not enough data - use simple threshold
        is_anomaly = amount > 50000  # Very large amount
        score = 0.9 if is_anomaly else 0.1
        reason = "Very large transaction amount" if is_anomaly else None
        return is_anomaly, score, reason
    
    amounts_arr = np.array(amounts).reshape(-1, 1)
    
    # Use Isolation Forest
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(amounts_arr)
    
    prediction = clf.predict([[amount]])[0]
    score = clf.score_samples([[amount]])[0]
    
    # Normalize score to 0-1 range
    normalized_score = max(0, min(1, (score + 0.5) * -1))
    
    is_anomaly = prediction == -1
    
    reason = None
    if is_anomaly:
        mean_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        if amount > mean_amount + 2 * std_amount:
            reason = f"Amount ₹{amount:.0f} is significantly higher than your usual {category} spending of ₹{mean_amount:.0f}"
        elif amount < mean_amount - 2 * std_amount:
            reason = f"Unusually low amount for {category}"
    
    return is_anomaly, normalized_score, reason

# ============================================================
# SPENDING PREDICTION ENGINE
# ============================================================

def predict_spending(historical_data: List[Dict]) -> Dict:
    """Predict next month's spending by category using linear regression."""
    
    if not historical_data:
        return {}, 0.0
    
    df = pd.DataFrame(historical_data)
    
    if "category" not in df.columns or "amount" not in df.columns:
        return {}, 0.0
    
    predictions = {}
    categories = df["category"].unique()
    
    for category in categories:
        cat_data = df[df["category"] == category].copy()
        
        if len(cat_data) < 2:
            # Not enough data, use average
            predictions[category] = float(cat_data["amount"].mean())
            continue
        
        # Create time index
        cat_data = cat_data.sort_values(["year", "month"] if "year" in cat_data.columns else ["month"])
        X = np.arange(len(cat_data)).reshape(-1, 1)
        y = cat_data["amount"].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next period
        next_period = np.array([[len(cat_data)]])
        predicted = max(0, float(model.predict(next_period)[0]))
        predictions[category] = round(predicted, 2)
    
    return predictions

# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )

@app.post("/categorize", response_model=CategorizeResponse)
async def categorize(request: CategorizeRequest):
    """Categorize a transaction based on its description and amount."""
    try:
        logger.info(f"Categorizing: {request.description[:50]}...")
        category, confidence, alternatives = categorize_transaction(
            request.description, 
            request.amount
        )
        return CategorizeResponse(
            category=category,
            confidence=round(confidence, 3),
            alternativeCategories=alternatives
        )
    except Exception as e:
        logger.error(f"Categorization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-anomaly", response_model=AnomalyResponse)
async def detect_anomaly(request: AnomalyRequest):
    """Detect if a transaction is anomalous."""
    try:
        logger.info(f"Anomaly detection for user {request.userId}, amount: {request.amount}")
        is_anomaly, score, reason = detect_transaction_anomaly(
            request.userId,
            request.amount,
            request.category,
            request.recentTransactions or []
        )
        return AnomalyResponse(
            isAnomaly=is_anomaly,
            anomalyScore=round(score, 4),
            reason=reason
        )
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-spending", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Predict next month's spending by category."""
    try:
        logger.info(f"Predicting spending for user {request.userId}")
        predictions = predict_spending(request.historicalData)
        total = sum(predictions.values())
        
        data_points = len(request.historicalData)
        confidence = "High" if data_points >= 30 else "Medium" if data_points >= 10 else "Low"
        
        return PredictionResponse(
            predictions=predictions,
            totalPredicted=round(total, 2),
            confidence=confidence,
            message=f"Prediction based on {data_points} historical transactions. Confidence: {confidence}"
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories")
async def get_categories():
    """Get list of all supported transaction categories."""
    return {"categories": list(CATEGORY_RULES.keys())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
