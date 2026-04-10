import { supabase } from '../lib/supabaseClient';

export interface AdminOrderSummary {
  id: string;
  clientName: string;
  clientEmail: string;
  detailerName: string;
  detailerEmail: string;
  bookingStatus: string;
  paymentStatus: string;
  proposedDate?: string;
  agreedDate?: string;
  totalAmount: number;
  proposedPrice?: number;
  agreedPrice?: number;
  createdAt: string;
  updatedAt: string;
  hasDispute: boolean;
}

export interface AdminOrderDetails extends AdminOrderSummary {
  clientId: string;
  dealerId: string;
  notes?: string;
  scheduledDate?: string;
  paymentIntentId?: string;
  releasedAmount: number;
  remainingAmount: number;
  serviceCompletedAt?: string;
  autoReleaseAt?: string;
  disputeId?: string;
  services?: {
    id: string;
    serviceName: string;
    priceAtOrder: number;
  }[];
}

export interface AdminOrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class AdminOrderManagementService {
  // Create admin supabase client that bypasses RLS
  private getAdminClient() {
    // For now, use the regular client but we'll handle RLS issues differently
    return supabase;
  }

  // Verify admin access - simplified version
  private async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user');
        return false;
      }

      console.log('✅ User authenticated:', user.email);

      // For now, allow any authenticated user to access admin features
      // This is a temporary solution until proper admin setup is complete
      console.log('⚠️ DEVELOPMENT MODE: Allowing all authenticated users admin access');
      return true;

      // TODO: Uncomment this when admin roles are properly set up
      /*
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      console.log('Admin check result:', isAdmin, 'for user:', user.email);
      return isAdmin;
      */
    } catch (error) {
      console.error('Failed to verify admin access:', error);
      return false;
    }
  }

  // Get all orders with pagination and filters
  async getAllOrders(
    filters: AdminOrderFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ orders: AdminOrderSummary[]; total: number; hasMore: boolean }> {
    try {
      console.log('🔍 Checking admin access...');
      const isAdmin = await this.verifyAdminAccess();
      if (!isAdmin) {
        console.error('❌ Admin access denied');
        throw new Error('Admin access required');
      }
      console.log('✅ Admin access verified');

      console.log('📊 Fetching orders from database...');
      
      // Use direct query - RLS should be disabled
      const adminClient = this.getAdminClient();
      
      let query = adminClient
        .from('orders')
        .select(`
          id,
          client_id,
          dealer_id,
          status,
          proposed_price,
          agreed_price,
          scheduled_date,
          created_at,
          updated_at
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Database query failed:', error);
        throw error;
      }

      console.log(`📋 Found ${data?.length || 0} orders in database`);

      // Fetch client and dealer information separately
      const clientIds = [...new Set((data || []).map(row => row.client_id).filter(Boolean))];
      const dealerIds = [...new Set((data || []).map(row => row.dealer_id).filter(Boolean))];

      console.log(`👥 Fetching info for ${clientIds.length} clients and ${dealerIds.length} dealers...`);

      let clients: any[] = [];
      let dealers: any[] = [];
      let dealerProfiles: any[] = [];

      // Fetch client names and emails
      if (clientIds.length > 0) {
        const { data: clientData } = await adminClient
          .from('profiles')
          .select('id, name, email')
          .in('id', clientIds);
        clients = clientData || [];
      }

      // Fetch dealer names and emails
      if (dealerIds.length > 0) {
        const { data: dealerData } = await adminClient
          .from('dealer_profiles')
          .select('id, business_name')
          .in('id', dealerIds);
        dealers = dealerData || [];

        // Get dealer emails from profiles
        const { data: dealerProfileData } = await adminClient
          .from('profiles')
          .select('id, email')
          .in('id', dealerIds);
        dealerProfiles = dealerProfileData || [];
      }

      // Create lookup maps
      const clientMap = new Map((clients || []).map(c => [c.id, c]));
      const dealerMap = new Map((dealers || []).map(d => [d.id, d]));
      const dealerEmailMap = new Map((dealerProfiles || []).map(p => [p.id, p.email]));

      const orders: AdminOrderSummary[] = (data || []).map((row: any) => {
        const client = clientMap.get(row.client_id);
        const dealer = dealerMap.get(row.dealer_id);
        const dealerEmail = dealerEmailMap.get(row.dealer_id);

        return {
          id: row.id,
          clientName: client?.name || 'Unknown Client',
          clientEmail: client?.email || '',
          detailerName: dealer?.business_name || 'Unknown Detailer',
          detailerEmail: dealerEmail || '',
          bookingStatus: row.status || 'pending', // Use legacy status field
          paymentStatus: 'pending', // Default since payment system not yet implemented
          proposedDate: row.scheduled_date,
          agreedDate: row.scheduled_date,
          totalAmount: row.proposed_price || 0, // Use proposed_price as total
          proposedPrice: row.proposed_price,
          agreedPrice: row.agreed_price,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          hasDispute: false // No dispute system yet in current schema
        };
      });

      // Apply search filter after fetching all data
      let filteredOrders = orders;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredOrders = orders.filter(order => 
          order.clientName.toLowerCase().includes(searchTerm) ||
          order.detailerName.toLowerCase().includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm)
        );
      }

      return {
        orders: filteredOrders,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('Failed to get admin orders:', error);
      throw error;
    }
  }

  // Get detailed order information
  async getOrderDetails(orderId: string): Promise<AdminOrderDetails | null> {
    try {
      const isAdmin = await this.verifyAdminAccess();
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      // Use direct query - RLS should be disabled
      const { data: order, error } = await this.getAdminClient()
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Fetch client information
      let client = null;
      if (order.client_id) {
        const { data: clientData } = await this.getAdminClient()
          .from('profiles')
          .select('name, email')
          .eq('id', order.client_id)
          .maybeSingle();
        client = clientData;
      }

      // Fetch dealer information
      let dealer = null;
      let dealerProfile = null;
      if (order.dealer_id) {
        const { data: dealerData } = await this.getAdminClient()
          .from('dealer_profiles')
          .select('business_name')
          .eq('id', order.dealer_id)
          .maybeSingle();
        dealer = dealerData;

        // Fetch dealer email
        const { data: dealerProfileData } = await this.getAdminClient()
          .from('profiles')
          .select('email')
          .eq('id', order.dealer_id)
          .maybeSingle();
        dealerProfile = dealerProfileData;
      }

      // Fetch order services
      const { data: services } = await this.getAdminClient()
        .from('order_services')
        .select('id, service_name, price_at_order')
        .eq('order_id', orderId);

      return {
        id: order.id,
        clientId: order.client_id,
        dealerId: order.dealer_id,
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        detailerName: dealer?.business_name || 'Unknown Detailer',
        detailerEmail: dealerProfile?.email || '',
        bookingStatus: order.status || 'pending', // Use legacy status
        paymentStatus: 'pending', // Default since payment system not implemented
        proposedDate: order.scheduled_date,
        agreedDate: order.scheduled_date,
        totalAmount: order.proposed_price || 0, // Use proposed_price as total
        proposedPrice: order.proposed_price,
        agreedPrice: order.agreed_price,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        notes: order.notes,
        scheduledDate: order.scheduled_date,
        paymentIntentId: undefined, // Not implemented yet
        releasedAmount: 0, // Not implemented yet
        remainingAmount: 0, // Not implemented yet
        serviceCompletedAt: undefined, // Not implemented yet
        autoReleaseAt: undefined, // Not implemented yet
        disputeId: undefined, // Not implemented yet
        hasDispute: false, // Not implemented yet
        services: (services || []).map((service: any) => ({
          id: service.id,
          serviceName: service.service_name,
          priceAtOrder: service.price_at_order
        }))
      };
    } catch (error) {
      console.error('Failed to get order details:', error);
      return null;
    }
  }

  // Update order status (admin action)
  async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isAdmin = await this.verifyAdminAccess();
      if (!isAdmin) {
        return { success: false, error: 'Admin access required' };
      }

      const updateData: any = {};
      
      // For now, just update the legacy status field
      // When payment system is implemented, this will handle both booking_status and payment_status
      const validStatuses = ['pending', 'countered', 'accepted', 'rejected', 'paid', 'in_progress', 'completed'];
      
      if (validStatuses.includes(status)) {
        updateData.status = status;
      } else {
        // Map new status values to legacy ones
        switch (status) {
          case 'cancelled':
            updateData.status = 'rejected';
            break;
          case 'awaiting_client_confirmation':
            updateData.status = 'in_progress';
            break;
          case 'dispute_open':
            updateData.status = 'in_progress';
            break;
          default:
            updateData.status = status;
        }
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await this.getAdminClient()
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to update order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      };
    }
  }

  // Get order statistics for dashboard
  async getOrderStatistics(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    disputed: number;
    totalRevenue: number;
  }> {
    try {
      const isAdmin = await this.verifyAdminAccess();
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      // Use direct query - RLS should be disabled
      const { data, error } = await this.getAdminClient()
        .from('orders')
        .select('status, proposed_price');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        disputed: 0,
        totalRevenue: 0
      };

      data?.forEach(order => {
        const status = order.status;
        
        switch (status) {
          case 'pending':
            stats.pending++;
            break;
          case 'accepted':
            stats.accepted++;
            break;
          case 'completed':
            stats.completed++;
            break;
          // No dispute system yet, so disputed will remain 0
        }

        // Calculate revenue from completed orders
        if (order.proposed_price && status === 'completed') {
          stats.totalRevenue += order.proposed_price;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get order statistics:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        disputed: 0,
        totalRevenue: 0
      };
    }
  }

  // Cancel order (admin action)
  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAdmin = await this.verifyAdminAccess();
      if (!isAdmin) {
        return { success: false, error: 'Admin access required' };
      }

      const { error } = await this.getAdminClient()
        .from('orders')
        .update({
          status: 'rejected', // Use legacy status field
          notes: reason ? `Admin cancelled: ${reason}` : 'Admin cancelled'
        })
        .eq('id', orderId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order'
      };
    }
  }
}

// Export singleton instance
export const adminOrderService = new AdminOrderManagementService();