import { supabase } from './supabase';
import { Property } from '../types';

// ─── Helper: Map Supabase row → Property ─────────────────────────────────────

function rowToProperty(row: any): Property {
  return {
    id: row.id,
    owner_id: row.owner_id || '',
    title: row.title,
    description: row.description || '',
    property_type: row.property_type,
    listing_type: row.listing_type,
    price: Number(row.price),
    price_period: row.price_period || '/month',
    display_zone: row.display_zone || '',
    real_address: row.real_address || '',
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    area_sqft: row.area_sqft || undefined,
    status: row.status,
    rejection_reason: row.rejection_reason || null,
    is_available: row.is_available ?? true,
    created_at: row.created_at,
    images: Array.isArray(row.images) ? row.images : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    owner: {
      full_name: row.owner_name || 'Landlord',
      email: row.owner_email || '',
      phone: row.owner_phone || '',
    },
  };
}

// ─── Helper: Map Property → Supabase row ─────────────────────────────────────

function propertyToRow(property: Property): Record<string, any> {
  return {
    id: property.id,
    owner_id: property.owner_id || null,
    owner_email: property.owner?.email || null,
    owner_name: property.owner?.full_name || null,
    owner_phone: property.owner?.phone || null,
    title: property.title,
    description: property.description || null,
    property_type: property.property_type,
    listing_type: property.listing_type,
    price: Number(property.price),
    price_period: property.price_period || '/month',
    display_zone: property.display_zone || null,
    real_address: property.real_address || null,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area_sqft: property.area_sqft || null,
    status: property.status || 'pending_review',
    rejection_reason: property.rejection_reason || null,
    is_available: property.is_available ?? true,
    images: property.images || [],
    amenities: property.amenities || [],
    updated_at: new Date().toISOString(),
  };
}

// ─── Supabase Custom Properties Store ────────────────────────────────────────

export const supabasePropertiesStore = {
  /** Save (upsert) a property to Supabase custom_properties table */
  async saveProperty(property: Property): Promise<void> {
    try {
      const row = propertyToRow(property);
      const { error } = await supabase
        .from('custom_properties')
        .upsert(row, { onConflict: 'id' });

      if (error) throw error;
    } catch (e) {
      console.warn('[SupabaseStore] saveProperty failed (local cache still active):', e);
    }
  },

  /** Fetch all pending_review properties for Admin verification queue */
  async getPendingProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('custom_properties')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(rowToProperty);
    } catch (e) {
      console.warn('[SupabaseStore] getPendingProperties failed:', e);
      return [];
    }
  },

  /** Fetch all custom properties (published + pending + all statuses) */
  async getAllCustomProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('custom_properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(rowToProperty);
    } catch (e) {
      console.warn('[SupabaseStore] getAllCustomProperties failed:', e);
      return [];
    }
  },

  /** Update the status of a property (approve / reject / suspend) */
  async updatePropertyStatus(
    propertyId: string,
    status: 'published' | 'rejected' | 'suspended',
    reason?: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_properties')
        .update({
          status,
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;
    } catch (e) {
      console.warn('[SupabaseStore] updatePropertyStatus failed:', e);
    }
  },

  /**
   * Subscribe to real-time changes on custom_properties table.
   * Calls onInsert when a new property is submitted,
   * onUpdate when a property status changes.
   * Returns the channel for cleanup.
   */
  subscribeToChanges(callbacks: {
    onInsert?: (property: Property) => void;
    onUpdate?: (property: Property) => void;
    onDelete?: (id: string) => void;
  }) {
    const channel = supabase
      .channel('custom_properties_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'custom_properties' },
        (payload) => {
          if (callbacks.onInsert && payload.new) {
            callbacks.onInsert(rowToProperty(payload.new));
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'custom_properties' },
        (payload) => {
          if (callbacks.onUpdate && payload.new) {
            callbacks.onUpdate(rowToProperty(payload.new));
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'custom_properties' },
        (payload) => {
          if (callbacks.onDelete && payload.old?.id) {
            callbacks.onDelete(payload.old.id as string);
          }
        },
      )
      .subscribe();

    return channel;
  },

  /** Unsubscribe from a realtime channel */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  },
};
