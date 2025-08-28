import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface MusicOption {
  file_name: string;
  url: string;
  gcp_path: string;
}

interface MusicContextType {
  musicOptions: MusicOption[];
  isMusicLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [musicOptions, setMusicOptions] = useState<MusicOption[]>([]);
  const [isMusicLoading, setIsMusicLoading] = useState(false);

  const fetchMusicOptions = useCallback(async () => {
    try {
      setIsMusicLoading(true);
      const response = await fetch("/api/bgm_list");
      const data = await response.json();
      setMusicOptions(data?.files || []);
    } catch {
      toast.error("Error fetching music options");
    } finally {
      setIsMusicLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMusicOptions();
  }, [fetchMusicOptions]);

  return (
    <MusicContext.Provider value={{ musicOptions, isMusicLoading }}>
      {children}
    </MusicContext.Provider>
  );
};
