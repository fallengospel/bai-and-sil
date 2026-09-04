"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { timeAgo } from "@/lib/helpers";
import { FiMessageSquare } from "react-icons/fi";

interface Conversation {
  id: string;
  buyer: { id: string; name: string; avatar: string | null };
  seller: { id: string; name: string; avatar: string | null };
  listing: {
    id: string;
    title: string;
    price: number;
    slug: string;
    images: { imageUrl: string }[];
  };
  lastMessage: { message: string; createdAt: string } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setConversations(data.conversations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingSpinner text="Loading conversations..." className="py-16" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<FiMessageSquare className="w-12 h-12" />}
          title="No conversations yet"
          description="Say hi to a seller."
          action={{ label: "Browse Listings", href: "/search" }}
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const otherUser =
              conv.buyer.id === conversations[0]?.buyer.id ? conv.seller : conv.buyer;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all"
              >
                <Avatar
                  src={otherUser.avatar}
                  name={otherUser.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {otherUser.name}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.listing.title}</p>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-0.5">
                      {conv.lastMessage.message}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-[#e8634a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
