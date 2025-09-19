# Scout Event - Netlify Deployment Guide

This project is fully configured for one-click deployment on Netlify.

## 🚀 Quick Deploy (One-Click)

### Option 1: Deploy to Netlify Button
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/scout-event)

### Option 2: Manual Deploy
1. **Fork this repository** to your GitHub account
2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your forked repository
   - Click "Deploy site"

## 🗄️ Database Setup (Required)

### Step 1: Choose a Database Provider
Choose one of these free PostgreSQL providers:

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection string

### Step 2: Configure Environment Variables
In your Netlify dashboard:
1. Go to **Site settings** > **Environment variables**
2. Add these variables:

```
DATABASE_URL=your_postgresql_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production
ADMIN_EMAIL=admin@scout.event
ADMIN_PASSWORD=Scout2025Admin!
OPENAI_API_KEY=your-openai-api-key-here
```

### Step 3: Initialize Database
After deployment, visit: `https://your-site.netlify.app/.netlify/functions/setup-db`

This will:
- Test database connection
- Create default event
- Set up initial data

## 🔧 Configuration

### Build Settings (Auto-configured)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18

### Environment Variables
All required environment variables are documented in `netlify-env-template.txt`

## 🎯 Features Included

- ✅ Next.js 15 with App Router
- ✅ Prisma ORM with PostgreSQL
- ✅ JWT Authentication
- ✅ Admin Dashboard
- ✅ Team Registration
- ✅ Activity Management
- ✅ Leaderboard System
- ✅ Responsive Design
- ✅ Security Headers
- ✅ CORS Configuration

## 🔍 Testing Your Deployment

1. **Visit your site:** `https://your-site.netlify.app`
2. **Test team registration:** Create a new team
3. **Test admin login:** Use admin credentials
4. **Check database:** Verify data is being saved

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your database URL

# Run development server
npm run dev

# Or use Netlify CLI
npm run netlify:dev
```

## 📝 Customization

### Branding
- Edit `src/app/layout.tsx` for site title
- Update `src/app/globals.css` for styling
- Modify `src/components/` for UI changes

### Database Schema
- Edit `prisma/schema.prisma`
- Run `npm run db:push` to update

### Admin Credentials
- Change in Netlify environment variables
- Update `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## 🚨 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify database URL is correct
- Check build logs in Netlify dashboard

### Database Connection Issues
- Verify DATABASE_URL format
- Check database provider status
- Ensure database allows external connections

### Runtime Errors
- Check function logs in Netlify dashboard
- Verify all environment variables
- Test database connection manually

## 📞 Support

If you encounter issues:
1. Check the build logs in Netlify
2. Verify all environment variables
3. Test database connection
4. Check this documentation

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Netlify will automatically rebuild and deploy
3. Database migrations run automatically

---

**Ready to deploy?** Just connect your GitHub repository to Netlify and you're done! 🎉
