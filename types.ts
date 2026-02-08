
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  profession: string;
  category: string;
  phone: string;
  imageUrl?: string;
  createdAt: number;
}

export type ExportType = 'PDF' | 'EXCEL' | 'WORD';

export enum AppRoute {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD'
}
