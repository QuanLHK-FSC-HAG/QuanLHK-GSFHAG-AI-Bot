import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { type Message, Role } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We are not using chat.create() because we need to use googleSearch tool which is not supported in chat mode.
// We will manage the history manually.
export const generateResponse = async (history: Message[], newUserMessage: Message): Promise<Message> => {
    const model = ai.models.generateContent;

    const contents = [...history, newUserMessage].map(msg => ({
        role: msg.role,
        parts: msg.parts,
    }));

    const response = await model({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
        }
    });

    const botResponse: Message = {
        role: Role.MODEL,
        parts: [{ text: response.text }],
    };
    
    // Check for grounding chunks and append sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => `[${web.title}](${web.uri})`);
      
      if(sources.length > 0) {
        const sourcesText = `\n\n---\n**Nguồn tham khảo:**\n${sources.join('\n')}`;
        // Fix: Add a type guard to ensure the content part is a TextPart before accessing its 'text' property.
        const firstPart = botResponse.parts[0];
        if (firstPart && 'text' in firstPart) {
            firstPart.text += sourcesText;
        }
      }
    }

    return botResponse;
};
