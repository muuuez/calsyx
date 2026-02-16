import { GoogleGenerativeAI } from "@google/generative-ai";

interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateChatResponse(
  history: ChatMessage[]
): Promise<AiResponse<string>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build prompt from chat history
    const promptText = history.map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      return `${role}: ${msg.content}`;
    }).join("\n");

    const response = await Promise.race([
      model.generateContent(promptText),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);

    const text = response.response.text();
    return { success: true, data: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate response";
    return { success: false, error: message };
  }
}

export async function generateChatTitle(message: string): Promise<AiResponse<string>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required" };
    }

    if (message.length > 1000) {
      return { success: false, error: "Message too long (max 1000 characters)" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const response = await Promise.race([
      model.generateContent(
        `Generate a very short chat title (max 5 words) from this message: "${message}". Return ONLY the title, no quotes or explanation.`
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);

    const title = response.response.text().trim().substring(0, 100);
    return { success: true, data: title };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate title";
    return { success: false, error: message };
  }
}
