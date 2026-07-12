import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Operations Advisor using Gemini API
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API key is missing. Please define it in your Settings > Secrets panel on the top right.",
        });
      }

      const { prompt, contextData } = req.body;

      // Lazy initialization of the Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct a highly-focused operations prompt enriched with real Indian context and the requested query
      const systemInstruction = `You are the TransitOps AI Fleet & Fuel Advisor, an expert operations assistant for Indian road transport, supply chains, and fleets. 
Your tone is professional, technical, mentor-like, encouraging, and highly precise. 
You are speaking to fleet managers, dispatchers, and financial analysts in India. 
Always speak in Indian rupees (₹) and metric measurements (liters, kilometers, kg, km/h).
Reference popular Indian transport routes (e.g., NH-4 Mumbai-Pune, Delhi-Mumbai Industrial Corridor, Golden Quadrilateral, JNPT Port Navi Mumbai, Chennai-Bangalore Corridor) and fuel prices dynamically.
Provide actual calculations, practical insights, and safety strategies where possible.`;

      const finalPrompt = `
Operational Context:
- Current Fuel Price: ₹94.50 / L (Diesel)
- Regional Routes: Mumbai-Pune Expressway, Delhi Inner Ring Road, JNPT Port Access Road, Bangalore Terminal
${contextData ? `- App State Context: ${JSON.stringify(contextData)}` : ""}

User Query:
"${prompt}"

Please provide a highly actionable, structured recommendation or analytical breakdown based on this query. Keep it crisp, well-structured, and use bold markdown points for high scannability.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({
        error: "Failed to query Gemini operations advisor: " + (err.message || err),
      });
    }
  });

  // Serve static assets or mount Vite middleware depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TransitOps Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start TransitOps server:", err);
});
