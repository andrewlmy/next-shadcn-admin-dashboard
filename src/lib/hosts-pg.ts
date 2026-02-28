/**
 * PostgreSQL data layer for machine_info (hosts) and manage_service (services)
 * Shared pool for adsng database
 */

import { Pool } from 'pg';

export const pgPool =
  process.env.HOSTS_DB_URL
    ? new Pool({ connectionString: process.env.HOSTS_DB_URL })
    : new Pool({
        host: process.env.HOSTS_DB_HOST ?? '10.61.230.2',
        port: parseInt(process.env.HOSTS_DB_PORT ?? '5432', 10),
        user: process.env.HOSTS_DB_USER ?? 'ads_infras',
        password: process.env.HOSTS_DB_PASSWORD ?? 'Ads_0nline_Infras',
        database: process.env.HOSTS_DB_NAME ?? 'adsng',
        ssl: process.env.HOSTS_DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
      });

export interface HostRow {
  id: number;
  sn: string;
  ip: string;
  publicIp: string;
  cpuCore: number;
  memory: number;
  diskVolume: number;
  header: string;
  status: string;
  idc?: string;
  remarks?: string;
  tags?: string[];
  services?: string[];
}

function parseJson<T>(val: unknown): T | null {
  if (val == null) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }
  return val as T;
}

function parseStringArray(val: unknown): string[] | null {
  const arr = parseJson<string[]>(val);
  if (!Array.isArray(arr)) return null;
  return arr.filter((x): x is string => typeof x === 'string');
}

export async function getHosts(): Promise<HostRow[]> {
  const client = await pgPool.connect();
  try {
    const result = await client.query<{
      id: number;
      ip: string;
      sn: string | null;
      isp_ip: string | null;
      cpu_cores: number;
      memory_gb: number;
      storage_gb: unknown;
      services: unknown;
      idc: string | null;
      tags: unknown;
      remarks: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT id, ip, sn, isp_ip, cpu_cores, memory_gb, storage_gb, services, idc, tags, remarks, created_at, updated_at
       FROM machine_info
       ORDER BY id DESC`
    );

    return result.rows.map((r) => {
      const tags = parseStringArray(r.tags);
      const services = parseStringArray(r.services);
      const idc = r.idc ?? '';
      return {
        id: r.id,
        sn: r.sn ?? '',
        ip: r.ip,
        publicIp: r.isp_ip ?? '',
        cpuCore: r.cpu_cores ?? 0,
        memory: r.memory_gb ?? 0,
        diskVolume: Number(r.storage_gb) ?? 0,
        header: idc ? `${r.ip} (${idc})` : r.ip,
        status: 'Done',
        idc: idc || undefined,
        remarks: r.remarks ?? undefined,
        tags: tags ?? undefined,
        services: services ?? undefined,
      };
    });
  } finally {
    client.release();
  }
}

export async function getHostsCount(): Promise<number> {
  const client = await pgPool.connect();
  try {
    const result = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM machine_info');
    return parseInt(result.rows[0]?.count ?? '0', 10);
  } finally {
    client.release();
  }
}
