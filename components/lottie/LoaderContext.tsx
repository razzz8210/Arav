"use client";
import { createContext, useState, useContext } from "react";
import DynamicLoader from "@/components/lottie/DynamicLoader";

type LoaderContextType = {
  showLoader: boolean;
  loaderMessage: string;
  setShowLoader: (val: boolean) => void;
  setLoaderMessage: (msg: string) => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useLoader must be used within LoaderProvider");
  return context;
};

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Loading...");

  return (
    <LoaderContext.Provider
      value={{ showLoader, setShowLoader, loaderMessage, setLoaderMessage }}
    >
      {children}
      {showLoader && <DynamicLoader />}
    </LoaderContext.Provider>
  );
};
