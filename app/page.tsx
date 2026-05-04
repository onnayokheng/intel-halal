"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BottomNav, { type Tab } from "@/components/bottom-nav";
import BrandBar from "@/components/brand-bar";
import Onboarding from "@/components/onboarding";
import Paywall from "@/components/paywall";
import { t, useLocale } from "@/lib/i18n";
import { useSession } from "@/lib/auth-client";

const PrayerSchedule = dynamic(() => import("@/components/prayer"),     { ssr: false });
const CekHalal       = dynamic(() => import("@/components/cek-halal"),  { ssr: false });
const BeaImpor       = dynamic(() => import("@/components/bea-impor"),  { ssr: false });
const TripPlan       = dynamic(() => import("@/components/trip-plan"),  { ssr: false });
const FindPlace      = dynamic(() => import("@/components/find-place"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("cek-halal");
  const [locale] = useLocale();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const { data: session, isPending: sessionLoading } = useSession();

  const TAB_NAV_KEY: Record<Tab, string> = {
    "sholat":     "nav.sholat",
    "bea-impor":  "nav.beaImpor",
    "cek-halal":  "nav.cekHalal",
    "trip-plan":  "nav.tripPlan",
    "find-place": "nav.findPlace",
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true") { setShowOnboarding(false); return; }
    if (session) { setShowOnboarding(false); return; }
    if (!sessionLoading) {
      setShowOnboarding(localStorage.getItem("onboarding_done") !== "1");
    }
  }, [session, sessionLoading]);

  useEffect(() => {
    document.title = `${t("brand.name")} — ${t(TAB_NAV_KEY[activeTab])}`;
  }, [activeTab, locale]);

  const devSkip = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";
  if (!devSkip && (showOnboarding === null || sessionLoading)) return null;

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <div key={locale}>
      <BrandBar onUpgrade={() => setShowPaywall(true)} />
      <div className={activeTab === "sholat"     ? "block" : "hidden"}><PrayerSchedule /></div>
      <div className={activeTab === "bea-impor"  ? "block" : "hidden"}><BeaImpor /></div>
      <div className={activeTab === "cek-halal"  ? "block" : "hidden"}>
        <CekHalal isActive={activeTab === "cek-halal"} onShowPaywall={() => setShowPaywall(true)} />
      </div>
      <div className={activeTab === "trip-plan"  ? "block" : "hidden"}><TripPlan onShowPaywall={() => setShowPaywall(true)} /></div>
      <div className={activeTab === "find-place" ? "block" : "hidden"}><FindPlace /></div>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
    </div>
  );
}
