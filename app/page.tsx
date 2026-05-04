"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BottomNav, { type Tab } from "@/components/bottom-nav";
import BrandBar from "@/components/brand-bar";

const PrayerSchedule = dynamic(() => import("@/components/prayer"),     { ssr: false });
const CekHalal       = dynamic(() => import("@/components/cek-halal"),  { ssr: false });
const BeaImpor       = dynamic(() => import("@/components/bea-impor"),  { ssr: false });
const TripPlan       = dynamic(() => import("@/components/trip-plan"),  { ssr: false });
const FindPlace      = dynamic(() => import("@/components/find-place"), { ssr: false });

const TITLES: Record<Tab, string> = {
  "sholat":     "Sholat — Jadwal & Kiblat",
  "bea-impor":  "Bea Impor — Kalkulator IMEI",
  "cek-halal":  "Intel Halal — AI Scanner",
  "trip-plan":  "Trip Plan — Rute Jepang",
  "find-place": "Find Place — Direktori Jepang",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("sholat");

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
