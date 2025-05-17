import axios from 'axios';

export async function identifySpecies(imageUrl: string) {
  try {
    // Convert URL to base64 if needed
    const imageResponse = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              },
              {
                type: 'WEB_DETECTION',
                maxResults: 10
              }
            ]
          }
        ]
      },
      {
        timeout: 15000 // 15 second timeout
      }
    );
    
    // Process labels to find species
    const labels = response.data.responses[0]?.labelAnnotations || [];
    const webEntities = response.data.responses[0]?.webDetection?.webEntities || [];
    
    // Combine results from both detection types
    const potentialSpecies = [
      ...labels.map(item => ({
        name: item.description,
        confidence: item.score
      })),
      ...webEntities.map(item => ({
        name: item.description,
        confidence: item.score || 0.7
      }))
    ].filter(item => item.name && item.confidence > 0.7);
    
    // Filter for likely biological entities
    const biologicalKeywords = ['species', 'plant', 'animal', 'bird', 'tree', 'flower', 'insect', 
      'wildlife', 'flora', 'fauna', 'fish', 'mammal', 'reptile', 'amphibian'];
    
    const species = potentialSpecies.filter(sp => 
      biologicalKeywords.some(keyword => 
        sp.name.toLowerCase().includes(keyword)
      )
    );
    
    return {
      suggestions: species.length > 0 ? species.slice(0, 5) : potentialSpecies.slice(0, 5)
    };
    
  } catch (error) {
    console.error('Error identifying species:', error);
    // Return empty suggestions instead of failing the whole process
    return {
      suggestions: [],
      error: error instanceof Error ? error.message : 'Unknown error with species identification'
    };
  }
}
