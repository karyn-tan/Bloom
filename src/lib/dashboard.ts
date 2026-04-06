import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase-server';

export type DashboardUser = {
  email: string;
  avatarUrl: string | null;
};

export type ScanSummary = {
  id: string;
  imageUrl: string | null;
  flowerName: string;
  scientificName: string;
  lifespanMin: number | null;
  lifespanMax: number | null;
  createdAt: string;
};

export type DashboardState = {
  isNewUser: boolean;
  scanCount: number;
  user: DashboardUser;
  scans: ScanSummary[];
};

/**
 * Fetches the authenticated user's profile info for the navbar.
 * Redirects to /login if not authenticated.
 */
export async function getDashboardUser(): Promise<DashboardUser> {
  const supabase = createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrl =
    typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null;

  return {
    email: user.email ?? '',
    avatarUrl,
  };
}

/**
 * Fetches the dashboard state for the current authenticated user.
 * Redirects to /login if not authenticated.
 */
export async function getUserDashboardState(): Promise<DashboardState> {
  const supabase = createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrl =
    typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null;

  const dashboardUser: DashboardUser = {
    email: user.email ?? '',
    avatarUrl,
  };

  const { count, error } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    return { isNewUser: true, scanCount: 0, user: dashboardUser, scans: [] };
  }

  const scanCount = count ?? 0;

  let scans: ScanSummary[] = [];
  if (scanCount > 0) {
    scans = await fetchUserScans(supabase, user.id);
  }

  return {
    isNewUser: scanCount === 0,
    scanCount,
    user: dashboardUser,
    scans,
  };
}

type FlowerEntry = {
  common_name?: string;
  scientific_name?: string;
  care?: { lifespan_days?: { min?: number; max?: number } } | null;
};

type ScanRow = {
  id: string;
  image_url: string;
  flowers: unknown;
  created_at: string;
};

async function fetchUserScans(
  supabase: ReturnType<typeof createServerComponentClient>,
  userId: string,
): Promise<ScanSummary[]> {
  const { data, error } = await supabase
    .from('scans')
    .select('id, image_url, flowers, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];

  const scans: ScanSummary[] = [];

  for (const row of data as ScanRow[]) {
    const flowers = row.flowers as FlowerEntry[] | null;
    const flower = Array.isArray(flowers) ? flowers[0] : null;

    let imageUrl: string | null = null;
    if (row.image_url) {
      if (row.image_url.startsWith('http')) {
        imageUrl = row.image_url;
      } else {
        const { data: signedData } = await supabase.storage
          .from('flower-images')
          .createSignedUrl(row.image_url, 3600);
        imageUrl = signedData?.signedUrl ?? null;
      }
    }

    scans.push({
      id: row.id,
      imageUrl,
      flowerName: flower?.common_name ?? 'Unknown flower',
      scientificName: flower?.scientific_name ?? '',
      lifespanMin: flower?.care?.lifespan_days?.min ?? null,
      lifespanMax: flower?.care?.lifespan_days?.max ?? null,
      createdAt: row.created_at,
    });
  }

  return scans;
}
