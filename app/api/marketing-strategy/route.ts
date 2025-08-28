import { cookiesManager } from "@/app/utils/cookies";
import { NextResponse } from "next/server";
import type {
  MarketingStrategyData,
  MarketingStrategyProcessedData,
} from "@/types/marketing-strategy";
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";

// Enhanced function to process the raw data from backend into structured format
function processMarketingStrategyData(
  rawData: MarketingStrategyData
): MarketingStrategyProcessedData {
  // Extract product name from various sources
  let productName = "";
  if (extractProductNameFromText(rawData?.value_proposition)) {
    productName =
      extractProductNameFromText(rawData?.value_proposition) || "Your Product";
  } else if (extractProductNameFromText(rawData?.product_summary)) {
    productName =
      extractProductNameFromText(rawData?.product_summary) || "Your Product";
  }

  // Extract description from ideal customer market fit or product summary
  let description = "";

  if (extractDescriptionFromText(rawData.ideal_customer_market_fit)) {
    description =
      extractDescriptionFromText(rawData.ideal_customer_market_fit) ||
      "Your app is in early launch. It likely receives minimal traffic and relies heavily on direct outreach. Focus now is on creating awareness, testing core value props, and building traction.";
  } else if (extractDescriptionFromText(rawData.product_summary)) {
    description =
      extractDescriptionFromText(rawData.product_summary) ||
      "Your app is in early launch. It likely receives minimal traffic and relies heavily on direct outreach. Focus now is on creating awareness, testing core value props, and building traction.";
  }
  // Extract stage information from the content
  let stage = "";
  stage =
    extractStageFromText(rawData.marketing_strategy_validation_path) ||
    "Validate Product-Market Fit";

  // Extract target users from the market fit content
  let targetUsers = [];
  targetUsers = extractTargetUsersFromText(rawData.ideal_customer_market_fit);

  // Extract differentiators from value proposition
  let differentiators = [];
  differentiators = extractDifferentiatorsFromText(rawData.value_proposition);

  // Extract objectives from the strategy content
  let objective = "";
  objective =
    extractObjectiveFromText(rawData.marketing_strategy_validation_path) ||
    "Validate need + Acquire first users";

  const productAnalysis = {
    overview: {
      product: productName,
      stage: stage,
      description: description,
    },
    targetUsers: targetUsers,
    differentiators: differentiators,
  };

  const growthStrategy = {
    overview: {
      objective: objective,
      goToMarket: stage,
    },
  };

  return {
    // productAnalysis,
    // growthStrategy,
    marketingStrategyValidationPath: rawData.marketing_strategy_validation_path,
    detailedSocialMediaStrategy: rawData.detailed_social_media_strategy,
    productSummary: rawData.product_summary,
    idealCustomerMarketFit: rawData.ideal_customer_market_fit,
    valueProposition: rawData.value_proposition,
  };
}

// Enhanced helper functions to extract data from markdown/text content
function extractProductNameFromText(text: string): string | null {
  // Look for various patterns of product names
  const patterns = [
    /(?:product|app|service|platform)(?:\s+name)?:?\s*([^.\n\r]+)/i,
    /(?:introducing|meet|welcome to)\s+([^.\n\r]+)/i,
    /^([A-Z][A-Za-z\s]+(?:AI|App|Platform|Service))/m,
    /\*\*([^*]+(?:AI|App|Platform|Service)[^*]*)\*\*/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 3 && name.length < 100) {
        return name;
      }
    }
  }
  return null;
}

function extractDescriptionFromText(text: string): string | null {
  // Extract meaningful description paragraphs
  const lines = text.split(/\n+/).filter((line) => line.trim().length > 50);

  for (const line of lines) {
    // Skip headers and bullet points
    if (
      !line.match(/^#+\s/) &&
      !line.match(/^\s*[-*]\s/) &&
      !line.match(/^\d+\.\s/)
    ) {
      const cleaned = line.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
      if (cleaned.length > 50 && cleaned.length < 300) {
        return cleaned.endsWith(".") ? cleaned : cleaned + ".";
      }
    }
  }

  return null;
}

function extractStageFromText(text: string): string | null {
  const stagePatterns = [
    /(?:stage|phase):\s*([^.\n\r]+)/i,
    /(?:current|in|at)\s+([^.\n\r]*(?:stage|phase|launch|validation|growth)[^.\n\r]*)/i,
    /(pre-launch|launch|post-launch|validation|growth|scale)/i,
  ];

  for (const pattern of stagePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractTargetUsersFromText(text: string): string[] {
  const users: string[] = [];

  // Look for bullet points or numbered lists describing users
  const userPatterns = [
    /[-*]\s*([^.\n\r]+(?:users?|customers?|audience|demographic)[^.\n\r]*)/gi,
    /\d+\.\s*([^.\n\r]+(?:users?|customers?|audience|demographic)[^.\n\r]*)/gi,
    /(?:target|ideal)\s+(?:users?|customers?|audience):\s*([^.\n\r]+)/gi,
  ];

  for (const pattern of userPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const user = match[1].trim().replace(/[*_]/g, "");
        if (user.length > 10 && user.length < 150) {
          users.push(user);
        }
      }
    }
  }

  // If no specific users found, extract general demographic info
  if (users.length === 0) {
    const demographicMatches = text.match(
      /(?:ages?\s+\d+[-\s]*\d*|young|elderly|students?|professionals?|parents?|owners?)/gi
    );
    if (demographicMatches) {
      return ["Target users identified in market analysis"];
    }
  }

  return users.length > 0
    ? users.slice(0, 6)
    : [
      "Urban professionals and busy individuals",
      "Target demographic from market research",
      "Early adopters and tech-savvy users",
    ];
}

function extractDifferentiatorsFromText(text: string): string[] {
  const differentiators: string[] = [];

  // Look for features, benefits, or differentiators
  const diffPatterns = [
    /[-*]\s*([^.\n\r]+(?:AI|feature|benefit|unique|advantage|innovative)[^.\n\r]*)/gi,
    /\d+\.\s*([^.\n\r]+(?:AI|feature|benefit|unique|advantage|innovative)[^.\n\r]*)/gi,
    /(?:key features?|benefits?|advantages?):\s*([^.\n\r]+)/gi,
  ];

  for (const pattern of diffPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const diff = match[1].trim().replace(/[*_]/g, "");
        if (diff.length > 10 && diff.length < 150) {
          differentiators.push(diff);
        }
      }
    }
  }

  return differentiators.length > 0
    ? differentiators.slice(0, 6)
    : [
      "Unique value proposition from analysis",
      "Competitive advantages identified",
      "Key features and benefits",
    ];
}

function extractObjectiveFromText(text: string): string | null {
  const objectivePatterns = [
    /(?:objective|goal|aim):\s*([^.\n\r]+)/i,
    /(?:target|acquire|reach)\s+(\d+[^.\n\r]*(?:users?|customers?|signups?)[^.\n\r]*)/i,
    /(?:validate|test|prove)\s+([^.\n\r]+)/i,
  ];

  for (const pattern of objectivePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const { user_prompt, session_id } = await request.json();

    const backendResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/generate_strategy?stream=true&user_prompt=${encodeURIComponent(
        user_prompt
      )}&session_id=${session_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );
    // console.log("Response from /api/marketing-strategy:", backendResponse);
    if (!backendResponse.ok || !backendResponse.body) {
      const errorText = await backendResponse.text();
      throw new Error(
        `Backend error: ${backendResponse.status} - ${errorText}`
      );
    }

    // Stream data chunk-by-chunk from backend to frontend
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendResponse.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: "Streaming failed" }))
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // console.error("Streaming error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
