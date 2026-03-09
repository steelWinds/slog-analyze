import type { LogAnalyzerResult, LogAnalyzerState, LogEntry } from './types.ts';
import { HLL_REGISTERS } from './constants.ts';
// @ts-expect-error hyperloglog-lite does not contain ts-types
import HyperLogLog from 'hyperloglog-lite';

export class LogAnalyzer {
	private _state: LogAnalyzerState;

	constructor() {
		this.reset();
	}

	reset() {
		this._state = {
			requests: {},
			statusCodes: {},
			totalRequests: 0,
			trafficByHour: {},
			uniqueRemoteHosts: new HyperLogLog(HLL_REGISTERS),
		};
	}

	combine(entry: LogEntry): void {
		this._state.totalRequests++;

		this._state.uniqueRemoteHosts.add(HyperLogLog.hash(entry.remoteHost));

		this._mutationIncrementValue(this._state.requests, entry.request);

		const hour = new Date(entry.dateTime)
			.getUTCHours()
			.toString()
			.padStart(2, '0');

		this._mutationIncrementValue(this._state.trafficByHour, hour);

		this._mutationIncrementValue(this._state.statusCodes, entry.statusCode);
	}

	getResult(): LogAnalyzerResult {
		return {
			topRequests: this._sortDesc(this._state.requests),
			topStatusCodes: this._sortDesc(this._state.statusCodes),
			topTrafficHours: this._sortDesc(this._state.trafficByHour),
			totalRequests: this._state.totalRequests,
			uniqueRemoteHostsCount: this._state.uniqueRemoteHosts.count() ?? 0,
		};
	}

	private _sortDesc<TKey extends string | number | symbol>(
		entry: Record<TKey, number>,
	) {
		return Object.entries<number>(entry).sort(([, a], [, b]) => b - a) as [
			TKey,
			number,
		][];
	}

	private _mutationIncrementValue<TKey extends string | number | symbol>(
		entry: Record<TKey, number>,
		key: TKey,
	) {
		entry[key] = (entry[key] || 0) + 1;
	}
}
