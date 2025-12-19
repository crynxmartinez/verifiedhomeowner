import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import Papa from 'papaparse';
import { Resend } from 'resend';
import { getMarketplaceLeadEmailTemplate } from '../../lib/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send notification emails to eligible users
async function sendMarketplaceNotifications(lead) {
  try {
    // Trim whitespace from state
    const state = (lead.state || '').trim().toUpperCase();
    console.log(`📧 Starting marketplace notifications for lead in state: "${state}"`);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Debug: Check all wholesalers and their settings
    const allWholesalers = await prisma.user.findMany({
      where: { role: 'wholesaler' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        marketplaceEmails: true,
        lastLoginAt: true,
        preferredStates: true,
      }
    });
    
    console.log(`📊 Total wholesalers: ${allWholesalers.length}`);
    allWholesalers.forEach(u => {
      console.log(`  - ${u.email}: verified=${u.emailVerified}, mktEmails=${u.marketplaceEmails}, lastLogin=${u.lastLoginAt}, states=${JSON.stringify(u.preferredStates)}`);
    });

    // Find users who:
    // 1. Have this state in their preferred states
    // 2. Are email verified
    // 3. Have logged in within the last 30 days (or recently created account)
    // 4. Have marketplace emails enabled
    const eligibleUsers = await prisma.user.findMany({
      where: {
        role: 'wholesaler',
        emailVerified: true,
        marketplaceEmails: true,
        preferredStates: { has: state },
        OR: [
          { lastLoginAt: { gte: thirtyDaysAgo } },
          { lastLoginAt: null, createdAt: { gte: thirtyDaysAgo } }, // New users who haven't logged in yet
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
    
    console.log(`✅ Eligible users (matched criteria): ${eligibleUsers.length}`, eligibleUsers.map(u => u.email));

    // Also find users who have purchased leads from this state before
    const usersWithPurchasesInState = await prisma.userMarketplaceLead.findMany({
      where: {
        marketplaceLead: { state: state }
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            marketplaceEmails: true,
            lastLoginAt: true,
          }
        }
      }
    });

    // Combine and deduplicate users
    const allEligibleUsers = new Map();
    
    eligibleUsers.forEach(user => {
      allEligibleUsers.set(user.id, user);
    });
    
    usersWithPurchasesInState.forEach(({ user }) => {
      if (
        user.emailVerified && 
        user.marketplaceEmails && 
        user.lastLoginAt && 
        user.lastLoginAt >= thirtyDaysAgo &&
        !allEligibleUsers.has(user.id)
      ) {
        allEligibleUsers.set(user.id, { id: user.id, email: user.email, name: user.name });
      }
    });

    const usersToNotify = Array.from(allEligibleUsers.values());
    
    console.log(`📧 Sending marketplace notifications to ${usersToNotify.length} users for lead in ${state}`);

    // Send emails in parallel (batch of 10 at a time to avoid rate limits)
    const batchSize = 10;
    for (let i = 0; i < usersToNotify.length; i += batchSize) {
      const batch = usersToNotify.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (user) => {
        try {
          // Get temperature-based pricing
          const temperature = lead.temperature || 'warm';
          const tempPrices = { hot: 100, warm: 80 };
          const tempEmojis = { hot: '🔥', warm: '🌡️' };
          const tempLabels = { hot: 'Hot', warm: 'Warm' };
          const price = tempPrices[temperature] || 80;

          const { html, text } = getMarketplaceLeadEmailTemplate({
            lead: {
              city: lead.city || 'Unknown',
              state: state,
              motivation: lead.motivation,
              timeline: lead.timeline,
              price: price,
              temperature: temperature,
              temperatureLabel: tempLabels[temperature] || 'Warm',
            },
            recipientName: user.name?.split(' ')[0] || 'there',
            unsubscribeUrl: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile`,
          });

          const emoji = tempEmojis[temperature] || '🌡️';
          const label = tempLabels[temperature] || 'Warm';

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Verified Homeowner <noreply@verifiedhomeowner.com>',
            to: user.email,
            subject: `${emoji} New ${label} Lead in ${state} - ${lead.motivation}`,
            html,
            text,
          });

          // Track email sent
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastEmailSentAt: new Date(),
              lastEmailType: 'marketplace_lead',
            }
          });

          console.log(`✅ Email sent to ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${user.email}:`, emailError.message);
        }
      }));
    }

    return usersToNotify.length;
  } catch (error) {
    console.error('Failed to send marketplace notifications:', error);
    return 0;
  }
}

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all marketplace leads
    try {
      const leads = await prisma.marketplaceLead.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Format for frontend
      const formattedLeads = leads.map(lead => ({
        id: lead.id,
        owner_name: lead.ownerName,
        phone: lead.phone,
        property_address: lead.propertyAddress,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zipCode,
        mailing_address: lead.mailingAddress,
        mailing_city: lead.mailingCity,
        mailing_state: lead.mailingState,
        mailing_zip: lead.mailingZip,
        motivation: lead.motivation,
        timeline: lead.timeline,
        asking_price: lead.askingPrice,
        temperature: lead.temperature || 'warm',
        price: lead.price,
        max_buyers: lead.maxBuyers,
        times_sold: lead.timesSold,
        is_hidden: lead.isHidden,
        created_at: lead.createdAt,
      }));

      res.status(200).json({ leads: formattedLeads });
    } catch (error) {
      console.error('Fetch marketplace leads error:', error);
      res.status(500).json({ error: 'Failed to fetch marketplace leads' });
    }
  } else if (req.method === 'POST') {
    // Create single marketplace lead or upload CSV
    try {
      const { csvData, singleLead } = req.body;

      if (singleLead) {
        // Create single marketplace lead
        const data = await prisma.marketplaceLead.create({
          data: {
            ownerName: singleLead.owner_name,
            phone: singleLead.phone,
            propertyAddress: singleLead.property_address,
            city: singleLead.city,
            state: singleLead.state,
            zipCode: singleLead.zip_code,
            mailingAddress: singleLead.mailing_address,
            mailingCity: singleLead.mailing_city,
            mailingState: singleLead.mailing_state,
            mailingZip: singleLead.mailing_zip,
            motivation: singleLead.motivation,
            timeline: singleLead.timeline,
            askingPrice: singleLead.asking_price ? parseFloat(singleLead.asking_price) : null,
            temperature: singleLead.temperature || 'warm',
            price: parseFloat(singleLead.price) || 0,
            maxBuyers: parseInt(singleLead.max_buyers) || 0,
          }
        });

        // Send notification emails to eligible users (don't await to avoid blocking response)
        sendMarketplaceNotifications({
          city: singleLead.city,
          state: singleLead.state,
          motivation: singleLead.motivation,
          timeline: singleLead.timeline,
          price: parseFloat(singleLead.price) || 0,
        }).then(count => {
          console.log(`📧 Sent ${count} marketplace notification emails`);
        });

        return res.status(201).json({ lead: data });
      }

      if (csvData) {
        // Parse CSV
        const parsed = Papa.parse(csvData, { header: true });
        
        if (parsed.errors.length > 0) {
          return res.status(400).json({ error: 'Invalid CSV format' });
        }

        // Map CSV data to marketplace lead objects
        const leads = parsed.data
          .filter(row => row.full_name || row.owner_name)
          .map(row => ({
            ownerName: row.full_name || row.owner_name || '',
            phone: row.phone || row.number || '',
            propertyAddress: row.address || '',
            city: row.city || '',
            state: row.state || '',
            zipCode: row.zip || row.zip_code || '',
            mailingAddress: row.mailing_address || '',
            mailingCity: row.mailing_city || '',
            mailingState: row.mailing_state || '',
            mailingZip: row.mailing_zip || '',
            motivation: row.motivation || '',
            timeline: row.timeline || '',
            askingPrice: row.asking_price ? parseFloat(row.asking_price) : null,
            temperature: row.temperature || 'warm',
            price: parseFloat(row.price) || 0,
            maxBuyers: parseInt(row.max_buyers) || 0,
          }));

        if (leads.length === 0) {
          return res.status(400).json({ error: 'No valid leads found in CSV' });
        }

        await prisma.marketplaceLead.createMany({ data: leads });

        return res.status(201).json({ 
          message: `${leads.length} marketplace leads uploaded successfully`,
          count: leads.length 
        });
      }

      res.status(400).json({ error: 'Either singleLead or csvData required' });
    } catch (error) {
      console.error('Create marketplace leads error:', error);
      res.status(500).json({ error: 'Failed to create marketplace leads' });
    }
  } else if (req.method === 'PUT') {
    // Update marketplace lead
    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      // Map snake_case to camelCase for Prisma
      const prismaData = {};
      if (updateData.owner_name !== undefined) prismaData.ownerName = updateData.owner_name;
      if (updateData.phone !== undefined) prismaData.phone = updateData.phone;
      if (updateData.property_address !== undefined) prismaData.propertyAddress = updateData.property_address;
      if (updateData.city !== undefined) prismaData.city = updateData.city;
      if (updateData.state !== undefined) prismaData.state = updateData.state;
      if (updateData.zip_code !== undefined) prismaData.zipCode = updateData.zip_code;
      if (updateData.mailing_address !== undefined) prismaData.mailingAddress = updateData.mailing_address;
      if (updateData.mailing_city !== undefined) prismaData.mailingCity = updateData.mailing_city;
      if (updateData.mailing_state !== undefined) prismaData.mailingState = updateData.mailing_state;
      if (updateData.mailing_zip !== undefined) prismaData.mailingZip = updateData.mailing_zip;
      if (updateData.motivation !== undefined) prismaData.motivation = updateData.motivation;
      if (updateData.timeline !== undefined) prismaData.timeline = updateData.timeline;
      if (updateData.asking_price !== undefined) prismaData.askingPrice = updateData.asking_price ? parseFloat(updateData.asking_price) : null;
      if (updateData.temperature !== undefined) prismaData.temperature = updateData.temperature;
      if (updateData.price !== undefined) prismaData.price = parseFloat(updateData.price);
      if (updateData.max_buyers !== undefined) prismaData.maxBuyers = parseInt(updateData.max_buyers);
      if (updateData.is_hidden !== undefined) prismaData.isHidden = updateData.is_hidden;

      const updated = await prisma.marketplaceLead.update({
        where: { id },
        data: prismaData,
      });

      res.status(200).json({ lead: updated });
    } catch (error) {
      console.error('Update marketplace lead error:', error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  } else if (req.method === 'DELETE') {
    // Delete marketplace lead
    try {
      const { leadId } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      await prisma.marketplaceLead.delete({ where: { id: leadId } });

      res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete marketplace lead error:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
