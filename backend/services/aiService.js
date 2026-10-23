
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini using the backend .env API key
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ''
);

const generateItinerary = async (tripData) => {
  const {
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    interests
  } = tripData;

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is missing from backend/.env'
    );
  }

  // Validate trip details
  if (!destination || !startDate || !endDate) {
    throw new Error(
      'Destination, start date, and end date are required.'
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    throw new Error('Please enter valid travel dates.');
  }

  // Include both the start and end dates
  const numDays =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (numDays > 14) {
    throw new Error(
      'Please select a trip of 14 days or fewer.'
    );
  }

  const numberOfTravelers = Math.max(
    1,
    Number(travelers) || 1
  );

  const totalBudget = Math.max(0, Number(budget) || 0);

  const interestsList =
    Array.isArray(interests) && interests.length > 0
      ? interests.join(', ')
      : 'sightseeing, local culture, food';

  const prompt = `
You are an expert travel itinerary planner.

Create a detailed ${numDays}-day itinerary.

TRIP DETAILS
Destination: ${destination}
Start date: ${start.toDateString()}
End date: ${end.toDateString()}
Total budget: $${totalBudget} USD
Travelers: ${numberOfTravelers}
Budget per traveler: $${Math.floor(
    totalBudget / numberOfTravelers
  )} USD
Interests: ${interestsList}

Return ONLY a valid JSON object. Do not include Markdown,
code fences, or explanations outside the JSON.

Use this exact structure:

{
  "summary": {
    "overview": "Short trip overview",
    "totalEstimatedCost": 0,
    "bestTimeToVisit": "Recommended season",
    "travelTips": [
      "Tip 1",
      "Tip 2",
      "Tip 3",
      "Tip 4",
      "Tip 5"
    ],
    "emergencyContacts": "Relevant emergency information"
  },
  "days": [
    {
      "day": 1,
      "date": "Formatted date",
      "theme": "Day theme",
      "activities": [
        {
          "time": "Morning",
          "activity": "Activity description",
          "location": "Place name",
          "duration": "2 hours",
          "cost": 0
        },
        {
          "time": "Afternoon",
          "activity": "Activity description",
          "location": "Place name",
          "duration": "3 hours",
          "cost": 0
        },
        {
          "time": "Evening",
          "activity": "Activity description",
          "location": "Place name",
          "duration": "2 hours",
          "cost": 0
        }
      ],
      "hotel": {
        "name": "Hotel name or suggested accommodation",
        "rating": "Rating if known",
        "pricePerNight": 0,
        "description": "Accommodation description"
      },
      "restaurants": [
        {
          "name": "Restaurant or suggested option",
          "cuisine": "Cuisine type",
          "meal": "Breakfast",
          "estimatedCost": 0,
          "mustTry": "Suggested dish"
        },
        {
          "name": "Restaurant or suggested option",
          "cuisine": "Cuisine type",
          "meal": "Lunch",
          "estimatedCost": 0,
          "mustTry": "Suggested dish"
        },
        {
          "name": "Restaurant or suggested option",
          "cuisine": "Cuisine type",
          "meal": "Dinner",
          "estimatedCost": 0,
          "mustTry": "Suggested dish"
        }
      ],
      "dailyCostEstimate": 0
    }
  ]
}

Requirements:
- Generate exactly ${numDays} day entries.
- Use the correct date for each day.
- Include realistic approximate prices in USD.
- Consider the destination and traveler interests.
- Do not claim prices, ratings, or availability are verified.
- All cost fields must be numbers.
`;

  try {
    // Use the updated Gemini model
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8192
      }
    });

    let result;
    let lastError;

    // Retry temporary server errors up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        lastError = error;

        const message = String(error.message || error);
        const isTemporary =
          /\b(503|500|502|504|429)\b/.test(message);

        if (!isTemporary || attempt === 3) {
          throw error;
        }

        // Exponential backoff: 2 seconds, then 4 seconds
        const delay = 2000 * Math.pow(2, attempt - 1);

        console.log(
          `Gemini request failed temporarily. ` +
          `Retry ${attempt + 1}/3 in ${delay / 1000}s.`
        );

        await new Promise(resolve =>
          setTimeout(resolve, delay)
        );
      }
    }

    if (!result) {
      throw lastError || new Error(
        'Gemini did not return a result.'
      );
    }

    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    // Remove optional Markdown fences
    const cleanedText = responseText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let itineraryData;

    try {
      itineraryData = JSON.parse(cleanedText);
    } catch {
      throw new Error(
        'AI returned invalid JSON. Please try again.'
      );
    }

    // Validate the main response structure
    if (
      !itineraryData ||
      !itineraryData.summary ||
      !Array.isArray(itineraryData.days) ||
      itineraryData.days.length !== numDays
    ) {
      throw new Error(
        'AI returned an incomplete itinerary. Please try again.'
      );
    }

    return itineraryData;

  } catch (error) {
    console.error(
      'Gemini itinerary generation error:',
      error.message || error
    );

    const message = String(error.message || error);

    if (message.includes('503')) {
      throw new Error(
        'Gemini is temporarily overloaded. Please wait a little and try again.'
      );
    }

    if (message.includes('429')) {
      throw new Error(
        'Gemini request limit reached. Please wait and try again.'
      );
    }

    if (
      message.includes('API_KEY') ||
      message.toLowerCase().includes('api key')
    ) {
      throw new Error(
        'Gemini API key issue. Check GEMINI_API_KEY in backend/.env.'
      );
    }

    throw new Error(`AI generation failed: ${message}`);
  }
};

module.exports = { generateItinerary };
