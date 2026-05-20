const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB Connection
const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hemanthjanapana:hemu4125@cluster0.fsdukc9.mongodb.net/fraudguard';

    if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not set in .env file, using default: mongodb://localhost:27017/fraudguard');
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        const displayURI = MONGODB_URI.replace(/\/\/.*@/, '//***@');
        console.log('✅ MongoDB Connected:', displayURI);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n📋 To fix this issue:');
        console.log('1. Make sure MongoDB is installed and running');
        console.log('2. Start MongoDB service:');
        console.log('   Windows: net start MongoDB (or start MongoDB service from Services)');
        console.log('   Mac/Linux: sudo systemctl start mongod (or mongod)');
        console.log('3. Or use MongoDB Atlas (cloud): Update MONGODB_URI in backend/.env file');
        console.log('4. Check connection string:', MONGODB_URI);
        console.log('\n⚠️  Server will continue but database operations will fail until MongoDB is connected.\n');
    }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FraudGuard AI API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
