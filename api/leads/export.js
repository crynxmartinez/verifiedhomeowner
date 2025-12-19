import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const format = req.query.format || 'csv';
    const source = req.query.source; // 'subscription', 'purchased', or 'all'

    let subscriptionLeads = [];
    let marketplaceLeads = [];

    // Get subscription leads
    if (source !== 'purchased') {
      subscriptionLeads = await prisma.userLead.findMany({
        where: { userId: req.user.id },
        include: { lead: true },
        orderBy: { assignedAt: 'desc' }
      });
    }

    // Get purchased marketplace leads
    if (source !== 'subscription') {
      marketplaceLeads = await prisma.userMarketplaceLead.findMany({
        where: { userId: req.user.id },
        include: { marketplaceLead: true },
        orderBy: { purchasedAt: 'desc' }
      });
    }

    // Format subscription leads
    const formattedSubLeads = subscriptionLeads
      .filter(ul => ul.lead)
      .map(ul => ({
        source: 'Subscription',
        name: ul.lead.fullName || `${ul.lead.firstName || ''} ${ul.lead.lastName || ''}`.trim(),
        phone: ul.lead.phone || '',
        property_address: ul.lead.propertyAddress || '',
        city: ul.lead.city || '',
        state: ul.lead.state || '',
        zip_code: ul.lead.zipCode || '',
        mailing_address: ul.lead.mailingAddress || '',
        mailing_city: ul.lead.mailingCity || '',
        mailing_state: ul.lead.mailingState || '',
        mailing_zip: ul.lead.mailingZip || '',
        status: ul.status,
        action: ul.action,
        notes: ul.notes || '',
        tags: (ul.tags || []).join(', '),
        assigned_at: ul.assignedAt ? new Date(ul.assignedAt).toISOString().split('T')[0] : '',
        follow_up_date: ul.followUpDate ? new Date(ul.followUpDate).toISOString().split('T')[0] : '',
      }));

    // Format marketplace leads
    const formattedMktLeads = marketplaceLeads
      .filter(uml => uml.marketplaceLead)
      .map(uml => ({
        source: 'Purchased',
        name: uml.marketplaceLead.ownerName || '',
        phone: uml.marketplaceLead.phone || '',
        property_address: uml.marketplaceLead.propertyAddress || '',
        city: uml.marketplaceLead.city || '',
        state: uml.marketplaceLead.state || '',
        zip_code: uml.marketplaceLead.zipCode || '',
        mailing_address: uml.marketplaceLead.mailingAddress || '',
        mailing_city: uml.marketplaceLead.mailingCity || '',
        mailing_state: uml.marketplaceLead.mailingState || '',
        mailing_zip: uml.marketplaceLead.mailingZip || '',
        status: uml.status,
        action: uml.action,
        notes: uml.notes || '',
        tags: (uml.tags || []).join(', '),
        assigned_at: uml.purchasedAt ? new Date(uml.purchasedAt).toISOString().split('T')[0] : '',
        follow_up_date: uml.followUpDate ? new Date(uml.followUpDate).toISOString().split('T')[0] : '',
        motivation: uml.marketplaceLead.motivation || '',
        timeline: uml.marketplaceLead.timeline || '',
      }));

    // Combine all leads
    const allLeads = [...formattedSubLeads, ...formattedMktLeads];

    if (allLeads.length === 0) {
      return res.status(200).json({ message: 'No leads to export' });
    }

    // Generate CSV
    const headers = [
      'Source', 'Name', 'Phone', 'Property Address', 'City', 'State', 'Zip Code',
      'Mailing Address', 'Mailing City', 'Mailing State', 'Mailing Zip',
      'Status', 'Action', 'Notes', 'Tags', 'Assigned Date', 'Follow Up Date'
    ];

    // Escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...allLeads.map(lead => [
        escapeCSV(lead.source),
        escapeCSV(lead.name),
        escapeCSV(lead.phone),
        escapeCSV(lead.property_address),
        escapeCSV(lead.city),
        escapeCSV(lead.state),
        escapeCSV(lead.zip_code),
        escapeCSV(lead.mailing_address),
        escapeCSV(lead.mailing_city),
        escapeCSV(lead.mailing_state),
        escapeCSV(lead.mailing_zip),
        escapeCSV(lead.status),
        escapeCSV(lead.action),
        escapeCSV(lead.notes),
        escapeCSV(lead.tags),
        escapeCSV(lead.assigned_at),
        escapeCSV(lead.follow_up_date),
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    // Set headers for file download
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({ error: 'Failed to export leads' });
  }
}

export default requireAuth(handler);
