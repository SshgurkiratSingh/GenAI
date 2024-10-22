import { Button, Chip } from "@nextui-org/react";

interface ChatInputProps {
  input: string;
  suggestedQueries: string[];
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onSuggestedQueryClick: (query: string) => void;
}

const ChatInput = ({
  input,
  suggestedQueries,
  onInputChange,
  onKeyDown,
  onSend,
  onSuggestedQueryClick,
}: ChatInputProps) => {
  return (
    <div className="w-full flex flex-col">
      <textarea
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        rows={1}
        className="w-full p-2 border rounded resize-none max-h-40 overflow-hidden"
        style={{ height: "auto" }}
        maxLength={500}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-500 text-sm">
          Press Enter to send, Shift+Enter for a new line.
        </span>
        <Button color="primary" onClick={onSend} disabled={!input.trim()}>
          Send
        </Button>
      </div>
      {suggestedQueries.length > 0 && (
        <div className="mt-2 flex flex-wrap">
          {suggestedQueries.map((query, idx) => (
            <Chip
              key={idx}
              onClick={() => onSuggestedQueryClick(query)}
              className="mr-2 mb-2"
            >
              {query}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
};
export default ChatInput;
