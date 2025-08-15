import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends, request }) => {
  try {
    // Re-run this load when auth state changes
    depends('app:auth');
    
    // Get session from locals
    const session = await locals.getSession?.() || null;

    console.log('Layout server - Session:', session);
    console.log('Layout server - User:', session?.user);
    console.log('Layout server - Session exists:', !!session);

    // Ensure we return the user data properly
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role || 'user',
          image: session.user.image
        }
      };
    }

    return {
      user: null
    };
  } catch (error) {
    console.error('Layout server load error:', error);
    return {
      user: null
    };
  }
};

// Add invalidation key for authentication state
export const config = {
  isr: {
    // Invalidate this layout when auth changes
		invalidate: 'app:auth'
  }
};
