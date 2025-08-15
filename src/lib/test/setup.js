import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	AUTH_SECRET: 'test-secret-key',
	DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/app',
	ADMIN_SECRET_KEY: 'test-admin-secret-key',
	EMAIL_FROM: 'test@example.com',
	SMTP_HOST: 'localhost',
	SMTP_PORT: 587,
	SMTP_USER: 'test@example.com',
	SMTP_PASSWORD: 'test-password'
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	dev: true,
	browser: false
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	prefetch: vi.fn(),
	prefetchRoutes: vi.fn()
}));

vi.mock('$app/stores', () => {
	const { readable } = require('svelte/store');
	return {
		page: readable({
			url: new URL('http://localhost:5173'),
			params: {},
			route: { id: '/' },
			status: 200,
			error: null,
			data: {}
		}),
		navigating: readable(null),
		updated: readable(false)
	};
});

// Global test utilities
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
