# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..

# ML Service
cd ml-service && pip install -r requirements.txt && cd ..
```

### 2. Setup Environment

Copy `.env.example` files and update:

```bash
# Backend
cp backend/.env.example backend/.env

# ML Service  
cp ml-service/.env.example ml-service/.env
```

### 3. Generate & Train

```bash
# Generate dataset
cd ml-service
python generate_dataset.py

# Train models
python train.py
cd ..
```

### 4. Start Services

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
cd ml-service && python app.py
```

**Terminal 3:**
```bash
cd frontend && npm start
```

### 5. Create Admin User

Visit http://localhost:3001/api/auth/register or use the Admin portal after first login.

### 6. Access Application

Open http://localhost:3000 and login!

---

**Note**: Make sure MongoDB is running before starting the backend.

