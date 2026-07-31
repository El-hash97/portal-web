export interface App {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  link: string;
  icon: string;
  logo?: string;
  aktif: boolean;
  maintenance?: boolean;
}

export interface Category {
  key: string;
  color: string;
  bg: string;
}

export type IconKey = 'activity' | 'calculator' | 'thermometer' | 'clipboard' | 'pencil' | 'chart' | 'box';

export type RequestStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dikerjakan' | 'selesai';

export interface FeatureRequest {
  id: number;
  requester: string;
  line_name: string;
  app_id: number | null;
  app_nama: string | null;
  request_text: string;
  status: RequestStatus;
  approver: string | null;
  reject_reason: string | null;
  created_at: string;
  decided_at: string | null;
  finished_at: string | null;
}
