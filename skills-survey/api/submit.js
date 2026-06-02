export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, name } = req.body;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Slack webhook not configured' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        // Optional: unfurl links and use mrkdwn
        mrkdwn: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack error:', errorText);
      return res.status(500).json({ error: 'Failed to send to Slack' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
