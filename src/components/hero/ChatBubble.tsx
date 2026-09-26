export default function ChatBubble({
  sender,
  message,
  delay = 0,
  className = "",
}: {
  sender: "buyer" | "seller";
  message: string;
  delay?: number;
  className?: string;
}) {
  const isBuyer = sender === "buyer";

  return (
    <div
      className={`flex ${isBuyer ? "justify-end" : "justify-start"} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`max-w-[200px] px-3.5 py-2.5 text-sm leading-snug rounded-2xl ${
          isBuyer
            ? "bg-bai-blue text-white rounded-br-md"
            : "bg-white text-ink rounded-bl-md shadow-sm border border-gray-100"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
