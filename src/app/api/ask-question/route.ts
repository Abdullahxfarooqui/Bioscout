import { NextRequest, NextResponse } from 'next/server';
import { addQuestionAnswer } from '@/lib/database';
import { generateDefaultAnswer } from '@/lib/offline-answers';

// Function to generate answers without a full RAG system
// until database issues are resolved
async function generateAnswer(question: string): Promise<string> {
  // This function returns predefined answers based on keywords
  // or a default answer if no match is found
  return generateDefaultAnswer(question);
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // Generate answer (using offline answers for now)
    const answer = await generateAnswer(question);
    
    // Save question and answer using database helper
    const result = await addQuestionAnswer({
      text: question,
      answer
    });
    
    return NextResponse.json({
      id: result.id,
      question,
      answer
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing question:', error);
    return NextResponse.json({ 
      error: 'Failed to process question',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
