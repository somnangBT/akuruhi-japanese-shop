import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, User, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/initialProducts';
import { INITIAL_REGISTERED_USERS } from '../data/initialUsers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert database snake_case row to frontend Product type
export const mapRowToProduct = (row: any): Product => ({
  id: row.id,
  code: row.code || '',
  name: row.name || '',
  nameJp: row.name_jp || row.nameJp || '',
  nameKhmer: row.name_khmer || row.nameKhmer || '',
  category: row.category || 'frozen',
  price: Number(row.price) || 0,
  unit: row.unit || '',
  brand: row.brand || '',
  description: row.description || '',
  imageUrl: row.image_url || row.imageUrl || '',
  inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : (row.inStock !== undefined ? Boolean(row.inStock) : true),
  featured: row.featured !== undefined ? Boolean(row.featured) : false,
  storageTemp: row.storage_temp || row.storageTemp || 'Frozen',
});

// Convert frontend Product type to database snake_case row
export const mapProductToRow = (product: Product) => ({
  id: product.id,
  code: product.code,
  name: product.name,
  name_jp: product.nameJp || null,
  name_khmer: product.nameKhmer || null,
  category: product.category,
  price: product.price,
  unit: product.unit,
  brand: product.brand,
  description: product.description,
  image_url: product.imageUrl,
  in_stock: product.inStock,
  featured: product.featured || false,
  storage_temp: product.storageTemp || 'Frozen',
});

/**
 * Fetch all products from Supabase with graceful fallback
 */
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchProducts error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapRowToProduct);
    }

    // If database table is connected but empty, seed it with INITIAL_PRODUCTS
    if (data && data.length === 0) {
      console.log('Supabase products table is empty. Auto-seeding initial catalog...');
      const rowsToInsert = INITIAL_PRODUCTS.map(mapProductToRow);
      const { error: seedError } = await supabase.from('products').insert(rowsToInsert);
      if (!seedError) {
        return INITIAL_PRODUCTS;
      } else {
        console.warn('Auto-seed error:', seedError.message);
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to communicate with Supabase:', err);
    return null;
  }
};

/**
 * Upsert / Save a single product to Supabase
 */
export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const row = mapProductToRow(product);
    const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Supabase saveProduct error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveProductToSupabase exception:', err);
    return false;
  }
};

/**
 * Delete a product from Supabase
 */
export const deleteProductFromSupabase = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteProduct error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteProductFromSupabase exception:', err);
    return false;
  }
};

/**
 * Upload an image (File or base64 dataUrl) to Supabase Storage bucket 'shop-images'
 * Returns the public HTTPS URL accessible by any browser/device worldwide.
 */
export const uploadImageToSupabase = async (
  fileOrDataUrl: File | string,
  suggestedFilename: string
): Promise<string | null> => {
  if (!supabase) return null;
  try {
    let fileBody: Blob;
    let extension = 'jpg';
    let contentType = 'image/jpeg';

    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('data:')) {
        const matches = fileOrDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          extension = contentType.split('/')[1] || 'jpg';
          const byteCharacters = atob(matches[2]);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          fileBody = new Blob(byteArrays, { type: contentType });
        } else {
          return null;
        }
      } else {
        // Already a remote URL (e.g. http:// or https://)
        return fileOrDataUrl;
      }
    } else {
      fileBody = fileOrDataUrl;
      contentType = fileOrDataUrl.type || 'image/jpeg';
      extension = fileOrDataUrl.name.split('.').pop() || 'jpg';
    }

    const cleanBaseName = suggestedFilename
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniquePath = `products/${Date.now()}_${cleanBaseName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('shop-images')
      .upload(uniquePath, fileBody, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('shop-images')
      .getPublicUrl(uniquePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('uploadImageToSupabase exception:', err);
    return null;
  }
};

// ==========================================
// USER ACCOUNTS & REGISTRATION DATABASE SYNC
// ==========================================

export const mapRowToUser = (row: any): User => ({
  id: row.id,
  name: row.name || '',
  email: row.email || undefined,
  phone: row.phone || undefined,
  loginIdentifier: row.login_identifier || row.email || row.phone || row.id,
  password: row.password || '',
  role: (row.role === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin',
  address: row.address || '',
  telegram: row.telegram || undefined,
  registeredAt: row.registered_at || row.created_at || new Date().toISOString(),
  totalOrders: Number(row.total_orders) || 0,
  totalSpent: Number(row.total_spent) || 0,
  isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
});

export const mapUserToRow = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  login_identifier: user.loginIdentifier,
  password: user.password || '',
  role: user.role,
  address: user.address || '',
  telegram: user.telegram || null,
  registered_at: user.registeredAt || new Date().toISOString(),
  total_orders: user.totalOrders || 0,
  total_spent: user.totalSpent || 0,
  is_active: user.isActive !== undefined ? user.isActive : true,
});

/**
 * Fetch all registered users from Supabase
 */
export const fetchUsersFromSupabase = async (): Promise<User[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchUsers error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapRowToUser);
    }

    // Auto-seed initial users if empty
    if (data && data.length === 0) {
      console.log('Supabase users table is empty. Auto-seeding initial users...');
      const rows = INITIAL_REGISTERED_USERS.map(mapUserToRow);
      const { error: seedErr } = await supabase.from('users').insert(rows);
      if (!seedErr) {
        return INITIAL_REGISTERED_USERS;
      } else {
        console.warn('Auto-seed users error:', seedErr.message);
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to fetch users from Supabase:', err);
    return null;
  }
};

/**
 * Save / Upsert a single registered user into Supabase
 */
export const saveUserToSupabase = async (user: User): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    console.warn('saveUserToSupabase: Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL.');
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const row = mapUserToRow(user);
    console.log('Syncing user to Supabase:', row.login_identifier);
    // 1. Try upsert
    const { error: upsertErr } = await supabase.from('users').upsert(row, { onConflict: 'id' });
    if (!upsertErr) {
      console.log('User synced to Supabase successfully via upsert:', user.name);
      return { success: true };
    }

    console.warn('Supabase upsert notice, trying direct insert:', upsertErr.message);
    // 2. Fallback to direct insert
    const { error: insertErr } = await supabase.from('users').insert(row);
    if (!insertErr) {
      console.log('User synced to Supabase successfully via insert:', user.name);
      return { success: true };
    }

    console.error('Supabase saveUser failed:', insertErr.message);
    return { success: false, error: insertErr.message };
  } catch (err: any) {
    console.error('saveUserToSupabase exception:', err);
    return { success: false, error: err?.message || 'Network exception' };
  }
};

/**
 * Subscribe to realtime registered customer events
 */
export const subscribeToUsers = (onUserAdded: (user: User) => void) => {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel('users_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload: any) => {
          if (payload?.new) {
            onUserAdded(mapRowToUser(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase?.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn('Realtime users subscription notice:', err);
    return () => {};
  }
};

/**
 * Delete a user from Supabase
 */
export const deleteUserFromSupabase = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteUserFromSupabase exception:', err);
    return false;
  }
};

/**
 * Fetch store settings (brand colors, logo, shop background, contact info) from Supabase
 */
export const fetchSettingsFromSupabase = async (): Promise<StoreSettings | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('settings')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchSettings error:', error.message);
      return null;
    }

    if (data && data.settings) {
      return {
        ...DEFAULT_STORE_SETTINGS,
        ...(data.settings as Partial<StoreSettings>),
      };
    }

    // Auto-seed initial store settings if empty
    console.log('Supabase store_settings is empty. Auto-seeding initial store settings...');
    const { error: seedErr } = await supabase.from('store_settings').upsert({
      id: 'primary',
      settings: DEFAULT_STORE_SETTINGS,
      updated_at: new Date().toISOString(),
    });
    if (!seedErr) {
      return DEFAULT_STORE_SETTINGS;
    } else {
      console.warn('Auto-seed settings error:', seedErr.message);
    }

    return null;
  } catch (err) {
    console.warn('Failed to fetch settings from Supabase:', err);
    return null;
  }
};

/**
 * Save / Upsert store settings to Supabase
 */
export const saveSettingsToSupabase = async (settings: StoreSettings): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('store_settings').upsert(
      {
        id: 'primary',
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Supabase saveSettings error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveSettingsToSupabase exception:', err);
    return false;
  }
};

let settingsSaveTimer: any = null;

/**
 * Debounced save to Supabase to prevent excessive API writes while typing or dragging sliders
 */
export const saveSettingsToSupabaseDebounced = (
  settings: StoreSettings,
  delayMs: number = 500
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (settingsSaveTimer) {
      clearTimeout(settingsSaveTimer);
    }
    settingsSaveTimer = setTimeout(async () => {
      const res = await saveSettingsToSupabase(settings);
      resolve(res);
    }, delayMs);
  });
};

/**
 * Subscribe to realtime store settings changes (e.g. brand color, logo, notice changes)
 */
export const subscribeToSettings = (onUpdate: (settings: StoreSettings) => void) => {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel('store_settings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings', filter: 'id=eq.primary' },
        (payload: any) => {
          if (payload?.new?.settings) {
            onUpdate({
              ...DEFAULT_STORE_SETTINGS,
              ...(payload.new.settings as Partial<StoreSettings>),
            });
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase?.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn('Realtime settings subscription error:', err);
    return () => {};
  }
};
