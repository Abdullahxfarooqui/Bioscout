import axios from 'axios';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Mapping of scientific names to common names for more comprehensive results
const speciesDatabase: Record<string, string> = {
  // Mammals
  'Felis catus': 'Domestic Cat',
  'Canis lupus familiaris': 'Domestic Dog',
  'Panthera leo': 'Lion',
  'Panthera tigris': 'Tiger',
  'Panthera pardus': 'Leopard',
  'Acinonyx jubatus': 'Cheetah',
  'Loxodonta africana': 'African Elephant',
  'Giraffa camelopardalis': 'Giraffe',
  'Equus quagga': 'Zebra',
  'Equus ferus caballus': 'Horse',
  'Bos taurus': 'Cow',
  'Ovis aries': 'Sheep',
  'Capra aegagrus hircus': 'Goat',
  'Sus scrofa domesticus': 'Domestic Pig',
  'Vulpes vulpes': 'Red Fox',
  'Canis lupus': 'Wolf',
  'Ursus arctos': 'Brown Bear',
  'Ailuropoda melanoleuca': 'Giant Panda',
  'Phascolarctos cinereus': 'Koala',
  'Macropus rufus': 'Red Kangaroo',
  'Cervus elaphus': 'Red Deer',
  
  // Birds
  'Aquila chrysaetos': 'Golden Eagle',
  'Bubo bubo': 'Eurasian Eagle-Owl',
  'Columba livia': 'Rock Pigeon',
  'Anas platyrhynchos': 'Mallard Duck',
  'Anser anser': 'Greylag Goose',
  'Cygnus olor': 'Mute Swan',
  'Gallus gallus domesticus': 'Chicken',
  'Meleagris gallopavo': 'Wild Turkey',
  
  // Reptiles & Amphibians
  'Crocodylus niloticus': 'Nile Crocodile',
  'Python bivittatus': 'Burmese Python',
  'Chelonia mydas': 'Green Sea Turtle',
  'Iguana iguana': 'Green Iguana',
  'Xenopus laevis': 'African Clawed Frog',
  'Rana temporaria': 'European Common Frog',
  
  // Insects
  'Danaus plexippus': 'Monarch Butterfly',
  'Apis mellifera': 'Western Honey Bee',
  'Formica rufa': 'Red Wood Ant',
  
  // Plants
  'Quercus robur': 'English Oak',
  'Pinus sylvestris': 'Scots Pine',
  'Rosa chinensis': 'China Rose',
  'Tulipa gesneriana': 'Garden Tulip',
  'Bellis perennis': 'Common Daisy',
  'Helianthus annuus': 'Common Sunflower',
  'Orchis mascula': 'Early-purple Orchid',
  'Phoenix dactylifera': 'Date Palm',
  'Acer saccharum': 'Sugar Maple',
  'Pteridium aquilinum': 'Bracken Fern',
  
  // Common in Pakistan/Islamabad area
  'Pinus roxburghii': 'Chir Pine',
  'Acacia modesta': 'Phulai',
  'Dalbergia sissoo': 'Shisham',
  'Melia azedarach': 'Chinaberry Tree',
  'Bauhinia variegata': 'Orchid Tree',
  'Capra falconeri': 'Markhor',
  'Panthera pardus saxicolor': 'Persian Leopard',
  'Ursus thibetanus': 'Asiatic Black Bear',
  'Vulpes bengalensis': 'Bengal Fox',
  'Hystrix indica': 'Indian Crested Porcupine',
  'Francolinus pondicerianus': 'Grey Francolin',
  'Pavo cristatus': 'Indian Peafowl',
  'Athene brama': 'Spotted Owlet',
  'Prinia inornata': 'Plain Prinia',
  'Upupa epops': 'Hoopoe'
};

// Reverse lookup (common name to scientific)
const commonToScientific: Record<string, string> = {};
Object.entries(speciesDatabase).forEach(([scientific, common]) => {
  commonToScientific[common.toLowerCase()] = scientific;
});

// Models to use for different classifications
const MODELS = {
  // Using AntoineC's INaturalist Classifier - specifically designed for species identification
  INATURALIST_CLASSIFIER: 'AntoineC/inaturalist-resnet50-best',
  
  // Backup models if needed
  GENERIC_CLASSIFIER: 'microsoft/resnet-50',
  VISION_TRANSFORMER: 'google/vit-base-patch16-224'
};

// Function to clean up text
function cleanupSpeciesName(name: string): string {
  // Extract from patterns like "species: Felis catus" or "Scientific name: Felis catus"
  const matches = name.match(/(?:species|scientific name|name):\s*([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+[a-z]+)?)/i);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  // Check if it's already in binomial format (Genus species)
  const binomialMatch = name.match(/^([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+[a-z]+)?)$/);
  if (binomialMatch) {
    return binomialMatch[1];
  }
  
  return name;
}

// Get common name from scientific name
function getCommonName(scientificName: string): string | null {
  const cleanName = cleanupSpeciesName(scientificName);
  return speciesDatabase[cleanName] || null;
}

// Get scientific name from common name
function getScientificName(commonName: string): string | null {
  if (!commonName) return null;
  
  const lowerName = commonName.toLowerCase();
  
  // Direct lookup
  if (commonToScientific[lowerName]) {
    return commonToScientific[lowerName];
  }
  
  // Partial matches
  for (const [common, scientific] of Object.entries(commonToScientific)) {
    if (lowerName.includes(common) || common.includes(lowerName)) {
      return scientific;
    }
  }
  
  // Check if it's already in scientific format
  if (/^[A-Z][a-z]+\s+[a-z]+$/.test(commonName)) {
    return commonName;
  }
  
  return null;
}

interface IdentificationResult {
  suggestions: Array<{
    name: string;
    scientific_name?: string;
    confidence: number;
  }>;
  rawResponse?: string;
}

/**
 * Call the iNaturalist model API directly with proper error handling
 */
async function callINaturalistModel(imageData: ArrayBuffer | Blob | string): Promise<any> {
  try {
    // Using Hugging Face inference API with proper types
    return await hf.imageClassification({
      model: MODELS.INATURALIST_CLASSIFIER,
      data: imageData instanceof Buffer ? new Blob([imageData]) : imageData
    });
  } catch (error) {
    console.error("Error calling INaturalist model:", error);
    throw error;
  }
}

/**
 * Parse iNaturalist model output into a standardized format
 * The iNaturalist model returns labels that often contain the scientific name in parentheses
 */
function parseINaturalistResults(results: any[]): Array<{name: string, scientific_name?: string, confidence: number}> {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => {
    // iNaturalist labels often come in format "Common name (Scientific name)"
    const labelMatch = item.label.match(/^(.+?)\s*(?:\(([^)]+)\))?$/);
    
    let commonName = item.label;
    let scientificName: string | undefined;
    
    if (labelMatch) {
      commonName = labelMatch[1].trim();
      scientificName = labelMatch[2]?.trim();
    }
    
    // If we have a scientific name but no common name, try to get it from our database
    if (scientificName && !commonName) {
      const dbCommonName = getCommonName(scientificName);
      if (dbCommonName) {
        commonName = dbCommonName;
      } else {
        // If no common name found, use genus as common name
        commonName = scientificName.split(' ')[0];
      }
    }
    
    // If we have a common name but no scientific name, try to get it from our database
    if (!scientificName) {
      scientificName = getScientificName(commonName) || undefined;
    }
    
    return {
      name: commonName,
      scientific_name: scientificName,
      confidence: item.score
    };
  }).filter(item => item.confidence > 0.01); // Filter out very low confidence results
}

/**
 * Identifies species in an image using the iNaturalist Classifier
 */
export async function identifySpecies(imageUrl: string, useEnhancedMode = false): Promise<IdentificationResult> {
  try {
    console.log('🔍 Starting species identification with iNaturalist classifier...');
    
    // Fetch the image if it's a URL
    let imageData: ArrayBuffer | Blob | string;
    if (imageUrl.startsWith('data:')) {
      // It's already a data URL - use as is for the model
      imageData = imageUrl;
      console.log('🔄 Using image directly from data URL');
    } else {
      // Fetch from URL
      console.log('🔄 Fetching image from URL:', imageUrl);
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      // Convert to Blob for the model
      imageData = new Blob([response.data]);
      console.log('✅ Image fetched successfully');
    }
    
    // Call the iNaturalist model
    console.log('🧠 Running image through iNaturalist classifier...');
    const classificationResults = await callINaturalistModel(imageData);
    
    console.log('✅ iNaturalist classification complete', classificationResults);
    
    // Parse the results
    const suggestions = parseINaturalistResults(classificationResults);
    
    // Sort by confidence and limit to top 5
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestions = suggestions.slice(0, 5);
    
    // If enhanced mode is enabled and we have results
    if (useEnhancedMode && topSuggestions.length > 0) {
      console.log('🔍 Enhanced mode: Performing additional processing...');
      
      // For top suggestion without scientific name, try to find one
      const topSuggestion = topSuggestions[0];
      if (!topSuggestion.scientific_name) {
        // Try Wikipedia lookup for scientific name
        try {
          const wikiResponse = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topSuggestion.name)}`,
            { timeout: 5000 }
          );
          
          if (wikiResponse.data && wikiResponse.data.extract) {
            const extract = wikiResponse.data.extract;
            const scientificNameMatch = extract.match(/\b([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+[a-z]+)?)\b/);
            
            if (scientificNameMatch) {
              topSuggestion.scientific_name = scientificNameMatch[1];
              console.log('✅ Found scientific name from Wikipedia:', topSuggestion.scientific_name);
            }
          }
        } catch (error) {
          console.log('⚠️ Wikipedia lookup failed:', error);
        }
      }
    }
    
    // Generate detailed response for enhanced mode
    let rawResponse: string | undefined;
    if (useEnhancedMode && topSuggestions.length > 0) {
      const topSuggestion = topSuggestions[0];
      rawResponse = `I've identified this as a ${topSuggestion.name}${
        topSuggestion.scientific_name ? ` (${topSuggestion.scientific_name})` : ''
      } with ${Math.round(topSuggestion.confidence * 100)}% confidence. This identification is based on visual features analyzed by the iNaturalist classifier model, specifically trained on an extensive dataset of plant and animal species.`;
    }
    
    console.log('✅ Species identification complete');
    
    return {
      suggestions: topSuggestions,
      ...(rawResponse ? { rawResponse } : {})
    };
  } catch (error) {
    console.error('❌ Error in iNaturalist species identification:', error);
    
    return {
      suggestions: [],
      rawResponse: error instanceof Error ? `Error: ${error.message}` : 'Unknown error with species identification'
    };
  }
} 