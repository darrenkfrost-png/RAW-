export interface GeminiResponse {
  text: string;
}

// Client-side heuristics fallback mapping voice commands directly to action parameters
function parseClientCommand(transcript: string) {
  const t = transcript.toLowerCase().trim();
  
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

  // Diagnostics, Settings and System interfaces
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

  // Audio Reader control
  if (t.includes("play") || t.includes("resume") || t.includes("read")) {
    return { command: "execute_system_command", value: "reader_play", response: "Resuming vocal narration." };
  }
  if (t.includes("pause") || t.includes("stop voice")) {
    return { command: "execute_system_command", value: "reader_pause", response: "Vocal synthetic feed paused." };
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

  // Graphic rendering quality levels
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

  // Greetings and Identity indicators
  if (t.includes("hello") || t.includes("hi ") || t === "hi") {
    return { command: "none", value: "", response: "Hello, Operative. Welcome to RAW command matrix. Speak a directive or tap any UI focal point to proceed." };
  }
  if (t.includes("who are you") || t.includes("your name")) {
    return { command: "none", value: "", response: "I am the RAW Integrated Assistant. I govern the diagnostics, nutrition calculators, and neural interfaces of your workstation." };
  }

  return {
    command: "none",
    value: "",
    response: `Direct command recognized: "${transcript}". No direct page match. Please specify a navigation target or system command.`
  };
}

/**
 * ⚠️ WHEN THE ADVISOR IS OFFLINE, IT SAYS SO. IT DOES NOT INVENT.
 *
 * These methods used to answer an unreachable server with fabricated output
 * dressed as real analysis: invented percentages ("BIO-UTILIZATION INTENT:
 * +18.2% vs baseline", "NEURAL LATENCY REDUCTION: 12ms"), a vision "scan"
 * reporting "OCR MATCH DETECTED: positive RAW markings verified" for an image
 * it had never seen, a stream announcing "SECURE FEED RESTORED — Authorized
 * Advisor online" at the exact moment it was not, and product copy describing
 * a "micro-filtered isolate peptide lattice" for whatever it was handed,
 * including a power bank.
 *
 * That is not a resilience feature, it is a machine telling a customer things
 * about a supplement that nobody checked. And it was not a rare edge case:
 * every AI route lives on the Express server, so a STATIC deployment — which
 * is what the Netlify and Vercel configs build — has no /api at all, and
 * 100% of AI interactions would have returned this invented material.
 * Measured on the running app: POST /api/gemini/description -> 404.
 *
 * An offline advisor is a small disappointment. An advisor that quietly makes
 * up health claims is a liability. So every fallback below now states plainly
 * that the service is unavailable.
 *
 * The one exception is `command`, which falls back to parseClientCommand —
 * a real keyword parser doing real work locally. It invents nothing.
 */
const OFFLINE_NOTICE = `### Advisor unavailable

The AI advisor could not be reached, so there is nothing to report here — this
message is not analysis, and nothing has been generated in its place.

This usually means the site is running without its AI service connected.
Everything else on the site works normally, and the product pages carry the
real specifications.`;

export const geminiService = {
  async analyze(prompt: string, systemInstruction?: string): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
    } catch (error) {
      console.warn('Gemini analyze unavailable:', error);
      return { text: OFFLINE_NOTICE };
    }
  },

  async analyzeStream(prompt: string, systemInstruction: string, onChunk: (text: string) => void): Promise<void> {
    try {
      const response = await fetch('/api/gemini/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed on server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const json = JSON.parse(data);
              onChunk(json.text);
            } catch (e) {
              console.error('Streaming parse error', e);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Gemini analyzeStream unavailable:', error);
      // Emitted in one piece: a typewriter effect on an error would imitate a
      // live answer, which is the very impression this must not create.
      onChunk(OFFLINE_NOTICE);
    }
  },

  async vision(prompt: string, imageBase64: string, systemInstruction?: string): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image: imageBase64, systemInstruction }),
      });
      if (!response.ok) throw new Error('Vision analysis failed');
      return await response.json();
    } catch (error) {
      console.warn('Gemini vision unavailable:', error);
      return {
        text: `### Scan unavailable

The image could not be sent for analysis, so nothing was scanned and no result
is being shown. Nothing about this product has been read or verified here.`,
      };
    }
  },

  async command(transcript: string): Promise<{ command: string; value: string; response: string }> {
    try {
      const response = await fetch('/api/gemini/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) throw new Error('Command failed');
      return await response.json();
    } catch (error) {
      console.warn('Gemini command failed, parsing via client-side heuristics helper:', error);
      return parseClientCommand(transcript);
    }
  },

  async generateDescription(productName: string, category: string, keyBenefits: string[]): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/gemini/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, category, keyBenefits }),
      });
      if (!response.ok) throw new Error('Description generation failed');
      return await response.json();
    } catch (error) {
      console.warn('Gemini description unavailable:', error);
      // Deliberately returns the product's own name and nothing more: writing
      // marketing claims for an arbitrary product is exactly the fabrication
      // this fallback existed to produce.
      return {
        text: `Description unavailable for ${productName}. The generator could not be reached; see the product's own specifications on this page.`,
      };
    }
  }
};
