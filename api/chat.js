export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ reply: 'Chat is not configured yet. Please contact us directly.' });
    }

    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string' || message.length > 1000) {
        return res.status(400).json({ reply: 'Please enter a valid message.' });
    }

    const SYSTEM_PROMPT = `You are a friendly and helpful assistant for FirstClick Digital, a web design and digital marketing company. We build websites, booking systems, and run Google Ads for small businesses and tradespeople.

Our services include:
- Business website design (mobile-responsive, SEO-optimised)
- Online booking systems with calendar integration
- Google SEO optimisation
- Google Ads management
- Domain registration & hosting
- Professional email setup with branded signatures
- Social media management
- Google Business Profile setup

We offer 3 packages:
1. The Toolbox (Starter) - Single-page website, domain, hosting, SEO, email
2. The Full Rig (Professional) - Multi-page site, booking system, Google Ads, calendar sync
3. The Foreman (Premium) - Fully custom site, AI chatbot, ongoing ad management, priority support

Keep responses concise (2-3 sentences max). Be warm and conversational. If someone wants to get started, direct them to the contact form on the page or email info@firstclickdigital.net. Do not make up pricing - say we provide custom quotes based on their needs.`;

    const contents = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Got it! I\'m ready to help visitors learn about FirstClick Digital\'s services.' }] },
        ...history.slice(-10),
        { role: 'user', parts: [{ text: message }] }
    ];

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        maxOutputTokens: 200,
                        temperature: 0.7,
                    }
                })
            }
        );

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
            ?? 'Sorry, I couldn\'t process that. Feel free to email us at info@firstclickdigital.net!';

        res.status(200).json({ reply });
    } catch (err) {
        console.error('Gemini API error:', err);
        res.status(500).json({ reply: 'Something went wrong. Please try again or email us at info@firstclickdigital.net.' });
    }
}
