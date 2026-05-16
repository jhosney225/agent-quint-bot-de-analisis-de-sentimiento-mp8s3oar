import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Store conversation history for context
const conversationHistory = [];

// Financial sentiment analysis system prompt
const systemPrompt = `You are an expert financial sentiment analyst specializing in analyzing news articles and financial news headlines. Your role is to:

1. Analyze the sentiment of financial news (positive, negative, neutral)
2. Identify key financial entities mentioned (companies, stocks, markets, indices)
3. Extract financial implications and potential impacts
4. Provide confidence scores for your sentiment analysis
5. Suggest investment implications based on the sentiment

When analyzing news:
- Consider market context and historical patterns
- Identify specific sectors affected
- Note any regulatory or macroeconomic factors
- Provide clear reasoning for your sentiment assessment

Format your responses with:
- SENTIMENT: [Positive/Negative/Neutral]
- CONFIDENCE: [0-100%]
- KEY ENTITIES: [list of financial entities]
- IMPACT LEVEL: [High/Medium/Low]
- ANALYSIS: [detailed explanation]
- INVESTMENT IMPLICATIONS: [brief suggestions]`;

async function analyzeNews(userMessage) {
  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory,
    });

    // Extract the assistant's response
    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Add assistant response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=".repeat(60));
  console.log("FINANCIAL NEWS SENTIMENT ANALYZER");
  console.log("=".repeat(60));
  console.log(
    "Analyze the sentiment of financial news and market impacts.\n"
  );
  console.log("Type 'exit' to quit, 'clear' to reset conversation.\n");
  console.log("-".repeat(60));

  // Demo mode with sample news articles
  const sampleNews = [
    "Apple announces record quarterly profits and plans $100B stock buyback program",
    "Major bank's credit rating downgraded due to economic slowdown concerns",
    "New AI startup secures $500M Series B funding from leading tech investors",
  ];

  console.log("\nRunning sentiment analysis on sample financial news...\n");

  for (const newsItem of sampleNews) {
    console.log(`\nAnalyzing: "${newsItem}"`);
    console.log("-".repeat(60));

    const analysis = await analyzeNews(
      `Please analyze this financial news headline: "${newsItem}"`
    );
    console.log(analysis);
    console.log("-".repeat(60));
  }

  // Interactive mode
  console.log("\n\nEntering interactive mode. Enter your own financial news:");
  console.log("=".repeat(60) + "\n");

  const askQuestion = () => {
    rl.question("Enter financial news to analyze (or 'exit'/'clear'): ", 
      async (input) => {
        const userInput = input.trim();

        if (userInput.toLowerCase() === "exit") {
          console.log(
            "\nThank you for using the Financial Sentiment Analyzer!"
          );
          rl.close();
          return;
        }

        if (userInput.toLowerCase() === "clear") {
          conversationHistory.length = 0;
          console.log("Conversation history cleared.\n");
          askQuestion();
          return;
        }

        if (!userInput) {
          askQuestion();
          return;
        }

        try {
          const analysis = await analyzeNews(userInput);
          console.log("\nAnalysis:\n");
          console.log(analysis);
          console.log("\n" + "-".repeat(60) + "\n");
        } catch (error) {
          console.error("Error during analysis:", error);
        }

        askQuestion();
      }
    );
  };

  askQuestion();
}

main().catch(console.error);