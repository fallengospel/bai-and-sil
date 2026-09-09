"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FiBell, FiBellOff } from "react-icons/fi";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      // ignore
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setLoading(false);
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY || "";
      if (!vapidPublicKey) {
        toast.error("Push notifications are not configured");
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
    } catch (err) {
      toast.error("Failed to enable push notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      toast.success("Push notifications disabled");
    } catch {
      toast.error("Failed to disable push notifications");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
        Push notifications are not supported in this browser
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSubscribed ? "bg-green-100" : "bg-gray-100"
          }`}>
            {isSubscribed ? (
              <FiBell className="w-5 h-5 text-green-600" />
            ) : (
              <FiBellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isSubscribed ? "Notifications Enabled" : "Push Notifications"}
            </p>
            <p className="text-xs text-gray-500">
              {isSubscribed
                ? "You will receive push notifications for new messages and offers"
                : "Get notified about messages, offers, and updates"}
            </p>
          </div>
        </div>
        <Button
          variant={isSubscribed ? "ghost" : "primary"}
          size="sm"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          loading={loading}
          leftIcon={isSubscribed ? <FiBellOff className="w-4 h-4" /> : <FiBell className="w-4 h-4" />}
        >
          {isSubscribed ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
