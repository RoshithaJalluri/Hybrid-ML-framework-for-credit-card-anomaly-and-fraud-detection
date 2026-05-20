# FraudGuard AI – Intelligent Credit Card Fraud Detection Platform

**Real-time AI-powered fraud detection using hybrid anomaly detection**

## 🎯 Project Overview

A full-stack AI fraud detection platform that combines supervised and unsupervised learning to detect both known and unknown fraud patterns in real-time.

## 🏗️ System Architecture

```
[ React Frontend ]
        |
        v
[ Node.js API Gateway ]
        |
        +--> MongoDB (Transactions, Users, Predictions)
        |
        +--> Python ML Service
              |
              v
      Hybrid Fraud Detection Model
```

## 🔥 Hybrid ML Model

- **Unsupervised**: Autoencoder + Isolation Forest
- **Supervised**: XGBoost + Random Forest
- **Ensemble**: Weighted combination for final fraud score

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide, or [SETUP.md](SETUP.md) for detailed instructions.

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB 4.4+

### Installation

1. **Install Dependencies**
```bash
npm install
cd frontend && npm install && cd ..
cd ml-service && pip install -r requirements.txt && cd ..
```

2. **Setup Environment**
```bash
# Copy and edit .env files
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
```

3. **Generate Dataset & Train Models**
```bash
cd ml-service
python generate_dataset.py  # Creates ~300k transactions
python train.py              # Trains all models
cd ..
```

4. **Start Services**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: ML Service
cd ml-service && python app.py

# Terminal 3: Frontend
cd frontend && npm start
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service: http://localhost:5000

## 📊 Portals

1. **Transaction Monitoring Portal** - Live fraud detection and alerts
2. **AI Engineer Portal** - Model training, evaluation, and deployment
3. **Admin Portal** - User management and system configuration
4. **Bank Analyst Portal** - Fraud trends, reports, and analytics

## 🗄️ Database Schema

- **Users**: Authentication, roles (ADMIN, ANALYST, AI_ENGINEER, MONITOR)
- **Transactions**: Transaction data with metadata
- **Predictions**: ML predictions, risk scores, and model breakdowns

## 🔐 Security Features

- JWT authentication with 7-day expiration
- Role-based access control (RBAC)
- API rate limiting (100 requests/15min)
- Password hashing with bcrypt
- Secure session management

## 🎨 UI Design

- Dark fintech theme (#0F172A background)
- Color-coded risk levels
- Real-time charts and visualizations
- Responsive design

## 📈 Features

- ✅ Real-time fraud detection
- ✅ Hybrid ML ensemble (4 models)
- ✅ Risk scoring (0-100)
- ✅ Transaction monitoring
- ✅ Model training interface
- ✅ Analytics and reporting
- ✅ User management
- ✅ CSV dataset generation

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

**Frontend:**
- React 18
- React Router
- Recharts for visualizations

**ML Service:**
- Python + Flask
- TensorFlow/Keras (Autoencoder)
- Scikit-learn (Isolation Forest, Random Forest)
- XGBoost

## 📝 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction + prediction
- `GET /api/predictions` - Get predictions
- `POST /api/ml/train` - Train models
- `GET /api/analytics/fraud-trends` - Fraud trends

See backend routes for complete API documentation.

## 🧪 Testing

1. Generate test dataset: `python ml-service/generate_dataset.py`
2. Train models: `python ml-service/train.py`
3. Create test transaction via API or frontend
4. Check predictions in dashboard

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide

## 🤝 Contributing

This is an academic project. For production use, consider:
- Enhanced feature engineering
- Real-time streaming support
- Model versioning and A/B testing
- Advanced explainability
- Production-grade security hardening

## 📄 License

MIT License - Academic/Educational Use

