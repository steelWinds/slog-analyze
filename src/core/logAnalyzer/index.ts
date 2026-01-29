import type {
	LogAnalyzerResult,
	LogAnalyzerState,
	LogEntry,
} from '@/core/logAnalyzer/types.ts';

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
			uniqueRemoteHosts: new Set(),
		};
	}

	combine(entry: LogEntry): void {
		this._state.totalRequests++;

		this._state.uniqueRemoteHosts.add(entry.remoteHost);

		this._mutationIncrementValue(this._state.requests, entry.request);

		const hour = new Date(entry.dateTime).getUTCHours().toString();

		this._mutationIncrementValue(this._state.trafficByHour, hour);

		this._mutationIncrementValue(this._state.statusCodes, entry.statusCode);
	}

	getResult(): LogAnalyzerResult {
		return {
			topRequests: this._sortDesc(this._state.requests),
			topStatusCodes: this._sortDesc(this._state.statusCodes),
			topTrafficHours: this._sortDesc(this._state.trafficByHour),
			totalRequests: this._state.totalRequests,
			uniqueRemoteHostsCount: this._state.uniqueRemoteHosts.size,
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
