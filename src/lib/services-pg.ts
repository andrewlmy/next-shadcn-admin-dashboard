/**
 * PostgreSQL data layer for manage_service (services)
 * Uses same adsng database as hosts
 */

import { pgPool } from '@/lib/hosts-pg';

export interface ServiceRow {
  id: number;
  name: string;
  status: string;
  port: string;
  projectId: number;
  enablePressureTest: boolean;
  enableContrastTest: number;
  createdAt: Date;
  updatedAt: Date;
  dockerLabelId?: number | null;
  contrastTest?: {
    defaultIp: string | null;
    testIp: string | null;
    dockerName: string | null;
    logFolder: string | null;
    resultPort: string | null;
  };
}

export async function getServices(): Promise<ServiceRow[]> {
  const client = await pgPool.connect();
  try {
    const result = await client.query<{
      id: number;
      name: string;
      disable: boolean;
      port: string;
      project_id: number;
      enable_pressure_test: boolean;
      enable_contrast_test: number;
      date_create: Date;
      date_last_update: Date;
      docker_label_id: number | null;
      contrast_test_default_ip: string | null;
      contrast_test_default_test_ip: string | null;
      contrast_test_default_docker_name: string | null;
      contrast_test_default_log_folder: string | null;
      contrast_test_default_result_port: string | null;
    }>(
      `SELECT id, name, disable, port, project_id, enable_pressure_test, enable_contrast_test,
              date_create, date_last_update, docker_label_id,
              contrast_test_default_ip, contrast_test_default_test_ip,
              contrast_test_default_docker_name, contrast_test_default_log_folder,
              contrast_test_default_result_port
       FROM manage_service
       ORDER BY id ASC`
    );

    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.disable ? 'disabled' : 'enabled',
      port: r.port ?? '7102',
      projectId: r.project_id ?? 0,
      enablePressureTest: r.enable_pressure_test ?? true,
      enableContrastTest: r.enable_contrast_test ?? 0,
      createdAt: r.date_create,
      updatedAt: r.date_last_update,
      dockerLabelId: r.docker_label_id,
      contrastTest: {
        defaultIp: r.contrast_test_default_ip,
        testIp: r.contrast_test_default_test_ip,
        dockerName: r.contrast_test_default_docker_name,
        logFolder: r.contrast_test_default_log_folder,
        resultPort: r.contrast_test_default_result_port,
      },
    }));
  } finally {
    client.release();
  }
}

export async function getServicesCounts(): Promise<{
  total: number;
  enabled: number;
  disabled: number;
}> {
  const client = await pgPool.connect();
  try {
    const [totalRes, enabledRes, disabledRes] = await Promise.all([
      client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM manage_service'),
      client.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM manage_service WHERE disable = false'
      ),
      client.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM manage_service WHERE disable = true'
      ),
    ]);
    return {
      total: parseInt(totalRes.rows[0]?.count ?? '0', 10),
      enabled: parseInt(enabledRes.rows[0]?.count ?? '0', 10),
      disabled: parseInt(disabledRes.rows[0]?.count ?? '0', 10),
    };
  } finally {
    client.release();
  }
}
