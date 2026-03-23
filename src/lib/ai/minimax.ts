import OpenAI from "openai";
import { BaseAIProvider } from "./base-provider";
import type { ParseInput } from "@/types";

export class MinimaxProvider extends BaseAIProvider {
  async callModel(prompt: string, input: ParseInput): Promise<string> {
    const client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: "https://api.minimaxi.com/v1", // Minimax international compatible endpoint
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = [];

    if (input.type === "pdf" && input.content) {
      // Minimax's OpenAI compatibility might not perfectly support files.create for chat completions.
      // Trying the same approach as OpenAI. If it fails, users will need to use text.
      const pdfBuffer = Buffer.from(input.content, "base64");
      const uploadedFile = await client.files.create({
        file: new File([pdfBuffer], "document.pdf", { type: "application/pdf" }),
        purpose: "user_data",
      });

      content.push({
        type: "file",
        file: { file_id: uploadedFile.id },
      });
    } else if (input.type === "image" && input.content) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${input.mimeType || "image/jpeg"};base64,${input.content}`,
        },
      });
    }

    content.push({ type: "text", text: prompt });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: content.length === 1 && content[0].type === "text"
          ? (content[0].text as string)
          : content,
      },
    ];

    const response = await client.chat.completions.create({
      model: "MiniMax-Text-01", // Or MiniMax-Text-01, minmax-m2.5-chat, etc. We can try minmax-m2.5 
      messages,
      // MiniMax supports json_object for M2.5 and newer models as per docs
      response_format: { type: "json_object" }, 
    });

    return response.choices[0]?.message?.content || "";
  }
}
