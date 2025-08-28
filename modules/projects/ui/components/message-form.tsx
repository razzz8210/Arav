import { z } from "zod";
import { toast } from "sonner"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

interface Props {
  projectId: string;
  onFirstMessage: () => void;
  hasFirstMessage: boolean;
  isEnabled: boolean;
}

const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Prompt is required" })
    .max(10000, { message: "Prompt is too long, maximum 10000 characters allowed" }),
})

const imageIcons = [
  { lightImage: "/icons/attachment.png", darkImg: "/icons/dark-attachment.png" },
  { lightImage: "/icons/ai.png", darkImg: "/icons/dark-ai.png" },
  { lightImage: "/icons/mic.png", darkImg: "/icons/dark-mic.png" },
  { lightImage: "/icons/info.png", darkImg: "/icons/dark-info.png" },
]

export const MessageForm = ({ projectId, onFirstMessage, hasFirstMessage, isEnabled }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  })

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      form.reset();
      // Call onFirstMessage if this is the first message and not enabled by default
      if (!isEnabled && !hasFirstMessage) {
        onFirstMessage();
      }
      queryClient.invalidateQueries(
        trpc.messages.getMany.queryOptions({ projectId })
      );
      // todo: Invalidate usage status
    },
    onError: (error) => {
      // todo: redirect to pricing page if specific error 
      toast.error(error.message);
    }
  }))

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: values.value,
      projectId,
    })
  }

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;
  const showUsage = false;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl min-h-[18vh] bg-[#DCDCDC] transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none",
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              placeholder="What would you like to build?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          {/* <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              Ctrl + Enter
            </kbd>
            &nbsp; to submit
          </div> */}
          <div className="flex mt-4 gap-[4px] justify-center items-center">
            {/* {imageIcons.map((imageUrl, index) => (
              <div
                className="w-[40px] cursor-pointer h-[32px] rounded-[12px] dark:bg-[#272727] bg-white opacity-100 px-[12px] py-[6px] flex items-center justify-center"
              >
                <Image
                  src={theme === "dark" ? imageUrl.darkImg : imageUrl.lightImage}
                  width={16}
                  height={16}
                  alt="icon"
                />
              </div>

            ))} */}
          </div>

          <Button
            disabled={isButtonDisabled}
            className={cn(
              "w-[30px] h-[30px] cursor-pointer rounded-[6px] border border-[#FFFFFF1A]",
              !isButtonDisabled && "bg-gradient-to-r from-[#A855F7] to-[#2563EB]",
              isButtonDisabled && "bg-muted-foreground"
            )}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon style={{ color: "white" }} />
            )}

          </Button>
        </div>
      </form>
    </Form>
  )
}