import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/data';

export async function GET() {
    try {
        const data = await getDashboardData(1);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
