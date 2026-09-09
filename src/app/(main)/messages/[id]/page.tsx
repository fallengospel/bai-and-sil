"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice, timeAgo } from "@/lib/helpers";
import { FiArrowLeft, FiDollarSign } from "react-icons/fi";

interface Message {
  id: string;
  message: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface Offer {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
}

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
}

const quickPrompts = [
  "Is this still available?",
  "Can you lower the price?",
  "Where can we meet?",
  "Any issues with the item?",
];

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [offerModal, setOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = useCallback(async () => {
    try {
      const [convRes, msgRes, offerRes] = await Promise.all([
        fetch(`/api/conversations/${id}`, { credentials: "include" }),
        fetch(`/api/conversations/${id}/messages`),
        fetch(`/api/conversations/${id}/offers`),
      ]);

      if (!convRes.ok || !msgRes.ok) {
        router.push("/messages");
        return;
      }

      const convData = await convRes.json();
      const conv = convData.conversation;
      if (!conv) {
        router.push("/messages");
        return;
      }

      setConversation(conv);
      setMessages((await msgRes.json()).messages || []);

      if (offerRes.ok) {
        setOffers((await offerRes.json()).offers || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: "Accepted" | "Declined") => {
    try {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return;
      const res = await fetch(`/api/listings/${conversation?.listing.id}/offers/${offerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: action } : o))
        );
        toast.success(`Offer ${action.toLowerCase()}!`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update offer");
      }
    } catch {
      toast.error("Failed to update offer");
    }
  };

  const handleSendOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: offerAmount }),
      });
      if (res.ok) {
        const data = await res.json();
        setOffers((prev) => [data.offer, ...prev]);
        setOfferModal(false);
        setOfferAmount("");
        toast.success("Offer sent!");
      }
    } catch {
      toast.error("Failed to send offer");
    }
  };

  if (loading) return <LoadingSpinner text="Loading conversation..." className="py-16" />;
  if (!conversation) return null;

  const isBuyer = conversation.buyer.id === userId;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <button onClick={() => router.push("/messages")} className="p-1 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={otherUser.avatar} name={otherUser.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{otherUser.name}</p>
          <Link
            href={`/listing/${conversation.listing.slug}`}
            className="text-xs text-[#1a56db] hover:underline truncate block"
          >
            {conversation.listing.title} · {formatPrice(conversation.listing.price)}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender.id === userId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isOwn ? "order-2" : ""}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? "bg-[#1a56db] text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  {msg.message}
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? "text-right" : ""}`}>
                  {timeAgo(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Inline offers */}
        {offers.map((offer) => {
          const isSellerViewing = !isBuyer && offer.seller.id === userId;
          return (
            <div key={offer.id} className="flex justify-center">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center max-w-xs">
                <FiDollarSign className="w-5 h-5 text-[#f5a623] mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(offer.amount)} offer
                </p>
                <Badge
                  variant={
                    offer.status === "Accepted"
                      ? "green"
                      : offer.status === "Declined"
                      ? "red"
                      : "yellow"
                  }
                  size="sm"
                >
                  {offer.status}
                </Badge>
                {offer.status === "Pending" && isSellerViewing && (
                  <div className="flex gap-2 mt-2 justify-center">
                    <button
                      onClick={() => handleOfferAction(offer.id, "Accepted")}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleOfferAction(offer.id, "Declined")}
                      className="px-3 py-1 text-xs font-medium text-white bg-[#e8634a] rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(offer.createdAt)}</p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {isBuyer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOfferModal(true)}
            leftIcon={<FiDollarSign className="w-4 h-4" />}
          >
            Offer
          </Button>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(newMessage);
            }
          }}
          placeholder="Ask the seller something..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
          disabled={sending}
        />
        <Button
          onClick={() => sendMessage(newMessage)}
          loading={sending}
          disabled={!newMessage.trim()}
          size="md"
        >
          Send
        </Button>
      </div>

      {/* Offer Modal */}
      <Modal
        open={offerModal}
        onClose={() => setOfferModal(false)}
        title="Make an Offer"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setOfferModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} fullWidth>
              Send Offer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-4">
          Listed price: <strong>{formatPrice(conversation.listing.price)}</strong>
        </p>
        <Input
          label="Your offer (₱)"
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="0"
          min="1"
        />
      </Modal>
    </div>
  );
}
