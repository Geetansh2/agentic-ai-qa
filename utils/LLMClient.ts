import OpenAI from "openai";

export class LLMClient{
    private readonly client: OpenAI;

    constructor(){
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey){
            throw new Error(
                'OPENAI_API_KEY is not configured'
            );
        }

        this.client = new OpenAI({
            apiKey,
        });
    }

    async ask(prompt: string): Promise<string>{
        const response = await this.client.responses.create({
            model: 'gpt-5-mini',
            input: prompt,
        });

        return response.output_text;

    }
}