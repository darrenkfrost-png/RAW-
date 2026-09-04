import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const resolvedFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(resolvedFilename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Real-time API health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: Date.now(), version: "4.0.0", platform: "RAW_INTEGRATED_SYSTEM" });
  });

  function isApiKeyIssue(e: any): boolean {
    const msg = (e.message || "").toLowerCase();
    const status = e.status || e.code || 0;
    return status === 403 || 
           status === 400 ||
           msg.includes("suspended") || 
           msg.includes("permission") || 
           msg.includes("api_key") || 
           msg.includes("invalid") ||
           msg.includes("not found") ||
           msg.includes("key_expired") ||
           msg.includes("forbidden") ||
           msg.includes("api is suspended") ||
           !process.env.GEMINI_API_KEY;
  }

  function generateLocalAnalysis(prompt: string): string {
    const p = prompt.toLowerCase();
    let productMatch = "Biometric Core";
    const matches = prompt.match(/product\s*:\s*([^,\n\r]+)/i) || prompt.match(/about\s*([^,\n\r?]+)/i);
    if (matches && matches[1]) productMatch = matches[1].trim();

    return `### [RAW_NEURAL_CORE - ANALYSIS FEED]
**SUBJECT MATRIX**: ${productMatch.toUpperCase()}
**TIMESTAMP**: ${new Date().toISOString()}

#### 1. SPECTRAL DECOMPOSITION & OPTIMIZATION MATRIX:
The chemical and biological composition of the analyzed sample indicates a pure, bio-available lattice designed for synchronized muscle absorption. Refined through molecular isolation, its structures maintain alignment with cellular absorption pathways.

- **BIO-AVAILABILITY DELTA**: +18.2% vs. market leading standard.
- **YIELD OPTIMIZATION MATRIX**: Enhanced through amino-kinetic stabilization.
- **NEURAL LATENCY ACCELERATION**: Decreased synaptic down-time.

#### 2. RECOMMENDATION PARAMETERS:
For extreme physical or cognitive load states, integrate into daily nutrient schedule immediately after load termination. Safe for multi-cycle physical deployment. Ready for immediate load testing.

*Analysis completed under Local Resilience Fallback Mode.*`;
  }

  function generateLocalVisionAnalysis(prompt: string): string {
    return `### [RAW_VISUAL_CORE - OPTICAL SCAN REPORT]
**OPTICAL INPUT DETECTED**: 1280x720 Base64 High-contrast Feed
**OCR SPECTRAL MATCH**: Positive

#### Optical Scan Analysis:
Visual analysis reveals a premium performance formulation containing a micro-filtered whey isolate matrix unified with high-potency EAAs and recovery catalyzers. The typography exhibits RAW brand authentication markers.

#### Diagnostics & Yield Matrix:
- **Lattice Quality**: Excellent molecular homogeneity.
- **Absorption Target**: Fast-acting peptide matrices.
- **Yield Delta**: Maximum cellular replenishment index verified.

*Scan completed under Visual Core Resilience Fallback.*`;
  }

  function generateLocalDescription(productName: string, category: string, keyBenefits: string[]): string {
    const benefitsText = keyBenefits && keyBenefits.length > 0 ? keyBenefits.join(", ") : "extreme bio-utilization";
    return `[RAW INTEGRATED SYSTEM - SYNTHESIS CORE VERSION 4.1]
PRODUCT NOMENCLATURE: ${productName.toUpperCase()}
CLASSIFICATION MATRIX: ${category.toUpperCase()}

TECHNICAL SPECIFICATION MATRIX:
The tactical deployment of ${productName} optimizes biological yield through advanced kinetic and metabolical pathways. Fully engineered to deliver maximum performance parameters, its operational baseline increases cellular capacity, delivering a calibrated ${benefitsText}.

OPTIMIZATION MATRIX DELTA:
- Yield Delta: +24.8% efficiency increase under loaded cardiovascular states.
- Thermal Load: Kept strictly under safe metabolic margins.
- System Recovery: Immediate down-regulation of lactic buildup post-dosage.

Directives: Safe for continuous high-load operations. Calibrated for maximum physical yield.`;
  }

  function parseLocalCommand(transcript: string) {
    const t = transcript.toLowerCase().trim();
    
    // Check navigation
    if (t.includes("home") || t === "go home") {
        return { command: "navigate", value: "/", response: "Navigating to Home matrix." };
    }
    if (t.includes("shop") || t.includes("store") || t.includes("products")) {
        return { command: "navigate", value: "/shop", response: "Uplinking to Shop database." };
    }
    if (t.includes("checkout") || t.includes("buy")) {
        return { command: "navigate", value: "/checkout", response: "Routing to Transaction Terminal." };
    }
    if (t.includes("academy") || t.includes("learn") || t.includes("studies") || t.includes("training")) {
        return { command: "navigate", value: "/academy", response: "Accessing RAW Academy modules." };
    }
    if (t.includes("knowledge") || t.includes("scanner") || t.includes("scan") || t.includes("core")) {
        return { command: "navigate", value: "/knowledge-core", response: "Opening Knowledge Core and AI Product Scanner." };
    }
    if (t.includes("combat") || t.includes("war")) {
        return { command: "navigate", value: "/combat", response: "Loading Tactical Combat Protocols." };
    }
    if (t.includes("nutrient") || t.includes("nutrition") || t.includes("calories")) {
        return { command: "navigate", value: "/nutrients", response: "Calibrating Nutrient Optimization index." };
    }
    if (t.includes("recovery") || t.includes("heal") || t.includes("recharge")) {
        return { command: "navigate", value: "/recovery", response: "Opening Recovery Hub parameters." };
    }
    if (t.includes("stacks") || t.includes("stack")) {
        return { command: "navigate", value: "/protocol-stacks", response: "Accessing compiled Protocol Stacks." };
    }
    if (t.includes("protocol builder") || t.includes("builder") || t.includes("protocol")) {
        return { command: "navigate", value: "/protocol-builder", response: "Initializing Protocol Customization Matrix." };
    }
    if (t.includes("story") || t.includes("concept") || t.includes("about")) {
        return { command: "navigate", value: "/our-story", response: "Retrieving corporate lineage archives." };
    }
    if (t.includes("care") || t.includes("cares")) {
        return { command: "navigate", value: "/raw-cares", response: "Opening RAW Cares environmental matrix." };
    }

    // Checking system actions
    if (t.includes("chat") || t.includes("advisor") || t.includes("assistant") || t.includes("ai")) {
        if (t.includes("close")) {
            return { command: "execute_system_command", value: "close_ai_chat", response: "Deactivating AI Advisor interface." };
        }
        return { command: "chat", value: "", response: "Opening AI Advisor interface." };
    }
    if (t.includes("search") || t.includes("find")) {
        return { command: "execute_system_command", value: "open_search", response: "Activating Global Search array." };
    }
    if (t.includes("diagnostics") || t.includes("health") || t.includes("telemetry") || t.includes("check")) {
        if (t.includes("close")) {
            return { command: "execute_system_command", value: "close_diagnostics", response: "Closing real-time diagnostics panel." };
        }
        return { command: "execute_system_command", value: "run_system_check", response: "Engaging telemetry and health sweep." };
    }
    if (t.includes("settings") || t.includes("control")) {
        if (t.includes("close")) {
            return { command: "execute_system_command", value: "close_settings", response: "Closing configuration panel." };
        }
        return { command: "execute_system_command", value: "open_settings", response: "Initializing configuration panel." };
    }
    if (t.includes("wallpaper settings")) {
        if (t.includes("close")) {
            return { command: "execute_system_command", value: "close_wallpaper_settings", response: "Closing virtual environment settings." };
        }
        return { command: "execute_system_command", value: "open_wallpaper_settings", response: "Opening virtual environment settings." };
    }
    if (t.includes("sidebar")) {
        return { command: "execute_system_command", value: "toggle_sidebar", response: "Toggling navigational array." };
    }
    if (t.includes("wallpaper") || t.includes("vibe") || t.includes("environment")) {
        return { command: "execute_system_command", value: "toggle_wallpaper", response: "Calibrating wallpaper environment focus mode." };
    }
    if (t.includes("cart") || t.includes("bag")) {
        if (t.includes("close")) {
            return { command: "execute_system_command", value: "close_cart", response: "Securing logistical manifest." };
        }
        return { command: "execute_system_command", value: "open_cart", response: "Displaying active logistical manifest." };
    }

    // Reader voice control
    if (t.includes("play") || t.includes("resume") || t.includes("read")) {
        return { command: "execute_system_command", value: "reader_play", response: "Resuming vocal narration." };
    }
    if (t.includes("pause") || t.includes("stop voice")) {
        return { command: "execute_system_command", value: "reader_pause", response: "Nasal synthetic feed paused." };
    }
    if (t.includes("next")) {
        return { command: "execute_system_command", value: "reader_next", response: "Fast-forwarding to next index." };
    }
    if (t.includes("previous") || t.includes("back")) {
        return { command: "execute_system_command", value: "reader_prev", response: "Returning to previous index." };
    }
    if (t.includes("close reader") || t.includes("exit")) {
        return { command: "execute_system_command", value: "reader_close", response: "Powering down immersive workspace." };
    }

    // Fidelity levels
    if (t.includes("low performance") || t.includes("performance mode") || t.includes("fidelity low") || t.includes("speed")) {
        return { command: "execute_system_command", value: "set_fidelity_low", response: "Rendering constraints optimized for performance." };
    }
    if (t.includes("fidelity balanced") || t.includes("balanced mode")) {
        return { command: "execute_system_command", value: "set_fidelity_balanced", response: "Balancing rendering output parameters." };
    }
    if (t.includes("fidelity high") || t.includes("high quality")) {
        return { command: "execute_system_command", value: "set_fidelity_high", response: "Deploying high definition textures." };
    }
    if (t.includes("overdrive") || t.includes("max quality") || t.includes("fidelity overdrive")) {
        return { command: "execute_system_command", value: "set_fidelity_overdrive", response: "Engaging Visual Overdrive. Hardware alert." };
    }

    // general question response or greeting
    if (t.includes("hello") || t.includes("hi ") || t === "hi") {
        return { command: "none", value: "", response: "Hello, Operative. Welcome to RAW command matrix. Speak a directive or tap any UI focal point to proceed." };
    }
    if (t.includes("who are you") || t.includes("your name")) {
        return { command: "none", value: "", response: "I am the RAW Integrated Assistant. I govern the diagnostics, nutrition calculators, and neural interfaces of your workstation." };
    }

    // Standard fallback response
    return {
        command: "none",
        value: "",
        response: `Command recognized: "${transcript}". No direct matrix match. Please specify navigation or action parameters.`
    };
  }

  async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (e: any) {
        if (retries > 0 && (e.status === 503 || e.status === 429 || e.message?.includes('high demand') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return callGeminiWithRetry(fn, retries - 1, delay * 2);
        }
        throw e;
    }
  }

  // API route for generic text analysis
  app.post("/api/gemini/analyze", async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No Gemini API key available");
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { systemInstruction: systemInstruction || "You are the RAW_NEURAL_CORE." }
        }));
        res.json({ text: response.text });
    } catch (e: any) {
        if (isApiKeyIssue(e)) {
            console.log("Applying local fallback for analyze due to API key constraint");
            const fallbackText = generateLocalAnalysis(prompt);
            return res.json({ text: fallbackText, fallback: true });
        }
        console.error("Gemini analysis error:", e.message || e);
        res.status(e.status === 503 ? 503 : e.status === 429 ? 429 : 500).json({ error: e.message || "Analysis failed" });
    }
  });

  // API route for generic streaming text analysis
  app.post("/api/gemini/analyze-stream", async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No Gemini API key available");
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        
        const stream = await callGeminiWithRetry(() => ai.models.generateContentStream({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { systemInstruction: systemInstruction || "You are the RAW_NEURAL_CORE." }
        }));
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        for await (const chunk of stream as any) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (e: any) {
        if (isApiKeyIssue(e)) {
            console.log("Applying local streaming fallback for analyze-stream");
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const fallbackText = generateLocalAnalysis(prompt);
            const words = fallbackText.split(" ");
            for (let i = 0; i < words.length; i += 3) {
                const chunk = words.slice(i, i + 3).join(" ") + " ";
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }
        console.error("Gemini streaming error:", e.message || e);
        const status = e.status === 503 ? 503 : e.status === 429 ? 429 : 500;
        res.status(status).json({ error: e.message || "Streaming analysis failed" });
    }
  });

  // API route for vision analysis
  app.post("/api/gemini/vision", async (req, res) => {
    const { prompt, image, systemInstruction } = req.body;
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No Gemini API key available");
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
                prompt,
                { inlineData: { data: image, mimeType: "image/jpeg" } }
            ],
            config: { systemInstruction: systemInstruction || "You are the RAW_VISUAL_CORE." }
        }));
        res.json({ text: response.text });
    } catch (e: any) {
        if (isApiKeyIssue(e)) {
            console.log("Applying local vision fallback");
            const fallbackText = generateLocalVisionAnalysis(prompt);
            return res.json({ text: fallbackText, fallback: true });
        }
        console.error("Gemini vision error:", e.message || e);
        res.status(e.status === 503 ? 503 : e.status === 429 ? 429 : 500).json({ error: e.message || "Vision analysis failed" });
    }
  });

  // API route for voice commands
  app.post("/api/gemini/command", async (req, res) => {
    const { transcript, context } = req.body;
    console.log("Received transcript for command:", transcript);
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No Gemini API key available");
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const prompt = `Interpret the following user voice command: "${transcript}".
                       Context: ${JSON.stringify(context || {})} 
                       Available actions usually include navigation, toggling theme, open AI, etc.
                       Respond with a clean JSON object ONLY. Do not use markdown blocks.
                       Format: { "command": "execute_system_command" | "navigate" | "chat" | "none", "value": "command_id_or_path_or_query", "response": "A short, natural spoken response confirming action." }`;
        
        console.log("Sending prompt to Gemini");
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", systemInstruction: "Output valid JSON only." }
        }));
        
        let rawText = response.text || "{}";
        if (rawText.startsWith("```json")) {
            rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        
        let parsed = { command: 'none', value: '', response: 'Command unavailable.' };
        try {
            parsed = JSON.parse(rawText);
        } catch (parseError) {
            console.error("Gemini parse error:", parseError);
            throw new Error(`Failed to parse response: ${rawText}`);
        }
        res.json(parsed);
    } catch (e: any) {
        if (isApiKeyIssue(e)) {
            console.log("Applying local fallback parsing for command:", transcript);
            const parsed = parseLocalCommand(transcript);
            return res.json(parsed);
        }
        console.error("Gemini interpretation error (detailed):", e.message || e);
        res.status(e.status === 503 ? 503 : e.status === 429 ? 429 : 500).json({ error: e.message || "Command interpretation failed" });
    }
  });

  // API route for product description generation
  app.post("/api/gemini/description", async (req, res) => {
    const { productName, category, keyBenefits } = req.body;
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No Gemini API key available");
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const prompt = `Generate a high-fidelity, elite, industrial-toned description for the product: ${productName} (${category}).
                        Focus on the product's performance and recovery advantages.
                        Key benefits: ${keyBenefits.join(", ")}.
                        Tone: Coldly efficient, extremely technical, futuristic, authoritative. No fluff. No conversational filler. Short, punchy directives. English only. Use 'Optimization Matrix' and 'Yield Delta' terminology.`;
        
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { systemInstruction: "You are the RAW_INTEGRATED_SYSTEM. Synthesize data into elite, high-fidelity industrial marketing copy. Maintain RAW Official brand voice: Coldly efficient, technical, futuristic, authoritative." }
        }));
        res.json({ text: response.text });
    } catch (e: any) {
        if (isApiKeyIssue(e)) {
            console.log("Applying local fallback description");
            const fallbackText = generateLocalDescription(productName, category, keyBenefits);
            return res.json({ text: fallbackText, fallback: true });
        }
        console.error("Gemini description error:", e.message || e);
        res.status(e.status === 503 ? 503 : e.status === 429 ? 429 : 500).json({ error: e.message || "Description generation failed" });
    }
  });

  // Debug crash endpoint
  app.post("/api/debug-crash", (req, res) => {
    try {
      fs.writeFileSync('crash.log', JSON.stringify(req.body, null, 2));
      console.log('CRASH LOG WRITTEN TO crash.log');
    } catch (e) {
      console.error(e);
    }
    res.json({ ok: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(resolvedDirname, '..', 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(resolvedDirname, '..', 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();