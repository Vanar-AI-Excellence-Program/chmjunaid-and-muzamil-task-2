export const mockUser = {
	id: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
	role: 'USER',
	emailVerified: true,
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01')
};

export const mockAdmin = {
	...mockUser,
	id: 'admin-user-id',
	email: 'admin@example.com',
	role: 'ADMIN'
};

export const mockSession = {
	user: mockUser,
	expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

export const mockAuthProviders = [
	{ id: 'credentials', name: 'Credentials' },
	{ id: 'google', name: 'Google' }
];

// Mock database responses
export const mockDbUsers = [
	mockUser,
	mockAdmin,
	{
		id: 'user-2',
		email: 'user2@example.com',
		name: 'User Two',
		role: 'USER',
		emailVerified: false
	}
];

// Mock chat messages
export const mockMessages = [
	{
		id: 'msg-1',
		content: 'Hello, how can I help you?',
		role: 'assistant',
		createdAt: new Date('2024-01-01T10:00:00Z'),
		userId: mockUser.id
	},
	{
		id: 'msg-2',
		content: 'I need help with my account',
		role: 'user',
		createdAt: new Date('2024-01-01T10:01:00Z'),
		userId: mockUser.id
	}
];

// Mock API responses
export const mockApiResponses = {
	auth: {
		login: { success: true, user: mockUser },
		register: { success: true, user: mockUser },
		logout: { success: true }
	},
	users: {
		list: mockDbUsers,
		single: mockUser,
		update: { success: true, user: mockUser }
	},
	chat: {
		messages: mockMessages,
		send: { success: true, message: mockMessages[1] }
	}
};
