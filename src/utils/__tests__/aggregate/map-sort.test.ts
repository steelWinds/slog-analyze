import { expect, test } from 'vitest';
import { faker } from '@faker-js/faker/locale/en';
import { mapSort } from '@/utils/aggregate/map-sort.ts';

test('Prompt output', async () => {
	const sortedNumbers = Array.from({ length: 100 }, (_key, idx) => idx);

	const keys = faker.helpers.uniqueArray(faker.word.sample, 100);
	const values = faker.helpers.shuffle(sortedNumbers);

	const unsortedMap = new Map(
		Array.from({ length: 100 }, (_key, idx) => [keys[idx], values[idx]]),
	);

	const sortedMap = Array.from(
		mapSort(unsortedMap, ([, a], [, b]) => a - b).values(),
	);
	const reverseSortedMap = Array.from(
		mapSort(unsortedMap, ([, a], [, b]) => b - a).values(),
	);

	expect(sortedMap).toEqual(sortedNumbers);
	expect(reverseSortedMap).toEqual(sortedNumbers.sort((a, b) => b - a));
});
