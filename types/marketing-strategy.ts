export interface MarketingStrategyData {
  product_summary: string;
  ideal_customer_market_fit: string;
  value_proposition: string;
  marketing_strategy_validation_path: string;
  detailed_social_media_strategy: string;
}

export interface ProductAnalysis {
  overview: {
    product: string;
    stage: string;
    description: string;
  };
  targetUsers: string[];
  differentiators: string[];
}

export interface GrowthStrategy {
  overview: {
    objective: string;
    goToMarket: string;
  };
}

export interface MarketingStrategyProcessedData {
  // productAnalysis: ProductAnalysis;
  // growthStrategy: GrowthStrategy;
  marketingStrategyValidationPath: string;
  detailedSocialMediaStrategy: string;
  productSummary: string;
  idealCustomerMarketFit: string;
  valueProposition: string;
}

export interface MarketingStrategyResponse {
  success: boolean;
  data?: MarketingStrategyProcessedData;
  error?: string;
} 