export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, company, proposal } = req.body;

    if (!name || !email || !company || !proposal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const htmlBody = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Proposal:</strong></p>
      <p>${proposal.replace(/\n/g, '<br>')}</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Casiflow Partnerships <noreply@casiflow.com>',
        to: ['partnerships@casiflow.com'],
        reply_to: email,
        subject: `New Partnership Enquiry from ${company}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Resend API error:', JSON.stringify(errorBody));
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unhandled error in partner function:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
