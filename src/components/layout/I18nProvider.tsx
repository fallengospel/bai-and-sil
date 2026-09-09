"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Language = "en" | "fil";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.categories": "Categories",
    "nav.sell": "Sell",
    "nav.messages": "Messages",
    "nav.profile": "My Profile",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.search": "Search for items...",
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Notifications",
    "nav.export": "Export",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.noResults": "No results found",
    "common.price": "Price",
    "common.category": "Category",
    "common.location": "Location",
    "common.condition": "Condition",
    "common.apply": "Apply",
    "common.search": "Search",
    "home.hero": "Find stuff. Sell stuff. Repeat.",
    "home.browse": "Browse Listings",
    "home.sellNow": "Sell Now",
    "seller.dashboard": "Seller Dashboard",
    "seller.listings": "Total Listings",
    "seller.active": "Active",
    "seller.sold": "Sold",
    "seller.views": "Total Views",
    "seller.analytics": "Analytics",
    "seller.performance": "Listing Performance",
    "seller.recent": "Your Recent Listings",
    "seller.viewAll": "View all",
    "seller.emptyListings": "No listings yet.",
    "seller.createFirst": "Create your first listing",
    "notifications.title": "Notifications",
    "notifications.unread": "unread",
    "notifications.markAllRead": "Mark all read",
    "notifications.allCaughtUp": "All caught up!",
    "notifications.noNotifications": "No notifications yet. Go find some deals.",
    "notifications.subscribe": "Enable Push Notifications",
    "notifications.subscribed": "Notifications Enabled",
    "notifications.denied": "Notifications Blocked",
    "notifications.unsupported": "Push notifications are not supported in this browser",
    "search.filters": "Filters",
    "search.searchItems": "Search items...",
    "search.allCategories": "All Categories",
    "search.allLocations": "All Locations",
    "search.allConditions": "All Conditions",
    "search.priceRange": "Price Range",
    "search.sortBy": "Sort by",
    "search.applyFilters": "Apply Filters",
    "search.resultsFor": "Results for",
    "search.allListings": "All Listings",
    "search.loadMore": "Load more",
    "search.noResults": "Nothing here yet.",
    "search.adjustFilters": "Try adjusting your filters or search for something else.",
    "profile.edit": "Edit Profile",
    "profile.name": "Name",
    "profile.bio": "Bio",
    "profile.phone": "Phone",
    "profile.location": "Location",
    "profile.avatar": "Avatar URL",
    "profile.saveChanges": "Save Changes",
    "profile.updated": "Profile updated!",
    "profile.memberSince": "Member since",
    "profile.listings": "listings",
    "profile.sold": "sold",
    "profile.message": "Message",
    "profile.report": "Report",
    "profile.listingsTab": "Listings",
    "profile.soldTab": "Sold",
    "related.title": "Related Items",
    "related.similarFrom": "Similar items from",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.of": "of",
    "common.views": "views",
    "common.clicks": "clicks",
    "common.conversion": "conversion",
    "common.downloads": "downloads",
  },
  fil: {
    "nav.home": "Tahanan",
    "nav.categories": "Mga Kategorya",
    "nav.sell": "Ibenta",
    "nav.messages": "Mga Mensahe",
    "nav.profile": "Ang Aking Profile",
    "nav.login": "Mag-login",
    "nav.register": "Mag-register",
    "nav.logout": "Mag-logout",
    "nav.search": "Maghanap ng mga gamit...",
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Mga Abiso",
    "nav.export": "I-download",
    "common.save": "I-save",
    "common.cancel": "Kanselahin",
    "common.delete": "Tanggalin",
    "common.edit": "I-edit",
    "common.loading": "Naglo-load...",
    "common.noResults": "Walang nahanap",
    "common.price": "Presyo",
    "common.category": "Kategorya",
    "common.location": "Lugar",
    "common.condition": "Kondisyon",
    "common.apply": "I-apply",
    "common.search": "Hanapin",
    "home.hero": "Maghanap. Magbenta. Ulitin.",
    "home.browse": "Tingnan ang mga Listing",
    "home.sellNow": "Magbenta Na",
    "seller.dashboard": "Seller Dashboard",
    "seller.listings": "Kabuuang Listing",
    "seller.active": "Aktibo",
    "seller.sold": "Nabenta",
    "seller.views": "Kabuuang Views",
    "seller.analytics": "Analytics",
    "seller.performance": "Performance ng Listing",
    "seller.recent": "Kamakailang mga Listing",
    "seller.viewAll": "Tingnan lahat",
    "seller.emptyListings": "Wala pang listing.",
    "seller.createFirst": "Gawa ka ng iyong unang listing",
    "notifications.title": "Mga Abiso",
    "notifications.unread": "hindi pa nababasa",
    "notifications.markAllRead": "Markahan lahat bilang nabasa",
    "notifications.allCaughtUp": "Wala nang bago!",
    "notifications.noNotifications": "Wala pang abiso. Maghanap ka ng mga deals.",
    "notifications.subscribe": "I-enable ang Push Notifications",
    "notifications.subscribed": "Naka-enable na ang Notifications",
    "notifications.denied": "Blocked ang Notifications",
    "notifications.unsupported": "Hindi sinusuportahan ang push notifications sa browser na ito",
    "search.filters": "Mga Filter",
    "search.searchItems": "Hanapin ang mga gamit...",
    "search.allCategories": "Lahat ng Kategorya",
    "search.allLocations": "Lahat ng Lugar",
    "search.allConditions": "Lahat ng Kondisyon",
    "search.priceRange": "Saklaw ng Presyo",
    "search.sortBy": "Ayusin ayon sa",
    "search.applyFilters": "I-apply ang Mga Filter",
    "search.resultsFor": "Mga resulta para sa",
    "search.allListings": "Lahat ng Listing",
    "search.loadMore": "Mag-load pa",
    "search.noResults": "Wala pa rito.",
    "search.adjustFilters": "Subukang baguhin ang mga filter o maghanap ng iba.",
    "profile.edit": "I-edit ang Profile",
    "profile.name": "Pangalan",
    "profile.bio": "Bio",
    "profile.phone": "Telepono",
    "profile.location": "Lugar",
    "profile.avatar": "Avatar URL",
    "profile.saveChanges": "I-save ang mga Pagbabago",
    "profile.updated": "Na-update na ang profile!",
    "profile.memberSince": "Mula pa noong",
    "profile.listings": "mga listing",
    "profile.sold": "nabenta",
    "profile.message": "Mensahe",
    "profile.report": "I-report",
    "profile.listingsTab": "Mga Listing",
    "profile.soldTab": "Nabenta",
    "related.title": "Kaugnay na mga Item",
    "related.similarFrom": "Kaparehong mga item mula sa",
    "common.close": "Isara",
    "common.back": "Bumalik",
    "common.next": "Susunod",
    "common.previous": "Nakaraan",
    "common.of": "ng",
    "common.views": "mga views",
    "common.clicks": "mga clicks",
    "common.conversion": "conversion",
    "common.downloads": "mga downloads",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language | null;
    if (stored) setLanguageState(stored);
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ language: "en", setLanguage: () => {}, t: (key: string) => translations.en[key] || key }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
