interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_KEY = process.env.OPENROUTER_API_KEY || "";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/auto";

export async function generateChatResponse(
  history: ChatMessage[]
): Promise<AiResponse<string>> {
  try {
    if (!API_KEY) {
      return { success: false, error: "API key not configured" };
    }

    if (!history || history.length === 0) {
      return { success: false, error: "Chat history cannot be empty" };
    }

    const validRoles = history.every((msg) => msg.role === "user" || msg.role === "assistant");
    if (!validRoles) {
      return { success: false, error: "Invalid message role" };
    }

    const totalLength = history.reduce((sum, msg) => sum + msg.content.length, 0);
    if (totalLength > 10000) {
      return { success: false, error: "Input too long (max 10000 characters)" };
    }

    // Format messages for OpenRouter
    const messages = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await Promise.race([
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Calsyx",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", response.status, errorText);
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: "Rate limit exceeded. Please try again later." 
        };
      }
      if (response.status === 401) {
        return { 
          success: false, 
          error: "API key invalid or expired." 
        };
      }
      if (response.status === 400) {
        return { 
          success: false, 
          error: "Invalid request to AI provider." 
        };
      }
      return { success: false, error: "Failed to get AI response. Please try again." };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      return { success: false, error: "No response from API" };
    }

    return { success: true, data: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate response";
    
    if (message.includes("429") || message.includes("rate limit")) {
      return { 
        success: false, 
        error: "Rate limit exceeded. Try again later." 
      };
    }
    
    if (message.includes("401") || message.includes("unauthorized")) {
      return { 
        success: false, 
        error: "API key invalid. Check your configuration." 
      };
    }
    
    return { success: false, error: message };
  }
}

export async function generateChatTitle(message: string): Promise<AiResponse<string>> {
  try {
    if (!API_KEY) {
      return { success: false, error: "API key not configured" };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required" };
    }

    if (message.length > 1000) {
      return { success: false, error: "Message too long (max 1000 characters)" };
    }

    const response = await Promise.race([
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Calsyx",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: `Generate a very short chat title (max 5 words) from this message: "${message}". Return ONLY the title, no quotes or explanation.`,
            },
          ],
          max_tokens: 50,
          temperature: 0.5,
        }),
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Title Generation Error:", response.status, errorText);
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: "Rate limit exceeded." 
        };
      }
      if (response.status === 401) {
        return { 
          success: false, 
          error: "API key invalid." 
        };
      }
      return { success: false, error: "Failed to generate title." };
    }

    const data = await response.json();
    const title = (data.choices?.[0]?.message?.content || "Untitled Chat")
      .trim()
      .substring(0, 100);
    
    return { success: true, data: title };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate title";
    
    if (message.includes("429")) {
      return { 
        success: false, 
        error: "Rate limit exceeded." 
      };
    }
    
    return { success: false, error: message };
  }
}
