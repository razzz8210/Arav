import "@/app/styles/project/marketing-strategy.scss";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useTRPC } from "@/trpc/client";
import type {
  GrowthStrategy,
  MarketingStrategyProcessedData,
  ProductAnalysis,
} from "@/types/marketing-strategy";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { PerplexityStyleLoader } from "@/components/ui/marketing-loader";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface MarketingStrategyProps {
  projectId: string;
}

export const MarketingStrategy: React.FC<MarketingStrategyProps> = ({
  projectId,
}) => {
  const { theme } = useTheme();
  const trpc = useTRPC();
  const [raw, setRaw] = useState<string>("");
  const [data, setData] = useState<MarketingStrategyProcessedData>({
    // productAnalysis: {
    //   overview: { product: "", stage: "", description: "" },
    //   targetUsers: [],
    //   differentiators: [],
    // },
    // growthStrategy: {
    //   overview: { objective: "", goToMarket: "" },
    // },
    marketingStrategyValidationPath: "",
    detailedSocialMediaStrategy: "",
    productSummary: "",
    idealCustomerMarketFit: "",
    valueProposition: "",
  });
  // const [data, setData] = useState<MarketingStrategyProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("market-fit");
  const marketFitRef = useAutoScroll<HTMLDivElement>(
    data?.idealCustomerMarketFit
  );
  const valueProRef = useAutoScroll<HTMLDivElement>(data?.valueProposition);
  const productSumRef = useAutoScroll<HTMLDivElement>(data?.productSummary);
  const mediaStrategyRef = useAutoScroll<HTMLDivElement>(
    data?.detailedSocialMediaStrategy
  );
  const validationRef = useAutoScroll<HTMLDivElement>(
    data?.marketingStrategyValidationPath
  );

  // 4. Fetch messages to get the initial prompt
  const { data: messages } = useQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  // 5. Extract initial prompt from messages
  const initialPrompt = messages?.find((msg) => msg.role === "USER")?.content;

  useEffect(() => {
    const fetchMarketingStrategy = async () => {
      if (!initialPrompt) {
        return;
      }

      // setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/marketing-strategy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_prompt: initialPrompt,
            session_id: projectId,
          }),
        });

        if (!res.ok || !res.body) {
          const errorText = await res.text();
          throw new Error(`API Error: ${res.status} - ${errorText}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        const partialChunk = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim().startsWith("data:")) continue;

            try {
              const jsonLine = line.replace(/^data:\s*/, "");
              const parsed = JSON.parse(jsonLine); // { section, content }

              setData((prev) => {
                const section = parsed.section;
                const content = parsed.content;

                // Handle string fields
                const stringFields = {
                  product_summary: "productSummary",
                  ideal_customer_market_fit: "idealCustomerMarketFit",
                  value_proposition: "valueProposition",
                  marketing_strategy_validation_path:
                    "marketingStrategyValidationPath",
                  detailed_social_media_strategy: "detailedSocialMediaStrategy",
                } as const;

                if (section in stringFields) {
                  const key =
                    stringFields[section as keyof typeof stringFields];
                  return { ...prev, [key]: prev[key] + content };
                }

                // Handle structured fields
                // if (section === "product_analysis") {
                //   const update: Partial<ProductAnalysis> = content;
                //   return {
                //     ...prev,
                //     productAnalysis: {
                //       ...prev.productAnalysis,
                //       ...update,
                //       overview: {
                //         ...prev.productAnalysis.overview,
                //         ...(update.overview || {}),
                //       },
                //       targetUsers:
                //         update.targetUsers || prev.productAnalysis.targetUsers,
                //       differentiators:
                //         update.differentiators ||
                //         prev.productAnalysis.differentiators,
                //     },
                //   };
                // }

                // if (section === "growth_strategy") {
                //   const update: Partial<GrowthStrategy> = content;
                //   return {
                //     ...prev,
                //     growthStrategy: {
                //       ...prev.growthStrategy,
                //       overview: {
                //         ...prev.growthStrategy.overview,
                //         ...(update.overview || {}),
                //       },
                //     },
                //   };
                // }

                return prev;
              });
            } catch (err) {
              console.warn("Failed to parse streamed line:", line);
            }
          }
        }

        // const response = await res.json();

        // if (response.success && response.data) {
        //   setData(response.data);
        // } else {
        //   throw new Error(response.error || "Unknown error");
        // }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        // setLoading(false);
      }
    };

    if (projectId && initialPrompt) {
      fetchMarketingStrategy();
    }
  }, [projectId, initialPrompt]);

  if (loading) {
    return (
      <div className="w-full justify-center  items-center">
        <PerplexityStyleLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketing-strategy light">
        <div className="marketing-strategy__container">
          <h1 className="marketing-strategy__page-title">Marketing Strategy</h1>
          <div className="marketing-strategy__body">
            <div className="marketing-strategy__error">
              <div className="marketing-strategy__error-text">
                Error: {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="marketing-strategy light">
        <div className="marketing-strategy__container">
          <h1 className="marketing-strategy__page-title">Marketing Strategy</h1>
          <div className="marketing-strategy__body">
            <div className="marketing-strategy__no-data">
              <div className="marketing-strategy__no-data-text">
                No marketing strategy data available
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-strategy light">
      <div className="marketing-strategy__container">
        <h1 className="marketing-strategy__page-title">Marketing Strategy</h1>

        <div className="marketing-strategy__body">
          <div className="marketing-strategy__sidebar">
            <nav className="marketing-strategy__menu">
              {/* <div
                className={`marketing-strategy__menu-item ${
                  activeSection === "overview"
                    ? "marketing-strategy__menu-item--active"
                    : ""
                } marketing-strategy__menu-item--expandable`}
                onClick={() => setActiveSection("overview")}
              >
                <div className="marketing-strategy__menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 17H7A5 5 0 0 1 7 7h2m0 10a5 5 0 0 0 5-5h2a5 5 0 0 0-5-5v10z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Product Analysis</span>
              </div> */}

              {/* {activeSection === "overview" && (
                <div className="marketing-strategy__submenu">
                  <div className="marketing-strategy__submenu-item marketing-strategy__submenu-item--active">
                    Overview
                  </div>
                  <div className="marketing-strategy__submenu-item">
                    Target Users
                  </div>
                  <div className="marketing-strategy__submenu-item">
                    Differentiators
                  </div>
                </div>
              )} */}
              {data?.valueProposition && (
                <div
                  className={`marketing-strategy__menu-item ${
                    activeSection === "value-prop"
                      ? "marketing-strategy__menu-item--active"
                      : ""
                  } marketing-strategy__menu-item--expandable`}
                  onClick={() => setActiveSection("value-prop")}
                >
                  <div className="marketing-strategy__menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>Value Proposition</span>
                </div>
              )}

              {/* <div
                className={`marketing-strategy__menu-item ${
                  activeSection === "growth"
                    ? "marketing-strategy__menu-item--active"
                    : ""
                } marketing-strategy__menu-item--expandable`}
                onClick={() => setActiveSection("growth")}
              >
                <div className="marketing-strategy__menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Growth Strategy</span>
              </div> */}
              {data?.marketingStrategyValidationPath && (
                <div
                  className={`marketing-strategy__menu-item ${
                    activeSection === "validation"
                      ? "marketing-strategy__menu-item--active"
                      : ""
                  } marketing-strategy__menu-item--expandable`}
                  onClick={() => setActiveSection("validation")}
                >
                  <div className="marketing-strategy__menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>Validation Path</span>
                </div>
              )}

              {data?.detailedSocialMediaStrategy && (
                <div
                  className={`marketing-strategy__menu-item ${
                    activeSection === "social"
                      ? "marketing-strategy__menu-item--active"
                      : ""
                  } marketing-strategy__menu-item--expandable`}
                  onClick={() => setActiveSection("social")}
                >
                  <div className="marketing-strategy__menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>Social Media Strategy</span>
                </div>
              )}

              {/* <div 
                className={`marketing-strategy__menu-item ${activeSection === 'summary' ? 'marketing-strategy__menu-item--active' : ''} marketing-strategy__menu-item--expandable`}
                onClick={() => setActiveSection('summary')}
              >
                <div className="marketing-strategy__menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Product Summary</span>
              </div> */}

              <div
                className={`marketing-strategy__menu-item ${
                  activeSection === "market-fit"
                    ? "marketing-strategy__menu-item--active"
                    : ""
                } marketing-strategy__menu-item--expandable`}
                onClick={() => setActiveSection("market-fit")}
              >
                <div className="marketing-strategy__menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="8.5"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 8v6M23 11h-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Market Fit Analysis</span>
              </div>
            </nav>
          </div>

          <div className="marketing-strategy__main no-scrollbar">
            <div className="marketing-strategy__content">
              {/* {activeSection === "overview" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Product Analysis
                  </h2>

                  <div className="marketing-strategy__overview">
                    <div className="marketing-strategy__overview-header">
                      <h3 className="marketing-strategy__subsection-title">
                        Overview
                      </h3>
                    </div>

                    <div className="marketing-strategy__overview-content">
                      <div className="marketing-strategy__info-grid">
                        <div className="marketing-strategy__info-item">
                          <span className="marketing-strategy__label">
                            Product:
                          </span>
                          <span className="marketing-strategy__value">
                            {data?.productAnalysis?.overview?.product}
                          </span>
                        </div>
                        <div className="marketing-strategy__info-item">
                          <span className="marketing-strategy__label">
                            Stage:
                          </span>
                          <span className="marketing-strategy__value">
                            {data?.productAnalysis?.overview?.stage}
                          </span>
                        </div>
                      </div>

                      <div className="marketing-strategy__highlight">
                        {data?.productAnalysis?.overview?.description}
                      </div>
                    </div>
                  </div>

                  <div className="marketing-strategy__target-users">
                    <div className="marketing-strategy__card-header">
                      <h3 className="marketing-strategy__subsection-title">
                        Target Users
                      </h3>
                    </div>

                    <div className="marketing-strategy__card-content">
                      <div className="marketing-strategy__user-list">
                        {data?.productAnalysis?.targetUsers?.map(
                          (user, index) => (
                            <div
                              key={index}
                              className="marketing-strategy__user-item"
                            >
                              <div className="marketing-strategy__check-icon">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <span>{user}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="marketing-strategy__differentiators">
                    <div className="marketing-strategy__card-header">
                      <h3 className="marketing-strategy__subsection-title">
                        Differentiators
                      </h3>
                    </div>

                    <div className="marketing-strategy__card-content">
                      <div className="marketing-strategy__diff-list">
                        {data?.productAnalysis?.differentiators.map(
                          (diff, index) => (
                            <div
                              key={index}
                              className="marketing-strategy__diff-item"
                            >
                              <div className="marketing-strategy__check-icon">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <span>{diff}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* {activeSection === "growth" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Growth Strategy
                  </h2>

                  <div className="marketing-strategy__growth-overview">
                    <div className="marketing-strategy__card-header">
                      <h3 className="marketing-strategy__subsection-title">
                        Overview
                      </h3>
                    </div>

                    <div className="marketing-strategy__card-content">
                      <div className="marketing-strategy__info-grid">
                        <div className="marketing-strategy__info-item">
                          <span className="marketing-strategy__label">
                            Objective:
                          </span>
                          <span className="marketing-strategy__value">
                            {data?.growthStrategy?.overview?.objective}
                          </span>
                        </div>
                        <div className="marketing-strategy__info-item">
                          <span className="marketing-strategy__label">
                            Go-To-Market:
                          </span>
                          <span className="marketing-strategy__value">
                            {data?.growthStrategy?.overview?.goToMarket}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {activeSection === "validation" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Marketing Strategy Validation Path
                  </h2>
                  <div
                    ref={validationRef}
                    className="marketing-strategy__markdown-content"
                  >
                    <MarkdownRenderer
                      content={data?.marketingStrategyValidationPath}
                    />
                  </div>
                </div>
              )}

              {activeSection === "social" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Detailed Social Media Strategy
                  </h2>
                  <div
                    ref={mediaStrategyRef}
                    className="marketing-strategy__markdown-content"
                  >
                    <MarkdownRenderer
                      content={data?.detailedSocialMediaStrategy}
                    />
                  </div>
                </div>
              )}

              {activeSection === "summary" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Product Summary
                  </h2>
                  <div
                    ref={productSumRef}
                    className="marketing-strategy__markdown-content"
                  >
                    <MarkdownRenderer content={data?.productSummary} />
                  </div>
                </div>
              )}

              {activeSection === "value-prop" && (
                <div className="marketing-strategy__section">
                  <h2 className="marketing-strategy__section-title">
                    Value Proposition
                  </h2>
                  <div
                    ref={valueProRef}
                    className="marketing-strategy__markdown-content"
                  >
                    <MarkdownRenderer content={data?.valueProposition} />
                  </div>
                </div>
              )}

              {activeSection === "market-fit" && (
                <div className="marketing-strategy__section ">
                  <h2 className="marketing-strategy__section-title">
                    Ideal Customer & Market Fit
                  </h2>
                  <div
                    ref={marketFitRef}
                    className="marketing-strategy__markdown-content "
                  >
                    <MarkdownRenderer content={data?.idealCustomerMarketFit} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
