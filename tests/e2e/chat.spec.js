import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Login before each test
		await page.goto('/login');
		await page.fill('input[name="email"]', 'test@example.com');
		await page.fill('input[name="password"]', 'Test123!');
		await page.click('button[type="submit"]');
		await page.waitForURL('/dashboard');
	});

	test('should display chat interface', async ({ page }) => {
		await page.goto('/chat');
		await expect(page.locator('text=Chat')).toBeVisible();
		await expect(page.locator('[placeholder="Type your message..."]')).toBeVisible();
		await expect(page.locator('button:has-text("Send")')).toBeVisible();
	});

	test('should send a message', async ({ page }) => {
		await page.goto('/chat');
		await page.fill('[placeholder="Type your message..."]', 'Hello, this is a test message');
		await page.click('button:has-text("Send")');
		
		await expect(page.locator('text=Hello, this is a test message')).toBeVisible();
	});

	test('should display AI response', async ({ page }) => {
		await page.goto('/chat');
		await page.fill('[placeholder="Type your message..."]', 'What is 2+2?');
		await page.click('button:has-text("Send")');
		
		// Wait for AI response
		await page.waitForTimeout(2000);
		await expect(page.locator('text=4')).toBeVisible();
	});

	test('should clear input after sending', async ({ page }) => {
		await page.goto('/chat');
		await page.fill('[placeholder="Type your message..."]', 'Test message');
		await page.click('button:has-text("Send")');
		
		await expect(page.locator('[placeholder="Type your message..."]')).toHaveValue('');
	});

	test('should handle empty message', async ({ page }) => {
		await page.goto('/chat');
		await page.click('button:has-text("Send")');
		
		await expect(page.locator('[placeholder="Type your message..."]')).toHaveValue('');
	});

	test('should display message history', async ({ page }) => {
		await page.goto('/chat');
		
		// Send multiple messages
		await page.fill('[placeholder="Type your message..."]', 'First message');
		await page.click('button:has-text("Send")');
		
		await page.fill('[placeholder="Type your message..."]', 'Second message');
		await page.click('button:has-text("Send")');
		
		await expect(page.locator('text=First message')).toBeVisible();
		await expect(page.locator('text=Second message')).toBeVisible();
	});

	test('should scroll to bottom on new message', async ({ page }) => {
		await page.goto('/chat');
		
		// Send multiple messages to trigger scrolling
		for (let i = 0; i < 10; i++) {
			await page.fill('[placeholder="Type your message..."]', `Message ${i}`);
			await page.click('button:has-text("Send")');
		}
		
		// Check if scroll is at bottom
		const scrollContainer = page.locator('.chat-messages');
		const scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
		const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
		const clientHeight = await scrollContainer.evaluate(el => el.clientHeight);
		
		expect(scrollTop + clientHeight).toBeGreaterThanOrEqual(scrollHeight - 10);
	});
});
