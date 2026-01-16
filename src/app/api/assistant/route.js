import { NextResponse } from 'next/server';

async function processQuery(query, userId = 1) {
    const q = query.toLowerCase();
    return {
        type: "text",
        text: "Je peux vous aider avec la météo, les tâches, et les conseils financiers.",
        data: null
    };
}

export async function POST(request) {
    try {
        const { query, userId } = await request.json();
        const response = await processQuery(query, userId || 1);
        return NextResponse.json(response);
    } catch (error) {
        console.error('API Assistant Error:', error);
        return NextResponse.json(
            { text: "Une erreur est survenue lors de la communication avec l'assistant." },
            { status: 500 }
        );
    }
}
