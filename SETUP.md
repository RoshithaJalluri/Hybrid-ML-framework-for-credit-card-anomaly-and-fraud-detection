# FraudGuard AI - Setup Guide

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **MongoDB** 4.4+ (running locally or connection string)

> ⚠️ **MongoDB Connection Issues?** See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed setup instructions.

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install ML Service Dependencies

```bash
cd ml-service

cd ..
```

### 4. Setup Environment Variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/fraudguard
JWT_SECRET=your-secret-key-change-this-in-production
ML_SERVICE_URL=http://localhost:5000
PORT=3001
```

**ML Service** (`ml-service/.env`):
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

### 5. Generate Dataset

```bash
cd ml-service
python generate_dataset.py
cd ..
```

This creates `ml-service/data/transactions.csv` with ~300,000 transactions.

### 6. Train Initial Models

```bash
cd ml-service
python train.py
cd ..
```

This will train all models and save them in `ml-service/models/`.

### 7. Start Services

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

### 8. Create Initial Users

You can create users via the Admin portal after logging in, or use the API:

```bash
# Create Admin user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fraudguard.ai",
    "password": "admin123",
    "name": "Admin User",
    "role": "ADMIN"
  }'

# Create Analyst user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@fraudguard.ai",
    "password": "analyst123",
    "name": "Bank Analyst",
    "role": "ANALYST"
  }'

# Create AI Engineer user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@fraudguard.ai",
    "password": "engineer123",
    "name": "AI Engineer",
    "role": "AI_ENGINEER"
  }'
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **ML Service**: http://localhost:5000

## Default Login Credentials

- **Admin**: admin@fraudguard.ai / admin123
- **Analyst**: analyst@fraudguard.ai / analyst123
- **AI Engineer**: engineer@fraudguard.ai / engineer123

## Project Structure

```
fraudguard-ai/
├── backend/          # Node.js API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middlewares/  # Auth middleware
│   └── app.js        # Main server file
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/    # Portal pages
│   │   ├── components/
│   │   └── services/
├── ml-service/       # Python ML service
│   ├── models/       # Trained models
│   ├── data/         # Dataset
│   ├── app.py        # Flask server
│   ├── train.py      # Training script
│   └── generate_dataset.py
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check your connection string
- Default connection: `mongodb://localhost:27017/fraudguard`

### ML Service Not Responding
- Check if Python dependencies are installed
- Ensure models are trained (run `python train.py`)
- Check port 5000 is available

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)

## Next Steps

1. Generate dataset: `python ml-service/generate_dataset.py`
2. Train models: `python ml-service/train.py`
3. Start all services
4. Login and explore the portals!

