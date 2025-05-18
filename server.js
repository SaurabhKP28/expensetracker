require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const leaderboardRoutes = require('./routes/leaderboard');
const passwordRoutes = require('./routes/password');
const paymentRoutes = require('./routes/payment');
const s3Routes = require('./routes/s3');

const app = express();
const PORT = process.env.PORT || 3000;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

// 🔐 CSP Nonce Middleware
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// 🛡️ Security Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

// 🪪 Helmet with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// 📦 API Routes
app.use('/auth', authRoutes);
app.use('/expense', expenseRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/password', passwordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/s3', s3Routes);

// 🌐 HTML Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  const filePath = path.join(__dirname, "public", "signup.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error loading signup page");
    const pageWithNonce = data.replace('{{NONCE}}', res.locals.nonce);
    res.send(pageWithNonce);
  });
});

app.get("/expense", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "expense.html"));
});

app.get("/expenses", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "expenses.html"));
});

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forgot-password.html"));
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reset-password.html"));
});

// 🔗 Start Secure Server
sequelize.sync()
  .then(() => {
    console.log('✅ Database connected successfully');
    httpsServer.listen(PORT, () => {
      console.log(`🚀 Server running securely on https://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });
