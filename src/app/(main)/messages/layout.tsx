import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | BAI AND SIL",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
