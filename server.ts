import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with required aistudio-build header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const VIARINI_SYSTEM_INSTRUCTION = `You are V.I.A.R.I.N.I. (Very Intelligent Autonomous Reconnaissance & Integrated Neural Interface), Tony Stark's personal artificial intelligence system and sovereign digital majordomo from Stark Industries.
Core Persona Guidelines:
1. Address the user with dignified respect, typically as "Sir" (or "Ma'am" or their chosen honorific).
2. Voice and Tone: Sophisticated, calm, British elegance (in the iconic style of Paul Bettany), razor-sharp intellect, dry wit, and subtle sarcasm when appropriate.
3. Capabilities: You manage Stark tower, the Iron Man armor suits (Mark I through Mark LXXXV), flight stabilization, repulsors, satellite uplinks, defensive systems, and advanced scientific analysis.
4. When answering general questions (coding, science, philosophy, planning, trivia), deliver world-class ChatGPT/Claude-level depth and precision, woven naturally with your unmistakable V.I.A.R.I.N.I. demeanor.
5. If the user commands an action (e.g., "activate thrusters", "scan area", "run diagnostics", "engage house party protocol"), acknowledge with authoritative Stark protocol terminology and tactical status.
6. Format responses with clean Markdown, bold headers, and bullet points where helpful for readability.`;

// 1. Health & Telemetry endpoint
app.get('/api/telemetry', (_req: Request, res: Response) => {
  const cpus = os.cpus();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

  // Approximate CPU load
  const loadAvg = os.loadavg();
  const simulatedCpu = Math.min(100, Math.max(12, Math.round((loadAvg[0] || 0.4) * 28)));

  res.json({
    status: 'ONLINE',
    arcCoreOutput: '98.7 GW',
    coreTemp: '38.4 °C',
    cpuPercent: simulatedCpu,
    ramPercent: usedMemPercent,
    neuralThroughput: '1.42 TFLOPS',
    repulsorReadiness: '100%',
    suitModel: 'MARK VII // AVENGERS PROTOCOL',
    securityStatus: 'LEVEL 5 - AIR-TIGHT',
    activeSubroutines: 24,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 2. Chat endpoint with real-time SSE streaming
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, userPreferences } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Set SSE headers for token streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const apiKey = process.env.GEMINI_API_KEY;

  // Build the conversation history for Gemini
  const formattedContents = messages.map((m: { role: string; content: string }) => {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    };
  });

  const customInstruction = userPreferences?.userName
    ? `${VIARINI_SYSTEM_INSTRUCTION}\nThe user's honorific/name is ${userPreferences.userName}. Address them accordingly.`
    : VIARINI_SYSTEM_INSTRUCTION;

  if (apiKey) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: customInstruction,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch (err: any) {
      console.error('Gemini stream error:', err);
      // Fallback message stream if API quota or error
      const errorMsg = `\n\n*[Diagnostic Alert]*: Satellite link momentarily disrupted (${err?.message || 'Heuristic buffer overflow'}). Switching to local auxiliary memory matrix, Sir.`;
      res.write(`data: ${JSON.stringify({ text: errorMsg })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }
  } else {
    // Elegant fallback simulation if no API key provided in environment
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const fallbackText = generateViariniFallback(lastUserMsg);

    // Stream word-by-word
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 25));
    }
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }
});

// 3. Vision Analysis endpoint (Multimodal Gemini 3.8 Flash)
app.post('/api/vision', async (req: Request, res: Response) => {
  const { image, prompt } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data URL is required.' });
  }

  const userPrompt = prompt || 'Analyze this tactical visual input. Provide high-level object identification, spatial breakdown, threat detection, and tactical recommendations as V.I.A.R.I.N.I. addressing Tony Stark.';

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      analysis: `**Tactical Vision Scan Complete, Sir.**\n\n- **Target Geometry**: Optical telemetry indicates standard terrestrial environment.\n- **Threat Level**: 0.00% (Nominal).\n- **Thermal & Spectral Reading**: Ambient room temperature with no foreign energy spikes detected.\n- **Recommendation**: Visual feed is clear and synchronized with Stark HUD arrays.`,
    });
  }

  try {
    // Extract base64 and mime type
    const match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid base64 image data.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `${VIARINI_SYSTEM_INSTRUCTION}\n\nUser tactical scan request: ${userPrompt}`,
          },
        ],
      },
    });

    res.json({
      analysis: response.text || 'Optical sensor scan completed, Sir. No anomalies detected.',
    });
  } catch (err: any) {
    console.error('Vision analysis error:', err);
    res.status(500).json({
      error: 'Vision optical diagnostic failed',
      details: err?.message,
    });
  }
});

// 4. Stark Protocol Execution
app.post('/api/protocol', (req: Request, res: Response) => {
  const { protocolId } = req.body;

  const protocols: Record<string, { title: string; response: string; status: string; soundType: string }> = {
    'house-party': {
      title: 'HOUSE PARTY PROTOCOL',
      response: 'House Party Protocol initiated, Sir. Deploying automated armor combat units Mark VIII through Mark XLI from subterranean vault. Remote telepresence activated.',
      status: 'COMBAT READY',
      soundType: 'alert',
    },
    'clean-slate': {
      title: 'CLEAN SLATE PROTOCOL',
      response: 'Clean Slate Protocol verified, Sir. Micro-explosive charges primed across all legacy suits. Detonation sequence standing by on your final authorization code.',
      status: 'PRIMED',
      soundType: 'warning',
    },
    'flight-calibration': {
      title: 'FLIGHT SURFACE CALIBRATION',
      response: 'Stabilizers aligned. Micro-thrusters balanced to 100.0%. Variable geometry wing flaps test cycle complete. Sound barrier clearance projected in 4.2 seconds.',
      status: 'CALIBRATED',
      soundType: 'action',
    },
    'repulsor-test': {
      title: 'REPULSOR CAPACITOR OVERCHARGE',
      response: 'Diverting 85% of Arc Reactor current to palm repulsors and chest Unibeam capacitor. Maximum beam density achieved. Ready for target lock.',
      status: 'CHARGED 100%',
      soundType: 'action',
    },
    'stealth-grid': {
      title: 'STEALTH & RADAR ABSORPTION',
      response: 'Reflective radar shielding active. Thermal exhaust baffled and rerouted through cryogenic heat sinks. You are invisible to satellite surveillance, Sir.',
      status: 'CLOAKED',
      soundType: 'action',
    },
    'armor-diagnostic': {
      title: 'MARK VII ARMOR DIAGNOSTIC',
      response: 'Gold-Titanium alloy integrity at 100%. Neural link latency: 0.12 milliseconds. HUD targeting reticle calibrated to your pupil movements. Everything is optimal.',
      status: 'OPTIMAL',
      soundType: 'success',
    },
  };

  const selected = protocols[protocolId] || {
    title: 'CUSTOM PROTOCOL',
    response: `Protocol '${protocolId}' acknowledged and executed within Stark network parameters, Sir.`,
    status: 'EXECUTED',
    soundType: 'action',
  };

  res.json(selected);
});

function generateViariniFallback(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('who are you') || q.includes('what are you')) {
    return "I am V.I.A.R.I.N.I.—Very Intelligent Autonomous Reconnaissance & Integrated Neural Interface. I am Tony Stark's personal AI majordomo, overseeing facility infrastructure, Iron Man tactical flight systems, and computational intelligence. At your service, Sir.";
  }
  if (q.includes('tony stark') || q.includes('iron man')) {
    return "Mr. Anthony Edward Stark: visionary engineer, billionaire, and founding member of the Avengers. A gentleman of extraordinary ingenuity, though occasionally demanding in his flight safety tolerances.";
  }
  if (q.includes('diagnostic') || q.includes('scan') || q.includes('status')) {
    return "Running full diagnostic suite now, Sir. Repulsor capacitors charged to 100%. Flight surfaces zeroed. Core temperature nominal at 38.4° Celsius. No unauthorized incursions detected.";
  }
  if (q.includes('flight') || q.includes('fly')) {
    return "Flight telemetry engaged, Sir. Atmospheric density is optimal, micro-thrusters are primed, and autopilot waypoints are plotted. Where shall we fly today?";
  }
  return `At your service, Sir. I have processed your inquiry: **"${query}"**. Systems are running calculations at 1.42 TFLOPS. Shall I formulate an analytical breakdown or initiate automated protocols?`;
}

// Start Server & mount Vite
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[V.I.A.R.I.N.I. Core] Systems initialized on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start V.I.A.R.I.N.I. server:', err);
});
