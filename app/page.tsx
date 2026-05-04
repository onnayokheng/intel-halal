"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BottomNav, { type Tab } from "@/components/bottom-nav";
import BrandBar from "@/components/brand-bar";
import { t } from "@/lib/i18n";

const PrayerSchedule = dynamic(() => import("@/components/prayer"),     { ssr: false });
const CekHalal       = dynamic(() => import("@/components/cek-halal"),  { ssr: false });
const BeaImpor       = dynamic(() => import("@/components/bea-impor"),  { ssr: false });
const TripPlan       = dynamic(() => import("@/components/trip-plan"),  { ssr: false });
const FindPlace      = dynamic(() => import("@/components/find-place"), { ssr: false });

const TITLES: Record<Tab, string> = {
  "sholat":     `${t("nav.sholat")} — ${t("sholat.title")}`,
  "bea-impor":  `${t("nav.beaImpor")} — ${t("beaImpor.title")}`,
  "cek-halal":  `${t("brand.name")} — AI Scanner`,
  "trip-plan":  `${t("nav.tripPlan")} — ${t("tripPlan.title")}`,
  "find-place": `${t("nav.findPlace")} — ${t("findPlace.title")}`,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("cek-halal");

  useEffect(() => {
    document.title = TITLES[activeTab];
  }, [activeTab]);

  return (
    <>
      <BrandBar />
      <div className={activeTab === "sholat"     ? "block" : "hidden"}><PrayerSchedule /></div>
      <div className={activeTab === "bea-impor"  ? "block" : "hidden"}><BeaImpor /></div>
      <div className={activeTab === "cek-halal"  ? "block" : "hidden"}><CekHalal isActive={activeTab === "cek-halal"} /></div>
      <div className={activeTab === "trip-plan"  ? "block" : "hidden"}><TripPlan /></div>
      <div className={activeTab === "find-place" ? "block" : "hidden"}><FindPlace /></div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}
