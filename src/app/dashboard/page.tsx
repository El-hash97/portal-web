'use client';

import { PageHero } from '@/components/PageHero';
import { DashboardAppSection } from '@/components/DashboardAppSection';
import { HenkatenKpiBar } from '@/components/HenkatenKpiBar';
import { HenkatenByLineChart } from '@/components/HenkatenByLineChart';
import { ProblemProduksiKpiBar } from '@/components/ProblemProduksiKpiBar';
import { ProblemProduksiChart } from '@/components/ProblemProduksiChart';
import { KaizenKpiBar } from '@/components/KaizenKpiBar';
import { KaizenStatusChart } from '@/components/KaizenStatusChart';
import { VoiceMemberPodium } from '@/components/VoiceMemberPodium';
import { VoiceMemberTable } from '@/components/VoiceMemberTable';

export default function DashboardPage() {
  return (
    <>
      <PageHero titleAccent="Dashboard" description="Ringkasan data live dari tiap aplikasi." />
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 pb-8 sm:pb-10">
      <DashboardAppSection
        name="Henkaten"
        blurb="Data diambil langsung dari aplikasi e-Henkaten — Change Point Management."
      >
        <HenkatenKpiBar />
        <HenkatenByLineChart />
      </DashboardAppSection>

      <DashboardAppSection
        name="Problem Produksi"
        blurb="Data diambil langsung dari aplikasi Problem Produksi — monitoring problem yang menghambat produksi."
      >
        <ProblemProduksiKpiBar />
        <ProblemProduksiChart />
      </DashboardAppSection>

      <DashboardAppSection
        name="Kaizen Order Sheet"
        blurb="Data diambil langsung dari aplikasi Kaizen Order Sheet — pencatatan kaizen dan status penyelesaiannya."
      >
        <KaizenKpiBar />
        <KaizenStatusChart />
      </DashboardAppSection>

      <DashboardAppSection
        name="Voice Member"
        blurb="Data diambil langsung dari aplikasi Voice Member — peringkat pengirim aspirasi terbanyak."
      >
        <VoiceMemberPodium />
        <VoiceMemberTable />
      </DashboardAppSection>
      </main>
    </>
  );
}
