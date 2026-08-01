import { PageHero } from '@/components/PageHero';

export function OpenRequestHero() {
  return (
    <PageHero
      titlePrefix="Open "
      titleAccent="Request"
      slogan="Fitur Kurang? Tinggal Minta."
      description={
        <>
          Setiap masukan dari line bisa jadi fitur berikutnya. <br className="hidden sm:block" />
          Ajukan, disetujui Section, dikerjakan developer.
        </>
      }
    />
  );
}
