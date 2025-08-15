import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test.describe('Login', () => {
		test('should display login form', async ({ page }) => {
			await page.goto('/login');
			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('input[name="password"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('should login with valid credentials', async ({ page }) => {
			await page.goto('/login');
			await page.fill('input[name="email"]', 'test@example.com');
			await page.fill('input[name="password"]', 'Test123!');
			await page.click('button[type="submit"]');
			
			await expect(page).toHaveURL('/dashboard');
			await expect(page.locator('text=Welcome, Test User')).toBeVisible();
		});

		test('should show error for invalid credentials', async ({ page }) => {
			await page.goto('/login');
			await page.fill('input[name="email"]', 'invalid@example.com');
			await page.fill('input[name="password"]', 'wrongpassword');
			await page.click('button[type="submit"]');
			
			await expect(page.locator('text=Invalid credentials')).toBeVisible();
			await expect(page).toHaveURL('/login');
		});

		test('should validate email format', async ({ page }) => {
			await page.goto('/login');
			await page.fill('input[name="email"]', 'invalid-email');
			await page.fill('input[name="password"]', 'Test123!');
			await page.click('button[type="submit"]');
			
			await expect(page.locator('text=Please enter a valid email')).toBeVisible();
		});
	});

	test.describe('Registration', () => {
		test('should display registration form', async ({ page }) => {
			await page.goto('/register');
			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('input[name="password"]')).toBeVisible();
			await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
			await expect(page.locator('input[name="name"]')).toBeVisible();
		});

		test('should register new user', async ({ page }) => {
			await page.goto('/register');
			await page.fill('input[name="email"]', 'newuser@example.com');
			await page.fill('input[name="password"]', 'NewPass123!');
			await page.fill('input[name="confirmPassword"]', 'NewPass123!');
			await page.fill('input[name="name"]', 'New User');
			await page.click('button[type="submit"]');
			
			await expect(page).toHaveURL('/verify-email');
			await expect(page.locator('text=Check your email')).toBeVisible();
		});

		test('should validate password confirmation', async ({ page }) => {
			await page.goto('/register');
			await page.fill('input[name="email"]', 'newuser@example.com');
			await page.fill('input[name="password"]', 'NewPass123!');
			await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
			await page.click('button[type="submit"]');
			
			await expect(page.locator('text=Passwords do not match')).toBeVisible();
		});

		test('should validate password strength', async ({ page }) => {
			await page.goto('/register');
			await page.fill('input[name="email"]', 'newuser@example.com');
			await page.fill('input[name="password"]', 'weak');
			await page.fill('input[name="confirmPassword"]', 'weak');
			await page.click('button[type="submit"]');
			
			await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
		});
	});

	test.describe('Password Reset', () => {
		test('should display password reset form', async ({ page }) => {
			await page.goto('/reset-password');
			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('should send password reset email', async ({ page }) => {
			await page.goto('/reset-password');
			await page.fill('input[name="email"]', 'test@example.com');
			await page.click('button[type="submit"]');
			
			await expect(page.locator('text=Password reset email sent')).toBeVisible();
		});
	});

	test.describe('Protected Routes', () => {
		test('should redirect unauthenticated users to login', async ({ page }) => {
			await page.goto('/dashboard');
			await expect(page).toHaveURL('/login');
		});

		test('should allow authenticated users to access dashboard', async ({ page }) => {
			// Login first
			await page.goto('/login');
			await page.fill('input[name="email"]', 'test@example.com');
			await page.fill('input[name="password"]', 'Test123!');
			await page.click('button[type="submit"]');
			
			await page.goto('/dashboard');
			await expect(page).toHaveURL('/dashboard');
			await expect(page.locator('text=Dashboard')).toBeVisible();
		});
	});
});
