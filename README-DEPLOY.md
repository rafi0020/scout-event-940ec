# 🚀 Scout Event - Ready for Netlify Deployment

This project is **100% ready** for one-click deployment on Netlify. No manual configuration needed!

## ⚡ Quick Deploy (2 minutes)

### 1. Get a Database (Free)
Choose one:
- **[Neon](https://neon.tech)** (Recommended) - Free PostgreSQL
- **[Supabase](https://supabase.com)** - Free PostgreSQL + Auth
- **[Railway](https://railway.app)** - Free PostgreSQL

### 2. Deploy to Netlify
1. **Fork this repo** to your GitHub
2. **Go to [netlify.com](https://netlify.com)**
3. **Click "New site from Git"**
4. **Select your forked repository**
5. **Add environment variables** (see below)
6. **Click "Deploy site"**

### 3. Set Environment Variables
In Netlify dashboard → Site settings → Environment variables:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-32-chars-min
SESSION_SECRET=your-session-secret-key-32-chars-min
ADMIN_EMAIL=admin@scout.event
ADMIN_PASSWORD=Scout2025Admin!
OPENAI_API_KEY=your-openai-key-optional
```

### 4. Initialize Database
After deployment, visit: `https://your-site.netlify.app/.netlify/functions/setup-db`

**That's it!** Your Scout Event platform is live! 🎉

## 🎯 What You Get

- ✅ **Admin Dashboard** - Manage events, activities, teams
- ✅ **Team Registration** - Teams can register and participate
- ✅ **Activity System** - Multiple question types (MCQ, True/False, etc.)
- ✅ **Leaderboard** - Real-time scoring and rankings
- ✅ **Responsive Design** - Works on all devices
- ✅ **Secure Authentication** - JWT-based auth system
- ✅ **Database Management** - Prisma ORM with PostgreSQL

## 🔧 Default Login

- **Admin Email:** admin@scout.event
- **Admin Password:** Scout2025Admin!

## 📱 Features

### For Admins
- Create and manage events
- Add activities with questions
- Monitor team submissions
- View leaderboards
- Export data
- Manage teams

### For Teams
- Register with team code
- Participate in activities
- View real-time leaderboard
- Submit answers
- Track progress

## 🛠️ Customization

### Change Branding
- Edit `src/app/layout.tsx` for site title
- Update `src/app/globals.css` for colors/styling
- Modify components in `src/components/`

### Add Questions
- Use the admin dashboard
- Or edit `src/lib/seed.ts` for bulk import

### Database Schema
- Edit `prisma/schema.prisma`
- Changes auto-deploy on next build

## 🚨 Troubleshooting

### Build Fails?
- Check all environment variables are set
- Verify DATABASE_URL is correct
- Check Netlify build logs

### Database Issues?
- Test connection at setup function
- Verify database allows external connections
- Check database provider status

### Site Not Working?
- Check function logs in Netlify dashboard
- Verify environment variables
- Test database connection

## 📊 Monitoring

- **Netlify Analytics** - Site performance
- **Function Logs** - API debugging
- **Database Logs** - Query performance

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Netlify auto-deploys
3. Database migrations run automatically

---

**Ready to deploy?** Just fork, connect to Netlify, add environment variables, and you're live! 🚀
