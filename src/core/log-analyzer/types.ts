export interface LogEntry {
	remoteHost: string;
	rfc931: string;
	authUser: string;
	dateTime: string;
	request: string;
	statusCode: string;
	bytesSent: string;
	referrer?: string;
	userAgent?: string;
}

export interface LogAnalyzerState {
	totalRequests: number;
	uniqueIPs: Set<string>;
	requests: Map<string, number>;
	trafficByHour: Map<Date, number>;
	statusCodes: Map<string, number>;
}
