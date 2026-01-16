import { processQuery } from '@/lib/dailyAssistant';
import { NextResponse } from 'next/server';

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
