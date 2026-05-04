"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BottomNav, { type Tab } from "@/components/bottom-nav";
import BrandBar from "@/components/brand-bar";
import { t, useLocale } from "@/lib/i18n";

const PrayerSchedule = dynamic(() => import("@/components/prayer"),     { ssr: false });
const CekHalal       = dynamic(() => import("@/components/cek-halal"),  { ssr: false });
const BeaImpor       = dynamic(() => import("@/components/bea-impor"),  { ssr: false });
const TripPlan       = dynamic(() => import("@/components/trip-plan"),  { ssr: false });
const FindPlace      = dynamic(() => import("@/components/find-place"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("cek-halal");
  const [locale] = useLocale();   // re-renders when language switches

  const TAB_NAV_KEY: Record<Tab, string> = {
    "sholat":     "nav.sholat",
    "bea-impor":  "nav.beaImpor",
    "cek-halal":  "nav.cekHalal",
    "trip-plan":  "nav.tripPlan",
    "find-place": "nav.findPlace",
  };

  useEffect(() => {
    document.title = `${t("brand.name")} — ${t(TAB_NAV_KEY[activeTab])}`;
  }, [activeTab, locale]);

  return (
    // key=locale forces full re-mount of all screens when language changes
    // so module-level t() calls inside components get fresh values
    <div key={locale}>
      <BrandBar />
      <div className={activeTab === "sholat"     ? "block" : "hidden"}><PrayerSchedule /></div>
      <div className={activeTab === "bea-impor"  ? "block" : "hidden"}><BeaImpor /></div>
      <div className={activeTab === "cek-halal"  ? "block" : "hidden"}><CekHalal isActive={activeTab === "cek-halal"} /></div>
      <div className={activeTab === "trip-plan"  ? "block" : "hidden"}><TripPlan /></div>
      <div className={activeTab === "find-place" ? "block" : "hidden"}><FindPlace /></div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
