import type { LogAnalyzerState } from '@/core/log-analyzer/types.ts';

export const INITIAL_STATE: LogAnalyzerState = {
	requests: new Map(),
	totalRequests: 0,
	trafficByHour: new Map(),
	uniqueIPs: new Set(),
};
