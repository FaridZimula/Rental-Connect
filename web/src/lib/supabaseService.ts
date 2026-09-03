import { supabase } from './supabase';
import type { Property, Inquiry } from '../types';

// Helper to map DB row to Property domain type
export function rowToProperty(row: any): Property {
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

// Helper to map Property domain type to DB row
export function propertyToRow(property: Property): Record<string, any> {
  const isUUID = property.owner_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(property.owner_id);
  return {
    id: property.id,
    owner_id: isUUID ? property.owner_id : null,
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

// ─── Properties Service ──────────────────────────────────────────────────────
export const supabaseProperties = {
  async getPublished(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToProperty);
    } catch (e) {
      console.warn('[SupabaseService] getPublished error:', e);
      return [];
    }
  },

  async getPending(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (data && Array.isArray(data)) {
        const pendingRows = data.filter((row) => {
          const s = row.status?.toLowerCase().trim();
          return s === 'pending_review' || s === 'pending' || s === 'pending review';
        });
        return pendingRows.map(rowToProperty);
      }
      return [];
    } catch (e) {
      console.warn('[SupabaseService] getPending error:', e);
      return [];
    }
  },

  async getAll(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToProperty);
    } catch (e) {
      console.warn('[SupabaseService] getAll error:', e);
      return [];
    }
  },

  async save(property: Property): Promise<void> {
    try {
      const row = propertyToRow(property);
      const { error } = await supabase.from('properties').upsert(row, { onConflict: 'id' });
      if (error) console.warn('[SupabaseService] save DB error:', error);
    } catch (e) {
      console.warn('[SupabaseService] save error:', e);
    }

    // Always broadcast live payload over Supabase Realtime WebSocket
    try {
      const channel = supabase.channel('properties_realtime');
      channel.send({
        type: 'broadcast',
        event: 'new_property',
        payload: { property },
      });
    } catch (e) {}
  },

  async updateStatus(
    id: string,
    status: 'published' | 'rejected' | 'suspended',
    reason?: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          status,
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) console.warn('[SupabaseService] updateStatus DB error:', error);
    } catch (e) {
      console.warn('[SupabaseService] updateStatus error:', e);
    }

    try {
      const channel = supabase.channel('properties_realtime');
      channel.send({
        type: 'broadcast',
        event: 'update_property',
        payload: { propertyId: id, status, reason },
      });
    } catch (e) {}
  },

  /** Subscribe to real-time property changes */
  subscribe(callbacks: {
    onInsert?: (property: Property) => void;
    onUpdate?: (property: Property) => void;
    onDelete?: (id: string) => void;
  }) {
    return supabase
      .channel('properties_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'properties' },
        (payload) => callbacks.onInsert?.(rowToProperty(payload.new)),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'properties' },
        (payload) => callbacks.onUpdate?.(rowToProperty(payload.new)),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'properties' },
        (payload) => payload.old?.id && callbacks.onDelete?.(payload.old.id as string),
      )
      .on(
        'broadcast',
        { event: 'new_property' },
        (payload) => payload.payload?.property && callbacks.onInsert?.(payload.payload.property),
      )
      .on(
        'broadcast',
        { event: 'update_property' },
        (payload) => payload.payload?.property && callbacks.onUpdate?.(payload.payload.property),
      )
      .subscribe();
  },
};

// ─── Inquiries Service ────────────────────────────────────────────────────────
export const supabaseInquiries = {
  async create(inquiry: {
    property_id: string;
    tenant_id: string;
    landlord_id: string;
    message: string;
    viewing_date?: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          property_id: inquiry.property_id,
          tenant_id: inquiry.tenant_id,
          landlord_id: inquiry.landlord_id,
          message: inquiry.message,
          viewing_date: inquiry.viewing_date || null,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('[SupabaseService] inquiry create error:', e);
      return null;
    }
  },

  async getByLandlord(landlordId: string): Promise<Inquiry[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Inquiry[];
    } catch (e) {
      console.warn('[SupabaseService] getByLandlord error:', e);
      return [];
    }
  },

  async respond(id: string, response: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          response,
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[SupabaseService] respond error:', e);
    }
  },

  subscribe(userId: string, onUpdate: (inquiry: any) => void) {
    return supabase
      .channel(`inquiries_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => onUpdate(payload.new),
      )
      .subscribe();
  },
};

// ─── Messages & Live Chat Service ─────────────────────────────────────────────
export const supabaseMessages = {
  async getConversation(user1: string, user2: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[SupabaseService] getConversation error:', e);
      return [];
    }
  },

  async send(msg: { sender_id: string; receiver_id: string; content: string; property_id?: string }) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          property_id: msg.property_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('[SupabaseService] send message error:', e);
      return null;
    }
  },

  subscribeToConversation(user1: string, user2: string, onMessage: (msg: any) => void) {
    return supabase
      .channel(`chat_${user1}_${user2}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user1 && msg.receiver_id === user2) ||
            (msg.sender_id === user2 && msg.receiver_id === user1)
          ) {
            onMessage(msg);
          }
        },
      )
      .subscribe();
  },
};

// ─── Notifications Service ────────────────────────────────────────────────────
export const supabaseNotifications = {
  async getForUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[SupabaseService] getNotifications error:', e);
      return [];
    }
  },

  async send(notification: { user_id: string; type: string; content: string; data?: any }) {
    try {
      const { error } = await supabase.from('notifications').insert(notification);
      if (error) throw error;
    } catch (e) {
      console.warn('[SupabaseService] sendNotification error:', e);
    }
  },

  subscribe(userId: string, onNotification: (notif: any) => void) {
    return supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => onNotification(payload.new),
      )
      .subscribe();
  },
};
