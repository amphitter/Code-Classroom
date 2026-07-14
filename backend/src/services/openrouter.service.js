const axios = require("axios");

// Fallback pool prioritizing free-tier options first, then stable legacy options
const MODEL_FALLBACK_POOL = [
  "google/gemma-3-27b-it:free",          // Your original starting model
  "openrouter/free",                     // Universal fallback pool router
  "anthropic/claude-3-haiku",            // Favicon for anthropic
  "mistralai/mistral-large",             // Favicon for mistralai
  "openai/gpt-3.5-turbo",                // Favicon for openai (Standard)
  "openai/gpt-3.5-turbo-0613",           // Favicon for openai (Older v0613)
  "openai/gpt-4-turbo-preview",          // Favicon for openai (Preview)
  "openai/gpt-4-turbo",                  // Favicon for openai (v1106 equivalent)
  "openai/gpt-3.5-turbo-instruct",       // Favicon for openai (Instruct)
  "openai/gpt-3.5-turbo-16k",            // Favicon for openai (16k)
  "openai/gpt-4",                        // Favicon for openai (GPT-4 Standard)
  "openai/gpt-4-0314",                   // Favicon for openai (Older v0314)
  "mancer/weaver-alpha",                 // Favicon for mancer (Weaver alpha)
  "undi95/remm-slerp-13b",               // Favicon for undi95 (ReMM SLERP)
  "gryphe/mythomax-l2-13b"               // Favicon for gryphe (MythoMax 13b format)
];

/**
 * Handles the actual API execution with built-in model fallbacks and retry logic
 */
const callOpenRouter = async (prompt) => {
  let lastError = null;

  // Loop through each model in our fallback pool sequentially if a failure occurs
  for (const model of MODEL_FALLBACK_POOL) {
    let retries = 2; // Number of times to retry a single model if rate-limited (429)
    let delay = 1500; // Base delay millisecond factor

    while (retries >= 0) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Code Build Launch",
            },
            timeout: 15000 // 15-second timeout window per execution block
          }
        );

        // Success! Extract and pass output back to the controller
        return response.data.choices[0].message.content;

      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status;
        const errorData = error?.response?.data;

        console.warn(`[OpenRouter Warning] Failed with model ${model}. Status: ${statusCode || error.message}`);

        // If Rate Limited (429), execute exponential backoff wait and stay on current model
        if (statusCode === 429 && retries > 0) {
          console.log(`[Rate Limit] Backing off for ${delay}ms. Retries remaining: ${retries}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential scale escalation
          continue;
        }

        // If Endpoint Not Found (404) or context errors, immediately break loop to step down to next fallback model
        break;
      }
    }
  }

  // If entire array loop runs out and exhausts options completely, log critical block trace
  console.error(
    "Critical OpenRouter Exhaustion Error:",
    lastError?.response?.data || lastError.message
  );
  throw new Error("OpenRouter generation failed across all available fallback engines.");
};

/*

|--------------------------------------------------------------------------
| Generate Task
|--------------------------------------------------------------------------
*/
const generateTask = async (topic, level, duration) => {
  const prompt = `
You are an expert coding instructor.

Create a classroom coding task.

Topic: ${topic}
Level: ${level}
Duration: ${duration}

Generate:

1. Title
2. Explanation
3. Instructions
4. Starter Code
5. Expected Output
6. Common Mistakes

Return JSON only.
`;

  return await callOpenRouter(prompt);
};

/*

|--------------------------------------------------------------------------
| Evaluate Submission
|--------------------------------------------------------------------------
*/
const evaluateSubmission = async (taskDescription, code) => {
  const prompt = `
You are an expert programming instructor.

TASK:
${taskDescription}

STUDENT CODE:
${code}

Evaluate:

1. Task Completion (0-40)
2. Correctness (0-30)
3. Code Quality (0-20)
4. Best Practices (0-10)

Return ONLY valid JSON:

{
 "score":0,
 "strengths":[],
 "mistakes":[],
 "feedback":""
}
`;

  return await callOpenRouter(prompt);
};

/*

|--------------------------------------------------------------------------
| AI Classroom Assistant
|--------------------------------------------------------------------------
*/
const generateClassroomContent = async (topic, level, duration) => {
  const prompt = `
You are an expert coding bootcamp instructor.

Topic:
${topic}

Level:
${level}

Duration:
${duration}

Generate ONLY valid JSON:

{
  "title":"",
  "explanation":"",
  "instructions":"",
  "starterCode":"",
  "expectedOutput":"",
  "evaluationCriteria":"",
  "notificationTitle":"",
  "notificationMessage":""
}

Rules:

- Beginner friendly
- Practical
- Industry oriented
- Clean JSON only
`;

  return await callOpenRouter(prompt);
};

module.exports = {
  generateTask,
  evaluateSubmission,
  generateClassroomContent,
};
