export interface LogEntry {
	remoteHost: string;
	rfc931: string;
	authUser: string;
	dateTime: Date;
	request: string;
	statusCode: string | number;
	bytesSent: string | number;
	referrer?: string;
	userAgent?: string;
}

export interface LogAnalyzerState {
	totalRequests: number;
	uniqueRemoteHosts: Set<string>;
	requests: Record<string, number>;
	trafficByHour: Record<string, number>;
	statusCodes: Record<string | number, number>;
}

export interface LogAnalyzerResult {
	totalRequests: number;
	uniqueRemoteHostsCount: number;
	topRequests: Array<[string, number]>;
	topTrafficHours: Array<[string, number]>;
	topStatusCodes: Array<[string | number, number]>;
}
