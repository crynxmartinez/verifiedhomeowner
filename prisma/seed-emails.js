import prisma from '../lib/prisma.js';

const defaultTemplates = [
  {
    name: 'welcome_email',
    displayName: 'Welcome Email',
    subject: 'Welcome to Verified Homeowner! 🎉',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Verified Homeowner! 🎉</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>Welcome to Verified Homeowner! You're now part of an exclusive network of real estate wholesalers getting verified homeowner leads.</p>
    <p><strong>Here's what to do next:</strong></p>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">✅ Verify your email (check your inbox)</li>
      <li style="margin-bottom: 10px;">📋 Choose a plan that fits your needs</li>
      <li style="margin-bottom: 10px;">🏠 Start receiving qualified leads!</li>
    </ol>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started →</a>
    </div>
    <p style="color: #666;">Questions? Reply to this email - we're here to help!</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

Welcome to Verified Homeowner! You're now part of an exclusive network of real estate wholesalers getting verified homeowner leads.

Here's what to do next:
1. Verify your email (check your inbox)
2. Choose a plan that fits your needs
3. Start receiving qualified leads!

Get started: {{login_url}}

Questions? Reply to this email - we're here to help!

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'login_url', 'unsubscribe_url'],
  },
  {
    name: 'verification_reminder',
    displayName: 'Verification Reminder',
    subject: "Don't forget to verify your email 📧",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Almost There! 📧</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>You're just one step away from receiving verified homeowner leads. Please verify your email to get started.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify My Email →</a>
    </div>
    <p style="color: #666; font-size: 14px;">If you didn't create an account with us, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

You're just one step away from receiving verified homeowner leads. Please verify your email to get started.

Verify your email: {{login_url}}

If you didn't create an account with us, you can safely ignore this email.

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'login_url', 'unsubscribe_url'],
  },
  {
    name: 'upgrade_nudge',
    displayName: 'Upgrade Nudge',
    subject: 'Unlock more leads with a paid plan 🚀',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Ready for More Leads? 🚀</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>You've been on the free plan for <strong>{{days_since_register}} days</strong>. Ready to take your wholesaling to the next level?</p>
    <p><strong>Upgrade now and get:</strong></p>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">✅ More leads per month</li>
      <li style="margin-bottom: 10px;">⚡ Priority lead delivery</li>
      <li style="margin-bottom: 10px;">🔥 Access to exclusive marketplace deals</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{upgrade_url}}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Plans →</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

You've been on the free plan for {{days_since_register}} days. Ready to take your wholesaling to the next level?

Upgrade now and get:
- More leads per month
- Priority lead delivery
- Access to exclusive marketplace deals

View plans: {{upgrade_url}}

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'days_since_register', 'upgrade_url', 'unsubscribe_url'],
  },
  {
    name: 'inactive_7d',
    displayName: 'Inactive 7 Days',
    subject: 'We miss you! 👋',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #6366f1; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">We Miss You! 👋</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>It's been a week since we've seen you. New leads are waiting!</p>
    <p>You have <strong>{{leads_count}} leads</strong> in your account ready to be worked.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login Now →</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

It's been a week since we've seen you. New leads are waiting!

You have {{leads_count}} leads in your account ready to be worked.

Login now: {{login_url}}

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'leads_count', 'login_url', 'unsubscribe_url'],
  },
  {
    name: 'inactive_30d',
    displayName: 'Inactive 30 Days',
    subject: 'Your leads are waiting... ⏰',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">We've Been Saving Leads For You ⏰</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>It's been 30 days since your last login. We've been saving leads for you!</p>
    <p>Come back and see what's new in your account.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #ef4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login Now →</a>
    </div>
    <p style="color: #666; font-size: 14px;">Not interested anymore? No worries - you can manage your email preferences below.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

It's been 30 days since your last login. We've been saving leads for you!

Come back and see what's new in your account.

Login now: {{login_url}}

Not interested anymore? No worries - you can manage your email preferences below.

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'login_url', 'unsubscribe_url'],
  },
  {
    name: 'monthly_digest',
    displayName: 'Monthly Digest',
    subject: 'Your {{month}} Lead Report 📊',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Your {{month}} Report 📊</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hey {{name}}!</p>
    <p>Here's your monthly summary:</p>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">Leads This Month</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">{{leads_this_month}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">Total Leads</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">{{leads_count}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">Current Plan</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; text-transform: capitalize;">{{plan}}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Dashboard →</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Verified Homeowner | <a href="{{unsubscribe_url}}" style="color: #999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,
    textContent: `Hey {{name}}!

Here's your monthly summary:

- Leads This Month: {{leads_this_month}}
- Total Leads: {{leads_count}}
- Current Plan: {{plan}}

View your dashboard: {{login_url}}

---
Verified Homeowner
Manage preferences: {{unsubscribe_url}}`,
    variables: ['name', 'month', 'leads_this_month', 'leads_count', 'plan', 'login_url', 'unsubscribe_url'],
  },
];

const defaultAutomations = [
  {
    name: 'Welcome Email',
    description: 'Sends welcome email immediately after registration',
    templateName: 'welcome_email',
    trigger: 'after_register',
    delayHours: 0,
    repeatIntervalHours: 0,
    maxSends: 1,
    isActive: true,
  },
  {
    name: 'Verify Your Email',
    description: 'Daily reminder to verify email (max 3 times)',
    templateName: 'verification_reminder',
    trigger: 'not_verified',
    delayHours: 24,
    repeatIntervalHours: 24,
    maxSends: 3,
    isActive: true,
  },
  {
    name: 'Upgrade to Paid',
    description: 'Weekly nudge to upgrade from free plan (max 4 times)',
    templateName: 'upgrade_nudge',
    trigger: 'on_free_plan',
    delayHours: 168,
    repeatIntervalHours: 168,
    maxSends: 4,
    isActive: false,
  },
  {
    name: 'We Miss You (7 days)',
    description: 'Reminder after 7 days of inactivity',
    templateName: 'inactive_7d',
    trigger: 'inactive_7d',
    delayHours: 168,
    repeatIntervalHours: 0,
    maxSends: 1,
    isActive: true,
  },
  {
    name: 'Come Back (30 days)',
    description: 'Win-back email after 30 days of inactivity',
    templateName: 'inactive_30d',
    trigger: 'inactive_30d',
    delayHours: 720,
    repeatIntervalHours: 0,
    maxSends: 1,
    isActive: true,
  },
  {
    name: 'Monthly Report',
    description: 'Monthly digest sent on 1st of each month',
    templateName: 'monthly_digest',
    trigger: 'monthly',
    delayHours: 0,
    repeatIntervalHours: 0,
    maxSends: 0,
    isActive: false,
  },
];

async function seedEmails() {
  console.log('🌱 Seeding email templates and automations...');

  try {
    // Create templates
    for (const template of defaultTemplates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { name: template.name }
      });

      if (!existing) {
        await prisma.emailTemplate.create({
          data: template
        });
        console.log(`✅ Created template: ${template.displayName}`);
      } else {
        console.log(`⏭️ Template already exists: ${template.displayName}`);
      }
    }

    // Create automations
    for (const automation of defaultAutomations) {
      const template = await prisma.emailTemplate.findUnique({
        where: { name: automation.templateName }
      });

      if (!template) {
        console.log(`❌ Template not found for automation: ${automation.name}`);
        continue;
      }

      const existing = await prisma.emailAutomation.findFirst({
        where: { 
          name: automation.name,
          templateId: template.id
        }
      });

      if (!existing) {
        await prisma.emailAutomation.create({
          data: {
            name: automation.name,
            description: automation.description,
            templateId: template.id,
            trigger: automation.trigger,
            delayHours: automation.delayHours,
            repeatIntervalHours: automation.repeatIntervalHours,
            maxSends: automation.maxSends,
            isActive: automation.isActive,
          }
        });
        console.log(`✅ Created automation: ${automation.name}`);
      } else {
        console.log(`⏭️ Automation already exists: ${automation.name}`);
      }
    }

    console.log('\n✨ Email seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedEmails();
