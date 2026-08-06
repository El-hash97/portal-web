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
import { RealtimeOffPlaceholder } from '@/components/RealtimeOffPlaceholder';
import { useRealtimeStore } from '@/context/RealtimeContext';

export default function DashboardPage() {
  const { enabled, loading } = useRealtimeStore();

  if (loading) {
    return (
      <>
        <PageHero titleAccent="Dashboard" description="Ringkasan data live dari tiap aplikasi." />
        <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 pb-8 sm:pb-10">
          <div className="flex flex-col gap-3 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
                style={{ background: 'rgba(217,226,255,0.06)' }}
              />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHero titleAccent="Dashboard" description="Ringkasan data live dari tiap aplikasi." />
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 pb-8 sm:pb-10">
        <DashboardAppSection
          name="Henkaten"
          blurb="Data diambil langsung dari aplikasi e-Henkaten — Change Point Management."
        >
          {enabled ? (
            <>
              <HenkatenKpiBar />
              <HenkatenByLineChart />
            </>
          ) : (
            <RealtimeOffPlaceholder />
          )}
        </DashboardAppSection>

        <DashboardAppSection
          name="Problem Produksi"
          blurb="Data diambil langsung dari aplikasi Problem Produksi — monitoring problem yang menghambat produksi."
        >
          {enabled ? (
            <>
              <ProblemProduksiKpiBar />
              <ProblemProduksiChart />
            </>
          ) : (
            <RealtimeOffPlaceholder />
          )}
        </DashboardAppSection>

        <DashboardAppSection
          name="Kaizen Order Sheet"
          blurb="Data diambil langsung dari aplikasi Kaizen Order Sheet — pencatatan kaizen dan status penyelesaiannya."
        >
          {enabled ? (
            <>
              <KaizenKpiBar />
              <KaizenStatusChart />
            </>
          ) : (
            <RealtimeOffPlaceholder />
          )}
        </DashboardAppSection>

        <DashboardAppSection
          name="Voice Member"
          blurb="Data diambil langsung dari aplikasi Voice Member — peringkat pengirim aspirasi terbanyak."
        >
          {enabled ? (
            <>
              <VoiceMemberPodium />
              <VoiceMemberTable />
            </>
          ) : (
            <RealtimeOffPlaceholder />
          )}
        </DashboardAppSection>
      </main>
    </>
  );
}
