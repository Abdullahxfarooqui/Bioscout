// This file provides a simple offline Q&A system until the RAG system can be integrated with Firebase

interface QuestionMatch {
  keywords: string[];
  answer: string;
}

// Predefined Q&A pairs about Islamabad's biodiversity
const predefinedAnswers: QuestionMatch[] = [
  {
    keywords: ['margalla', 'hills', 'species', 'biodiversity'],
    answer: 'Margalla Hills National Park in Islamabad hosts over 600 plant species, 250 bird species, 38 mammals, and 13 reptile species. It\'s the city\'s primary habitat for local wildlife and offers important ecological services to the region.'
  },
  {
    keywords: ['leopard', 'common', 'panthera'],
    answer: 'The Common Leopard (Panthera pardus) is considered an apex predator in Margalla Hills. It primarily feeds on wild boar, barking deer, and monkeys. Despite urbanization, leopards have adapted to living in proximity to human settlements in Islamabad.'
  },
  {
    keywords: ['bird', 'rawal', 'lake', 'migratory'],
    answer: 'Rawal Lake serves as a critical water source for Islamabad and attracts numerous migratory birds from Central Asia during winter months (November to February). Common visitors include the Common Pochard, Northern Pintail, and Common Teal.'
  },
  {
    keywords: ['tree', 'plant', 'pine', 'chir', 'flora'],
    answer: 'Islamabad\'s vegetation includes a variety of trees such as Chir Pine (Pinus roxburghii), Blue Pine (Pinus wallichiana), Silver Oak (Grevillea robusta), and Paper Mulberry (Broussonetia papyrifera). The Paper Mulberry, though non-native, has become invasive and contributes to pollen allergies in the region.'
  },
  {
    keywords: ['climate', 'weather', 'season'],
    answer: 'Islamabad and the Margalla Hills experience a subtropical highland climate with five distinct seasons: winter (November-February), spring (March-April), summer (May-June), monsoon (July-August), and autumn (September-October). This climatic variation supports diverse ecological niches.'
  },
  {
    keywords: ['snake', 'reptile', 'cobra'],
    answer: 'The Potohar Plateau, where Islamabad is situated, has a rich diversity of reptile species including the Indian Cobra (Naja naja), Saw-scaled Viper (Echis carinatus), and Monitor Lizards. These species play crucial roles in controlling pest populations.'
  },
  {
    keywords: ['monkey', 'macaque', 'rhesus'],
    answer: 'The Rhesus Macaque (Macaca mulatta) is a common primate species in the Margalla Hills. These social animals live in groups and have adapted to human presence, often coming into contact with visitors and residents near the hills.'
  },
  {
    keywords: ['butterfly', 'insect', 'pollinator'],
    answer: 'Islamabad hosts several butterfly species like the Common Mormon (Papilio polytes), Lime Butterfly (Papilio demoleus), and Common Tiger (Danaus genutia). These insects serve as important pollinators for many plant species in the region.'
  },
  {
    keywords: ['conservation', 'threat', 'protect', 'endangered'],
    answer: 'Conservation efforts in Islamabad focus on protecting the Margalla Hills ecosystem from threats like deforestation, urban encroachment, and illegal hunting. The Capital Development Authority (CDA) and the Islamabad Wildlife Management Board work to preserve these natural habitats.'
  }
];

// Function to match a question to predefined answers
export function generateDefaultAnswer(question: string): string {
  const lowerCaseQuestion = question.toLowerCase();
  
  // Check for matches with predefined answers
  for (const qa of predefinedAnswers) {
    if (qa.keywords.some(keyword => lowerCaseQuestion.includes(keyword))) {
      return qa.answer;
    }
  }
  
  // Default answer if no match found
  return "I don't have specific information about that aspect of Islamabad's biodiversity. The region is home to a diverse ecosystem including the Margalla Hills National Park with hundreds of plant and animal species. Consider visiting the Islamabad Wildlife Management Board's resources for more detailed information.";
}
