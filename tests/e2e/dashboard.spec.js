import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Login before each test
		await page.goto('/login');
		await page.fill('input[name="email"]', 'test@example.com');
		await page.fill('input[name="password"]', 'Test123!');
		await page.click('button[type="submit"]');
		await page.waitForURL('/dashboard');
	});

	test.describe('User Dashboard', () => {
		test('should display user dashboard', async ({ page }) => {
			await expect(page.locator('text=Welcome, Test User')).toBeVisible();
			await expect(page.locator('text=User Dashboard')).toBeVisible();
		});

		test('should display user information', async ({ page }) => {
			await expect(page.locator('text=test@example.com')).toBeVisible();
			await expect(page.locator('text=Role: USER')).toBeVisible();
		});

		test('should navigate to profile', async ({ page }) => {
			await page.click('text=Profile');
			await expect(page).toHaveURL('/profile');
		});

		test('should navigate to chat', async ({ page }) => {
			await page.click('text=Chat');
			await expect(page).toHaveURL('/chat');
		});
	});

	test.describe('Admin Dashboard', () => {
		test('should display admin dashboard for admin users', async ({ page }) => {
			// Logout and login as admin
			await page.click('text=Logout');
			await page.goto('/login');
			await page.fill('input[name="email"]', 'admin@example.com');
			await page.fill('input[name="password"]', 'Admin123!');
			await page.click('button[type="submit"]');
			await page.waitForURL('/admin');

			await expect(page.locator('text=Admin Dashboard')).toBeVisible();
			await expect(page.locator('text=Manage Users')).toBeVisible();
			await expect(page.locator('text=System Overview')).toBeVisible();
		});

		test('should display user management section', async ({ page }) => {
			// Login as admin
			await page.click('text=Logout');
			await page.goto('/login');
			await page.fill('input[name="email"]', 'admin@example.com');
			await page.fill('input[name="password"]', 'Admin123!');
			await page.click('button[type="submit"]');
			await page.waitForURL('/admin');

			await expect(page.locator('text=Users')).toBeVisible();
			await expect(page.locator('table')).toBeVisible();
		});

		test('should allow admin to change user roles', async ({ page }) => {
			// Login as admin
			await page.click('text=Logout');
			await page.goto('/login');
			await page.fill('input[name="email"]', 'admin@example.com');
			await page.fill('input[name="password"]', 'Admin123!');
			await page.click('button[type="submit"]');
			await page.waitForURL('/admin');

			// Find user and change role
			await page.click('text=Users');
			await page.click('button[aria-label="Edit user"]');
			await page.selectOption('select[name="role"]', 'ADMIN');
			await page.click('button:has-text("Save")');
			
			await expect(page.locator('text=User role updated successfully')).toBeVisible();
		});
	});

	test.describe('Responsive Design', () => {
		test('should work on mobile devices', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await expect(page.locator('text=Welcome, Test User')).toBeVisible();
			await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
		});

		test('should work on tablet devices', async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await expect(page.locator('text=Welcome, Test User')).toBeVisible();
			await expect(page.locator('nav')).toBeVisible();
		});
	});
});
