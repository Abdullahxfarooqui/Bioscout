import { NextRequest, NextResponse } from 'next/server';
// Import the new Hugging Face implementation instead of Google Vision
import { identifySpecies } from '@/lib/hugging-face-api';

export async function GET(req: NextRequest) {
  try {
    // Get the image URL from the query parameters
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('imageUrl');
    // Support both parameter names for backwards compatibility
    const useEnhancedMode = url.searchParams.get('enhancedMode') === 'true' || 
                           url.searchParams.get('enhancedPrompt') === 'true';
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image URL is required',
        usage: 'Add ?imageUrl=<your-image-url> to test the species identification'
      }, { status: 400 });
    }
    
    console.log('🔍 Testing Hugging Face species identification with image:', imageUrl);
    console.log('Using enhanced mode:', useEnhancedMode);
    
    // Call the identifySpecies function with the enhanced mode option
    const result = await identifySpecies(imageUrl, useEnhancedMode);
    
    // Return the result
    return NextResponse.json({
      message: 'Species identification completed',
      imageUrl,
      enhancedModeUsed: useEnhancedMode,
      result
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error in species identification:', error);
    return NextResponse.json({ 
      error: 'Failed to identify species',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 