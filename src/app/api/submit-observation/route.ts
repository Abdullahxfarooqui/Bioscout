import { NextRequest, NextResponse } from 'next/server';
import { identifySpecies } from '@/lib/vision-api';
import { storeImageInDatabase, storeObservation } from '@/lib/database-helpers';
import { Observation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract form data
    const species_name = formData.get('species_name') as string;
    const common_name = formData.get('common_name') as string;
    const date_observed = formData.get('date_observed') as string;
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
    
    try {
      // Convert the image to a Buffer directly
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      
      // Store the image directly in the database
      const image_url = await storeImageInDatabase(imageBuffer);
      
      // Get AI identification (optional - will continue if this fails)
      let ai_identification: Observation['ai_identification'] = { suggestions: [] };
      try {
        // Since we're using a database reference, we'll skip AI identification for now
        ai_identification = { 
          suggestions: [
            { name: "AI identification unavailable", confidence: 0 }
          ] 
        };
      } catch (aiError) {
        console.error('Error with species identification:', aiError);
      }
      
      // Store the observation with image reference
      const observation_id = await storeObservation({
        species_name,
        common_name,
        date_observed,
        location,
        image_url,
        notes,
        ai_identification
      });
      
      return NextResponse.json({ 
        message: 'Observation submitted successfully',
        observation_id
      }, { status: 201 });
      
    } catch (storageError) {
      console.error('Error storing data:', storageError);
      throw new Error(`Failed to store data: ${storageError.message}`);
    }
    
  } catch (error) {
    console.error('Error submitting observation:', error);
    return NextResponse.json({ 
      error: 'Failed to submit observation',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
