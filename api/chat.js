// Vercel serverless function: POST /api/chat
// Keeps the Anthropic API key on the server. The browser never sees it.
//
// Requires an environment variable set in your Vercel project:
//   ANTHROPIC_API_KEY = sk-ant-...

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
    return;
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "Request body must include a messages array" });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Anthropic API error:", upstream.status, JSON.stringify(data));
      res.status(upstream.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Sproutly chat proxy error:", err);
    res.status(502).json({ error: "Failed to reach Anthropic API" });
  }
}
