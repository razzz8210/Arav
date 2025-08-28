import { FileExplorer } from "@/components/file-explorer";
import { CodeGenerationAnimation } from "@/components/ui/code-generation-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment } from "@/generated/prisma";
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web";
import type { SandboxState } from "@/modules/projects/ui/views/project-view";
import { AppWindow, Code, Code2, EyeIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductBuilderProps {
  activeFragment: Fragment | null;
  sandboxState: SandboxState;
  setSandboxState: (state: SandboxState) => void;
  projectStarted: boolean;
}

export const ProductBuilder: React.FC<ProductBuilderProps> = ({
  activeFragment,
  sandboxState,
  setSandboxState,
  projectStarted,
}) => {
  const [tabState, setTabstate] = useState<"preview" | "code">("preview");

  const handleDevelopment = () => {
    toast.success("This section is under development!");
  };

  return (
    <Tabs
      className="h-full gap-y-0"
      defaultValue="preview"
      value={tabState}
      onValueChange={(value) => setTabstate(value as "preview" | "code")}
    >
      <div className="flex justify-between items-center bg-[#EBEBEB] m-2 rounded-md border border-[#272727]">
        <div className="w-full flex items-center p-2 border-b">
          <TabsList className="w-[196px] h-[40px] bg-[#DCDCDC] border border-[#FFFFFF14] rounded-full p-1 flex items-center">
            <TabsTrigger
              value="code"
              className="px-3 py-1.5 rounded-full cursor-pointer flex items-center justify-center gap-[6px] text-sm text-white transition-colors
               data-[state=active]:bg-[#9C7DFF1A] data-[state=active]:text-[#9C7DFF]"
            >
              <Code2 className="w-4 h-4" />
              <span>Code</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="px-3 py-1.5 rounded-full cursor-pointer flex items-center justify-center gap-[6px] text-sm text-white transition-colors
               data-[state=active]:bg-[#9C7DFF1A] data-[state=active]:text-[#9C7DFF]"
            >
              <AppWindow className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>
        </div>
        {/* <div className="flex gap-2 items-center">
          <button
            className="w-[110px] h-[40px] cursor-pointer rounded-md px-4 py-2 border border-[#2D2D2D]"
            onClick={handleDevelopment}
          >
            Save Draft
          </button>
          <button
            className="w-[88px] h-[40px] cursor-pointer bg-[#9C7DFF] mr-2 text-white rounded-md px-4 py-2"
            onClick={handleDevelopment}
          >
            Publish
          </button>
        </div> */}
      </div>
      <div className="flex flex-1 min-h-0 m-2 rounded-md border border-[#272727]">
        <TabsContent value="preview">
          {!projectStarted ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">
                  Welcome to your project!
                </p>
                <p className="text-sm">
                  Start building by entering your first prompt.
                </p>
              </div>
            </div>
          ) : (
            <>
              {!!activeFragment ? (
                <FragmentWeb
                  data={activeFragment}
                  sandboxState={sandboxState}
                  setSandboxState={setSandboxState}
                />
              ) : (
                <CodeGenerationAnimation />
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="code" className="min-h-0">
          {!!activeFragment?.files ? (
            <FileExplorer
              files={activeFragment.files as { [path: string]: string }}
            />
          ) : (
            <CodeGenerationAnimation />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};
