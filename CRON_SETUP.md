# 🕐 Automated Lead Distribution Setup

## Overview

The system now has **3 ways** to distribute leads:

1. **On Registration** - New users get leads immediately
2. **On Plan Upgrade** - Users get leads when they change plans
3. **Daily Cron Job** - Automatic distribution at 12 midnight PH time

---

## Cron Job Configuration

### Schedule
- **Time:** 12:00 AM (midnight) Philippine Time
- **UTC Time:** 16:00 (4 PM UTC)
- **Cron Expression:** `0 16 * * *`
- **Frequency:** Every day

### What It Does
- Runs at midnight PH time
- Distributes leads to ALL active wholesalers
- Each wholesaler gets leads based on their plan:
  - **Free:** 1 lead (only on Mondays)
  - **Basic:** 1 lead/day
  - **Elite:** 5 leads/day
  - **Pro:** 10 leads/day

---

## Environment Variable Required

Add this to your Vercel project:

```
CRON_SECRET=your-random-secret-here
```

**To generate a secure secret:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string generator
```

### How to Set in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `CRON_SECRET`
   - **Value:** Your generated secret
   - **Environment:** Production, Preview, Development
5. Click **Save**
6. **Redeploy** your project

---

## How It Works

### 1. On Registration
```javascript
// api/auth/register.js
// After user is created, distribute initial leads
await distributeLeadsToUser(userId);
```

### 2. On Plan Upgrade
```javascript
// api/admin/users.js (PATCH)
// After plan is updated, distribute leads immediately
await distributeLeadsToUser(userId);
```

### 3. Daily Cron (Automated)
```javascript
// api/cron/distribute.js
// Vercel calls this endpoint daily at 12 midnight PH time
// Distributes to ALL active wholesalers
```

---

## Testing the Cron Job

### Manual Test (Before Deployment)
You can test the cron endpoint manually:

```bash
curl -X POST https://your-app.vercel.app/api/cron/distribute \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Check Cron Logs in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Click on latest deployment
4. Go to **Functions** tab
5. Find `api/cron/distribute`
6. View logs to see execution history

---

## Distribution Logic

### Sequential Assignment
Each wholesaler has a `lead_sequence_position` that tracks where they are in the lead list.

**Example:**
```
Leads: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10

Day 1 (12 midnight):
- User A (Basic, position: 0) → Gets lead #1, position becomes 1
- User B (Elite, position: 0) → Gets leads #1-#5, position becomes 5

Day 2 (12 midnight):
- User A (position: 1) → Gets lead #2, position becomes 2
- User B (position: 5) → Gets leads #6-#10, position becomes 10

Day 3 (12 midnight):
- User A (position: 2) → Gets lead #3, position becomes 3
- User B (position: 10) → Gets leads #1-#5 (wraps around), position becomes 5
```

### Duplicate Prevention
- System checks if user already has a lead before assigning
- Same lead can go to multiple wholesalers
- Each wholesaler progresses independently

---

## Important Notes

### Cron Job Limitations
- **Vercel Hobby Plan:** Cron jobs are available but limited
- **Vercel Pro Plan:** Full cron job support with monitoring
- **Execution Time:** Max 10 seconds on Hobby, 60 seconds on Pro

### If Cron Fails
- Check Vercel function logs
- Verify `CRON_SECRET` is set correctly
- Ensure leads exist in database
- Check if wholesalers are active

### Free Plan Users
- Free users only get leads on **Mondays**
- The cron job checks if today is Monday before distributing to free users
- Other days, free users are skipped

---

## Monitoring

### What to Monitor
1. **Cron execution logs** - Check if it runs daily
2. **Lead distribution count** - How many leads were assigned
3. **Failed assignments** - Any errors in distribution
4. **User sequence positions** - Ensure they're incrementing

### Success Indicators
- Cron runs at 12 midnight PH time daily
- All active wholesalers receive leads
- No duplicate assignments
- Sequence positions update correctly

---

## Future Enhancements

- [ ] Email notifications when leads are distributed
- [ ] Slack/Discord webhook notifications
- [ ] Distribution analytics dashboard
- [ ] Retry logic for failed distributions
- [ ] Lead expiration (auto-archive old leads)
- [ ] Custom distribution schedules per user

---

## Troubleshooting

### Cron not running?
1. Check if `CRON_SECRET` is set in Vercel
2. Verify cron schedule in `vercel.json`
3. Check Vercel function logs for errors
4. Ensure project is deployed to production

### No leads distributed?
1. Check if leads exist in database
2. Verify wholesalers are active (`subscription_status = 'active'`)
3. Check if users have valid plans
4. Review function logs for errors

### Users not getting leads?
1. Verify user's `plan_type` is correct
2. Check if user already has the lead
3. Ensure `lead_sequence_position` is updating
4. Check if there are enough leads in the system

---

## Summary

✅ **Registration:** User gets leads immediately  
✅ **Plan Upgrade:** User gets leads when plan changes  
✅ **Daily Cron:** All users get leads at 12 midnight PH time  
✅ **Manual:** Admin can still manually distribute via "Distribute Now" button

**The system is now fully automated!** 🚀
