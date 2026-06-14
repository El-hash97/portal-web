export interface App {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  link: string;
  icon: string;
  aktif: boolean;
}

export interface Category {
  key: string;
  color: string;
  bg: string;
}

export type IconKey = 'activity' | 'calculator' | 'thermometer' | 'clipboard' | 'pencil' | 'chart' | 'box';
