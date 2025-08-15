import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from './auth.js';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs');

describe('Auth Utilities', () => {
	describe('hashPassword', () => {
		it('should hash a password with salt rounds', async () => {
			const password = 'testPassword123';
			const hashedPassword = '$2b$10$hashedpassword';
			
			bcrypt.hash.mockResolvedValue(hashedPassword);
			
			const result = await hashPassword(password);
			
			expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
			expect(result).toBe(hashedPassword);
		});

		it('should handle empty password', async () => {
			const hashedPassword = '$2b$10$emptyhash';
			bcrypt.hash.mockResolvedValue(hashedPassword);
			
			const result = await hashPassword('');
			
			expect(bcrypt.hash).toHaveBeenCalledWith('', 10);
			expect(result).toBe(hashedPassword);
		});
	});

	describe('verifyPassword', () => {
		it('should verify correct password', async () => {
			const password = 'testPassword123';
			const hashedPassword = '$2b$10$hashedpassword';
			
			bcrypt.compare.mockResolvedValue(true);
			
			const result = await verifyPassword(password, hashedPassword);
			
			expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
			expect(result).toBe(true);
		});

		it('should reject incorrect password', async () => {
			const password = 'wrongPassword';
			const hashedPassword = '$2b$10$hashedpassword';
			
			bcrypt.compare.mockResolvedValue(false);
			
			const result = await verifyPassword(password, hashedPassword);
			
			expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
			expect(result).toBe(false);
		});
	});
});
