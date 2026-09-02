import { supabase } from './supabase';
import { Property } from '../types';
import { supabaseProperties } from './supabaseService';

export const supabasePropertiesStore = {
  /** Save (upsert) a property to Supabase backend */
  async saveProperty(property: Property): Promise<void> {
    await supabaseProperties.save(property);
    // Also mirror to custom_properties table if present
    try {
      await supabase.from('custom_properties').upsert({
        id: property.id,
        title: property.title,
        status: property.status,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {}
  },

  /** Fetch all pending_review properties for Admin verification queue */
  async getPendingProperties(): Promise<Property[]> {
    return await supabaseProperties.getPending();
  },

  /** Fetch all custom properties (published + pending + all statuses) */
  async getAllCustomProperties(): Promise<Property[]> {
    return await supabaseProperties.getAll();
  },

  /** Update the status of a property (approve / reject / suspend) */
  async updatePropertyStatus(
    propertyId: string,
    status: 'published' | 'rejected' | 'suspended',
    reason?: string,
  ): Promise<void> {
    await supabaseProperties.updateStatus(propertyId, status, reason);
    try {
      await supabase
        .from('custom_properties')
        .update({ status, rejection_reason: reason || null, updated_at: new Date().toISOString() })
        .eq('id', propertyId);
    } catch (e) {}
  },

  /** Subscribe to real-time changes on properties table */
  subscribeToChanges(callbacks: {
    onInsert?: (property: Property) => void;
    onUpdate?: (property: Property) => void;
    onDelete?: (id: string) => void;
  }) {
    return supabaseProperties.subscribe(callbacks);
  },

  /** Unsubscribe from a realtime channel */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  },
};
