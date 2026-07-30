'use client';

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
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Dashboard
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Ringkasan data live dari tiap aplikasi.
        </p>
      </div>

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
  );
}
