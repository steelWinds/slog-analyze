import type { MapSortFunction } from '@/utils/aggregate/types.ts';

export const mapSort = <TKey>(map: Map<TKey, number>, sort: MapSortFunction) =>
	new Map([...map.entries()].sort(sort));
