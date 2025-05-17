import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { 
  ref as dbRef, 
  push, 
  set, 
  get,
  query, 
  orderByChild,
  limitToLast
} from 'firebase/database';

// Function to store an image directly in the database
export async function storeImageInDatabase(buffer: Buffer): Promise<string> {
  try {
    // Convert buffer to base64 string
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    const imageId = uuidv4();
    const imageRef = dbRef(db, `images/${imageId}`);
    
    // Store the image data in the database
    await set(imageRef, {
      id: imageId,
      data: base64Image,
      timestamp: Date.now()
    });
    
    // Return a reference to the image
    return `db-image:${imageId}`;
  } catch (error) {
    console.error("Error storing image:", error);
    throw error;
  }
}

// Function to get an image from the database
export async function getImageFromDatabase(imageId: string): Promise<string | null> {
  try {
    const imageRef = dbRef(db, `images/${imageId}`);
    const snapshot = await get(imageRef);
    
    if (snapshot.exists()) {
      return snapshot.val().data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

// Function to store an observation in the database
export async function storeObservation(data: any): Promise<string> {
  const id = uuidv4();
  const observationRef = dbRef(db, `observations/${id}`);
  
  await set(observationRef, {
    ...data,
    observation_id: id,
    created_at: Date.now()
  });
  
  return id;
}

// Function to get all observations
export async function getAllObservations(limit = 20): Promise<any[]> {
  try {
    const observationsRef = dbRef(db, 'observations');
    const observationsQuery = query(
      observationsRef,
      orderByChild('created_at')
    );
    
    const snapshot = await get(observationsQuery);
    const observations: any[] = [];
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array and sort by created_at (descending)
      Object.keys(data).forEach(key => {
        observations.push(data[key]);
      });
      observations.sort((a, b) => b.created_at - a.created_at);
    }
    
    // Return limited number of observations
    return observations.slice(0, limit);
  } catch (error) {
    console.error("Error fetching observations:", error);
    return [];
  }
}

// Function to get a specific observation
export async function getObservationById(id: string): Promise<any | null> {
  try {
    const observationRef = dbRef(db, `observations/${id}`);
    const snapshot = await get(observationRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching observation:", error);
    return null;
  }
}
