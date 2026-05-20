// Load test environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.env.test` });

import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
// Ensure Request/Response globals are available (whatwg-fetch provides them in test env)
if (typeof global.Request === 'undefined' && typeof Request !== 'undefined') {
	// @ts-ignore
	global.Request = Request;
}

if (typeof global.Response === 'undefined' && typeof Response !== 'undefined') {
	// @ts-ignore
	global.Response = Response;
}

// Jest: mock Auth0 ESM package to avoid parsing ESM sources from node_modules
try {
	// @ts-ignore
	jest.mock('@auth0/nextjs-auth0', () => {
		const getSession = jest.fn();
		return {
			Auth0Client: class {
				getSession = getSession;
			},
			auth0: { getSession },
		};
	});

	// @ts-ignore
	jest.mock('@auth0/nextjs-auth0/server', () => {
		const getSession = jest.fn();
		return {
			Auth0Client: class {
				getSession = getSession;
			},
			auth0: { getSession },
		};
	});
} catch (e) {
	// ignore when jest.mock is not available in this runtime
}

try {
	// @ts-ignore
	jest.mock('next/server', () => ({
		NextResponse: {
			json: (body: any, init?: any) => ({
				status: init?.status || 200,
				headers: init?.headers || {},
				body,
				json: async () => body,
			}),
		},
	}));
} catch (e) {}

import '@testing-library/jest-dom';
