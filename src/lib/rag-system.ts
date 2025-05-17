import axios from 'axios';
import { firestore } from './firebase'; // Changed db to firestore
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Extract keywords from a question for search
function extractKeywords(question: string): string[] {
  return question.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'does', 'how', 'many', 'much', 'with', 'that', 'this', 'have', 'from'].includes(word));
}

// Retrieve relevant context from knowledge base and observations
async function retrieveContext(question: string): Promise<string> {
  const keywords = extractKeywords(question);
  
  // Removed immediate return of default context if keywords.length === 0
  // Let's try to process even if keyword extraction is minimal.
  
  try {
    // Get relevant knowledge base snippets
    const knowledgeBaseSnippets: string[] = [];
    const knowledgeBaseRef = collection(firestore, 'knowledge_base'); // Changed db to firestore
    
    for (const keyword of keywords) {
      const q = query(knowledgeBaseRef, where('tags', 'array-contains', keyword));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.docs.forEach(doc => {
        knowledgeBaseSnippets.push(doc.data().content);
      });
    }
    
    // Get relevant observation notes
    const observationNotes: string[] = [];
    const observationsRef = collection(firestore, 'observations'); // Changed db to firestore
    
    // First try direct keyword matches
    for (const keyword of keywords) {
      const q = query(
        observationsRef, 
        where('notes', '>=', keyword), 
        where('notes', '<=', keyword + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        observationNotes.push(`Observation of ${data.common_name} (${data.species_name}) at ${data.location}: ${data.notes}`);
      });
    }
    
    // If no direct matches, add some recent observations
    if (observationNotes.length === 0) {
      const recentQuery = query(
        observationsRef,
        orderBy('created_at', 'desc'),
        limit(3)
      );
      const recentSnapshot = await getDocs(recentQuery);
      
      recentSnapshot.docs.forEach(doc => {
        const data = doc.data();
        observationNotes.push(`Recent observation of ${data.common_name} (${data.species_name}) at ${data.location}: ${data.notes}`);
      });
    }
    
    // Combine all context
    const allContext = [...knowledgeBaseSnippets, ...observationNotes];
    
    if (allContext.length === 0) {
      // Return an empty string or a message indicating no specific context was found
      // instead of the generic default context.
      return "No specific information found in the knowledge base for your query."; 
    }
    
    return allContext.join('\n\n');
    
  } catch (error) {
    console.error('Error retrieving context:', error);
    // Return an error message or an empty string instead of default context
    return "An error occurred while retrieving context. Please try again.";
  }
}

// Default context about Islamabad biodiversity
function getDefaultContext(): string {
  return `
    Islamabad is located at the edge of the Potohar Plateau and contains diverse habitats.
    Margalla Hills National Park is located north of Islamabad and is home to various wildlife species.
    Common species in Islamabad include the common leopard, rhesus monkey, barking deer, and various bird species.
    The city has a humid subtropical climate with four distinct seasons.
    Rawal Lake is a major water reservoir and habitat for migratory birds.
    The Margalla Hills are part of the Himalayan foothills and host over 600 plant species.
    Islamabad's biodiversity includes approximately 250 bird species, 38 mammals, and 13 reptile species.
  `;
}

// Generate answer using Hugging Face API
export async function generateAnswer(question: string): Promise<string> {
  try {
    // Get context relevant to the question
    const context = await retrieveContext(question);
    
    // Call Hugging Face API for answer generation
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-xl',
      {
        inputs: `
Context information specifically about the wildlife of Margalla Hills National Park. This includes its native mammals, birds, reptiles, insects, and plant biodiversity. Focus on ecological significance, conservation status, and species-specific data related to Margalla Hills National Park.
${context}

Question: ${question}

Strictly adhere to the following: 
1. If the question is about the wildlife of Margalla Hills National Park (including its flora, fauna, ecological significance, conservation status, or species-specific data) AND the provided context contains relevant information, provide a detailed and accurate answer based ONLY on the context.
2. If the question is about Margalla Hills National Park but the context does NOT provide relevant information to answer it, respond with: "The provided information does not contain specific details to answer your question about Margalla Hills National Park's wildlife. I can only provide information based on the available knowledge."
3. If the question is NOT about the wildlife of Margalla Hills National Park, respond with: "I can only provide information about the wildlife of Margalla Hills National Park (mammals, birds, reptiles, insects, and plant biodiversity)."

Answer:
`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Handle different response formats from Hugging Face
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text;
    } else if (typeof response.data === 'string') {
      return response.data;
    } else if (response.data.generated_text) {
      return response.data.generated_text;
    }
    
    return "I can only provide information about the wildlife of Margalla Hills National Park.";
    
  } catch (error) {
    console.error('Error generating answer:', error);
    return "I'm sorry, I couldn't generate an answer at this time. Please try again later.";
  }
}
