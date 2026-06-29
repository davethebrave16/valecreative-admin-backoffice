const isDevelopment = import.meta.env.DEV

export const debugLog = (message: string, data?: unknown) => {
	if (isDevelopment) {
		if (data !== undefined) {
			console.log(`[DATA_PROVIDER] ${message}`, data)
		} else {
			console.log(`[DATA_PROVIDER] ${message}`)
		}
	}
}

export const debugError = (message: string, error?: unknown) => {
	if (isDevelopment) {
		if (error !== undefined) {
			console.error(`[DATA_PROVIDER] ${message}`, error)
		} else {
			console.error(`[DATA_PROVIDER] ${message}`)
		}
	}
}

export const debugQuery = (resource: string, operation: string, details?: unknown) => {
	if (isDevelopment) {
		console.log(`[DATA_PROVIDER] ${operation.toUpperCase()} ${resource}`, details ?? '')
	}
}

export const debugResult = (resource: string, operation: string, count: number) => {
	if (isDevelopment) {
		console.log(`[DATA_PROVIDER] ${operation.toUpperCase()} ${resource} result: ${count} documents`)
	}
}
