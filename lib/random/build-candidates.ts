import type { PlaceWithRelations, RandomCandidate, WishlistPlaceWithMeta } from '@/types';

export function placesToCandidate(place: PlaceWithRelations): RandomCandidate {
  return {
    kind: 'place',
    id: place.id as number,
    name: place.name,
    categoryId: place.categoryId,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    coverImageId: place.coverImageId,
    rating: place.rating,
    cost: place.cost,
    googleMapsUrl: place.googleMapsUrl,
    addedOrCheckedInAt: new Date(place.checkinDate).getTime() || place.createdAt,
    wouldReturn: place.wouldReturn,
    isFavorite: place.isFavorite,
  };
}

export function wishlistToCandidate(item: WishlistPlaceWithMeta): RandomCandidate {
  return {
    kind: 'wishlist',
    id: item.id as number,
    name: item.name,
    categoryId: item.categoryId,
    address: item.address,
    lat: item.lat,
    lng: item.lng,
    coverImageId: item.coverImageId,
    priority: item.priority,
    cost: item.estimatedCost,
    googleMapsUrl: item.googleMapsUrl,
    addedOrCheckedInAt: item.addedAt,
  };
}

export function buildCandidatePool(
  places: PlaceWithRelations[],
  wishlist: WishlistPlaceWithMeta[]
): RandomCandidate[] {
  return [...places.map(placesToCandidate), ...wishlist.map(wishlistToCandidate)];
}
