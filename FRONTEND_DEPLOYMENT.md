# Deploy Frontend on Netlify

## Step 1: Build Frontend
```bash
cd frontend
npm install
npm run build
```

## Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

## Step 3: Environment Variables
Add in Netlify dashboard under Site settings → Environment variables:
```
VITE_API_URL=https://experts15backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_RfzCjbS5iBMfVc
```

## Step 4: Update Backend CORS
Your backend is already configured to allow:
- https://experts15.netlify.app
- https://main--experts15.netlify.app

## Step 5: Test Connection
After deployment, test these endpoints:
- Frontend: https://your-site-name.netlify.app
- Backend API: https://experts15backend.onrender.com/api

## Alternative: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

Your frontend will be available at: https://your-project.vercel.app