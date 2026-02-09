import { Detailer } from '../types';
import { calculateDistance } from './geo';

export interface RankedDetailer extends Detailer {
  distance: number;
  relevanceScore: number;
}

export interface RankingParams {
  userLat: number;
  userLng: number;
  serviceFilter?: string;
  sortBy?: 'distance' | 'rating' | 'relevance';
}

// Calculate relevance score for ranking
export function calculateRelevanceScore(
  detailer: Detailer,
  distance: number
): number {
  let score = 0;

  // Pro detailers get a boost
  if (detailer.isPro) score += 20;

  // Rating component (0-30 points)
  score += (detailer.rating / 5) * 30;

  // Review count component (0-20 points, capped)
  score += Math.min(detailer.reviewCount / 10, 20);

  // Distance penalty (closer is better)
  // Max penalty of -30 points at 20+ miles
  const distancePenalty = Math.min(distance * 1.5, 30);
  score -= distancePenalty;

  // Response rate boost (simulated for now)
  const responseRate = detailer.completedJobs / (detailer.completedJobs + 10);
  score += responseRate * 15;

  // Verified boost
  if ((detailer as any).verified) score += 10;

  return Math.max(0, score);
}

export function rankDetailers(
  detailers: Detailer[],
  params: RankingParams
): RankedDetailer[] {
  const { userLat, userLng, serviceFilter, sortBy = 'relevance' } = params;

  // Calculate distances and scores
  const rankedDetailers: RankedDetailer[] = detailers.map((detailer) => {
    const detailerCoords = (detailer as any).coordinates || {
      lat: 40.7128,
      lng: -74.006,
    };
    
    const distance = calculateDistance(
      userLat,
      userLng,
      detailerCoords.lat,
      detailerCoords.lng
    );

    const relevanceScore = calculateRelevanceScore(detailer, distance);

    return {
      ...detailer,
      distance,
      relevanceScore,
    };
  });

  // Filter by service if specified
  let filtered = rankedDetailers;
  if (serviceFilter && serviceFilter !== 'all') {
    filtered = rankedDetailers.filter((d) =>
      d.services.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase()))
    );
  }

  // Sort based on criteria
  filtered.sort((a, b) => {
    // Pro detailers always rank higher
    if (a.isPro && !b.isPro) return -1;
    if (!a.isPro && b.isPro) return 1;

    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'rating':
        return b.rating - a.rating;
      case 'relevance':
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });

  return filtered;
}
