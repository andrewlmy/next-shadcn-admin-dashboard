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
  updatedAt: Date | null;
  idc?: string;
  k8sCluster?: string;
  os?: string;
  kernel?: string;
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
      status: string | null;
      k8s_cluster: string | null;
      os: string | null;
      kernel: string | null;
      created_at: Date;
      updated_at: Date | null;
    }>(
      `SELECT id, ip, sn, isp_ip, cpu_cores, memory_gb, storage_gb, services, idc, tags, remarks, status, k8s_cluster, os, kernel, created_at, updated_at
       FROM machine_info
       WHERE deleted_at IS NULL
       ORDER BY id DESC`
    );

    return result.rows.map((r) => {
      const tags = parseStringArray(r.tags);
      const services = parseStringArray(r.services);
      const idc = r.idc ?? '';
      const raw = r.k8s_cluster?.trim();
      const k8sCluster = raw && raw.toUpperCase() !== "NULL" ? raw : undefined;
      return {
        id: r.id,
        sn: r.sn ?? '',
        ip: r.ip,
        publicIp: r.isp_ip ?? '',
        cpuCore: r.cpu_cores ?? 0,
        memory: r.memory_gb ?? 0,
        diskVolume: Number(r.storage_gb) ?? 0,
        header: r.ip,
        status: r.status ?? 'active',
        updatedAt: r.updated_at,
        idc: idc || undefined,
        k8sCluster,
        os: r.os ?? undefined,
        kernel: r.kernel ?? undefined,
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
    const result = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM machine_info WHERE deleted_at IS NULL'
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  } finally {
    client.release();
  }
}

/** Host is "bad" if updated_at is older than 15 minutes (node hasn't reported in 15+ min) */
const STALE_MINUTES = 15;

export function countBadHosts(hosts: HostRow[]): number {
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000);
  return hosts.filter((h) => !h.updatedAt || new Date(h.updatedAt) < cutoff).length;
}

export function getBadHosts(hosts: HostRow[]): HostRow[] {
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000);
  return hosts.filter((h) => !h.updatedAt || new Date(h.updatedAt) < cutoff);
}

export async function updateHostRemarks(hostId: number, remarks: string): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(
      'UPDATE machine_info SET remarks = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
      [remarks, hostId]
    );
  } finally {
    client.release();
  }
}
