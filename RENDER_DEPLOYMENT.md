# Deploy Backend on Render

## Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure `render.yaml` is in backend folder

## Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

## Step 3: Deploy Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: experts15-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Step 4: Environment Variables
Add these in Render dashboard:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/experts15
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
FRONTEND_URL=https://experts15.in
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
OTP_TTL_MINUTES=10
```

## Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your API will be at: `https://your-service-name.onrender.com`

## Step 6: Update Frontend
Update frontend API URL to your Render URL:
```javascript
// In frontend/src/services/api.js
const API_BASE_URL = 'https://your-service-name.onrender.com/api'
```

## Step 7: Initialize Database
Run this once after deployment:
```bash
# SSH into Render service or run locally with production DB
node scripts/createPackages.js
```

## Important Notes
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30+ seconds
- Upgrade to paid plan for production use
- Monitor logs in Render dashboard