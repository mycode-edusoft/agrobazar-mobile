import type { NotificationApi } from '../api';
import type { AppNotification, NotificationKind } from '@/types/domain';
import { request, unwrapList } from './client';

interface ApiNotification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  listing_id: number | null;
  listing_slug: string | null;
}

const KINDS: NotificationKind[] = ['vip', 'premium', 'listing', 'payment', 'system'];

export function mapNotification(n: ApiNotification): AppNotification {
  return {
    id: String(n.id),
    kind: KINDS.includes(n.kind) ? n.kind : 'system',
    title: n.title ?? '',
    body: n.body ?? '',
    createdAt: n.created_at,
    read: n.is_read,
    // UI elan marşrutu slug ilə işləyir; elan silinibsə null
    listingId: n.listing_slug || (n.listing_id != null ? String(n.listing_id) : null),
  };
}

export const httpNotifications: NotificationApi = {
  async list(sort) {
    const res = await request<unknown>('notifications/', { query: { sort, page_size: 100 } });
    return unwrapList<ApiNotification>(res).items.map(mapNotification);
  },

  async unreadCount() {
    const res = await request<{ count: number }>('notifications/unread-count/');
    return res.count ?? 0;
  },

  async markRead(id) {
    await request(`notifications/${id}/read/`, { method: 'POST' });
  },

  async markAllRead() {
    await request('notifications/read-all/', { method: 'POST' });
  },

  async remove(id) {
    await request(`notifications/${id}/`, { method: 'DELETE' });
  },

  async registerDevice(token, platform) {
    await request('notifications/devices/', { method: 'POST', body: { token, platform } });
  },

  async unregisterDevice(token) {
    await request('notifications/devices/', { method: 'DELETE', body: { token } });
  },

  async pushEnabled() {
    const res = await request<{ push_enabled: boolean }>('notifications/settings/');
    return res.push_enabled;
  },

  async setPushEnabled(enabled) {
    const res = await request<{ push_enabled: boolean }>('notifications/settings/', {
      method: 'PATCH',
      body: { push_enabled: enabled },
    });
    return res.push_enabled;
  },
};
