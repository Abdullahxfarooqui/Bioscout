import axios from 'axios';
import { db } from './firebase';
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
  
  if (keywords.length === 0) {
    return getDefaultContext();
  }
  
  try {
    // Get relevant knowledge base snippets
    const knowledgeBaseSnippets: string[] = [];
    const knowledgeBaseRef = collection(db, 'knowledge_base');
    
    for (const keyword of keywords) {
      const q = query(knowledgeBaseRef, where('tags', 'array-contains', keyword));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.docs.forEach(doc => {
        knowledgeBaseSnippets.push(doc.data().content);
      });
    }
    
    // Get relevant observation notes
    const observationNotes: string[] = [];
    const observationsRef = collection(db, 'observations');
    
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
      return getDefaultContext();
    }
    
    return allContext.join('\n\n');
    
  } catch (error) {
    console.error('Error retrieving context:', error);
    return getDefaultContext();
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
Context information about biodiversity in Islamabad:
${context}

Question: ${question}

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
    
    return "I don't have enough information to answer that question about Islamabad's biodiversity.";
    
  } catch (error) {
    console.error('Error generating answer:', error);
    return "I'm sorry, I couldn't generate an answer at this time. Please try again later.";
  }
}
