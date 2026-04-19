export default async function handler(req, res) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const subjectLabels = {
      general: 'General Enquiry',
      technical: 'Technical Support',
      partnership: 'Partnership',
      feedback: 'Feedback',
      other: 'Other',
    };
    const subjectLabel = subjectLabels[subject] || subject;

    const htmlBody = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subjectLabel}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Casiflow Contact <noreply@casiflow.com>',
        to: ['support@casiflow.com'],
        reply_to: email,
        subject: `Contact Form: ${subjectLabel}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Resend API error body:', JSON.stringify(errorBody));
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unhandled error in contact function:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
