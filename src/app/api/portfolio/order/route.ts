import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ORDER_FILE_PATH = path.join(process.cwd(), 'data', 'portfolio-order.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Retrieve the portfolio order
export async function GET() {
  try {
    await ensureDataDir();
    try {
      const fileContents = await fs.readFile(ORDER_FILE_PATH, 'utf8');
      const order = JSON.parse(fileContents);
      return NextResponse.json({ order });
    } catch (error) {
      // File doesn't exist yet, return empty
      return NextResponse.json({ order: null });
    }
  } catch (error) {
    console.error('Error reading portfolio order:', error);
    return NextResponse.json({ error: 'Failed to read order' }, { status: 500 });
  }
}

// POST - Save the portfolio order
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    await fs.writeFile(ORDER_FILE_PATH, JSON.stringify(order, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving portfolio order:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
