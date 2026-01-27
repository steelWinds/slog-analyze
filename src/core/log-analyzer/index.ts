import type { LogAnalyzerState, LogEntry } from '@/core/log-analyzer/types.ts';
import { INITIAL_STATE } from '@/core/log-analyzer/constants.ts';

export class LogAnalyzer {
	private _state: LogAnalyzerState = { ...INITIAL_STATE };

	reset() {
		this._state = { ...INITIAL_STATE };
	}

	combine(entry: LogEntry): void {
		this._state.totalRequests++;

		this._state.uniqueIPs.add(entry.remoteHost);

		this._state.requests.set(
			entry.request,
			(this._state.requests.get(entry.request) || 0) + 1,
		);

		this._state.trafficByHour.set(
			new Date(entry.dateTime),
			(this._state.trafficByHour.get(new Date(entry.dateTime)) || 0) + 1,
		);
	}

	get state() {
		return this._state;
	}
}
