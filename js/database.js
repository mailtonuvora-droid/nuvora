// Supabase Configuration
const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

console.log('Nuvora: Loading database service...');

// Define DB object immediately so it's globally available
window.DB = {
    async findOrCreateUser(userData) {
        if (!window.supabaseClient) {
            console.error('Nuvora: Supabase client is missing in findOrCreateUser');
            return { error: 'Supabase client not initialized' };
        }

        try {
            // Build the OR query string dynamically to handle cases where one might be empty/null
            // strictly seeking match on email OR mobile if they are provided
            const conditions = [];
            if (userData.email) conditions.push(`email.eq.${userData.email}`);
            if (userData.mobile) conditions.push(`mobile.eq.${userData.mobile}`);

            let existingUser = null;

            if (conditions.length > 0) {
                const orQuery = conditions.join(',');
                const { data: users, error: findError } = await window.supabaseClient
                    .from('users')
                    .select('*')
                    .or(orQuery);

                if (findError) {
                    console.warn('Nuvora: Error searching for user, proceeding to try insert anyway.', findError);
                } else if (users && users.length > 0) {
                    // User exists
                    existingUser = users[0];
                    console.log('Nuvora: Existing user found (Order Flow):', existingUser.email || existingUser.mobile);
                    return { data: existingUser };
                }
            }

            // If we are here, we think the user doesn't exist. Try to insert.
            console.log('Nuvora: User not found, creating new account...');
            // Ensure we don't insert partial undefineds if not intended, though Supabase handles nulls.
            const { data: newUser, error: createError } = await window.supabaseClient
                .from('users')
                .insert([userData])
                .select()
                .single();

            // Handle potential race condition or constrained error (duplicate key)
            if (createError) {
                // If error is related to duplicate key (Postgres 23505), try fetching again
                if (createError.code === '23505' || (createError.message && createError.message.includes('duplicate key'))) {
                    console.log('Nuvora: Duplicate key error intercepted. Retrying fetch...');
                    const orQuery = conditions.join(',');
                    const { data: retriedUser, error: retryError } = await window.supabaseClient
                        .from('users')
                        .select('*')
                        .or(orQuery)
                        .maybeSingle();

                    if (retriedUser) {
                        return { data: retriedUser };
                    }
                    return { error: retryError || createError };
                }

                console.error('Nuvora: User creation failed:', createError);
                return { error: createError };
            }

            return { data: newUser };

        } catch (err) {
            console.error('Nuvora: findOrCreateUser exception:', err);
            return { error: err };
        }
    },

    async createOrder(userId, items, total, shippingAddress, gstAmount = 0, platformFeeAmount = 0) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };

        try {
            const { data, error } = await window.supabaseClient
                .from('orders')
                .insert([{
                    user_id: userId,
                    items: items,
                    total_amount: total,
                    shipping_address: shippingAddress,
                    gst_amount: gstAmount,
                    platform_fee_amount: platformFeeAmount,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) {
                console.error('Nuvora: Order creation error:', error);
            } else {
                console.log('Nuvora: Order created successfully!', data);
            }
            return { data, error };
        } catch (err) {
            console.error('Nuvora: createOrder exception:', err);
            return { error: err };
        }
    },

    async getOrdersByUser(emailOrMobile) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };

        try {
            // 1. Find user first - robust check
            const { data: users, error: userError } = await window.supabaseClient
                .from('users')
                .select('id, email, first_name, last_name')
                .or(`email.eq.${emailOrMobile},mobile.eq.${emailOrMobile}`);

            if (userError) {
                console.error('Nuvora: Error finding user for tracking:', userError);
                return { error: 'User lookup failed' };
            }

            if (!users || users.length === 0) {
                return { error: 'User not found' };
            }

            // Take the first matching user
            const user = users[0];

            if (userError || !user) return { error: 'User not found' };

            // 2. Fetch orders for this user
            const { data: orders, error: ordersError } = await window.supabaseClient
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            return { data: { user, orders }, error: ordersError };
        } catch (err) {
            console.error('Nuvora: getOrdersByUser exception:', err);
            return { error: err };
        }
    },

    async updateUser(userId, updates) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        try {
            const { data, error } = await window.supabaseClient
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select();

            return { data, error };
        } catch (err) {
            console.error('Nuvora: updateUser exception:', err);
            return { error: err };
        }
    },

    async getProducts() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('products').select('*').order('name');
    },

    async addProduct(product) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        // Ensure uom, original_price, free_shipping, and variants are included
        return await window.supabaseClient.from('products').insert([product]).select().single();
    },

    async updateProductStock(id, quantity) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('products').update({ stock_quantity: quantity }).eq('id', id);
    },

    async updateProduct(id, product) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('products').update(product).eq('id', id);
    },

    async getProduct(id) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('products').select('*').eq('id', id).single();
    },

    async getAllOrders() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('orders').select('*, users(email, first_name, last_name)').order('created_at', { ascending: false });
    },

    async updateOrderStatus(orderId, status) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('orders').update({ status }).eq('id', orderId);
    },

    async subscribeToStock(email, productId) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('stock_notifications').insert([{ user_email: email, product_id: productId }]);
    },

    async uploadProductImage(file) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await window.supabaseClient.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) return { error };

        const { data: { publicUrl } } = window.supabaseClient.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return { data: publicUrl };
    },

    async getCategories() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        const { data, error } = await window.supabaseClient.from('products').select('category').order('category');
        if (error) return { error };
        const uniqueCategories = [...new Set(data.map(i => i.category))];
        return { data: uniqueCategories };
    },

    async decrementProductStock(id, amount) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };

        // Use an RPC if possible for atomicity, but for now simple fetch-and-update
        const { data: product } = await window.supabaseClient.from('products').select('stock_quantity').eq('id', id).single();
        if (product) {
            const newStock = Math.max(0, product.stock_quantity - amount);
            return await window.supabaseClient.from('products').update({ stock_quantity: newStock }).eq('id', id);
        }
        return { error: 'Product not found' };
    },

    async deleteProduct(id) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('products').delete().eq('id', id);
    },

    async getStockNotifications() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient
            .from('stock_notifications')
            .select('*, products(name)')
            .order('created_at', { ascending: false });
    },

    async getSettings() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('settings').select('*');
    },

    async updateSetting(key, value) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('settings').upsert({ key, value });
    },

    async validateCoupon(code) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();
    },

    async getCoupons() {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
    },

    async addCoupon(coupon) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('coupons').insert([coupon]);
    },

    async deleteCoupon(id) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('coupons').delete().eq('id', id);
    },

    async deleteOrder(id) {
        if (!window.supabaseClient) return { error: 'Supabase client not initialized' };
        return await window.supabaseClient.from('orders').delete().eq('id', id);
    }
};

// Initialize Supabase Client
try {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Nuvora: Supabase client created.');
    } else {
        console.error('Nuvora: Supabase library not found! Ensure script is loaded.');
    }
} catch (err) {
    console.error('Nuvora: Error initializing Supabase:', err);
}
