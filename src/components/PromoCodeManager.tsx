// Promo Code Management Component
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Copy, Edit, Trash2, Plus, Users, Percent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PromoCodeService, PromoCode, CreatePromoCodeData } from '../services/promoCodeService';
import { toast } from 'sonner';

interface PromoCodeManagerProps {
  dealerId?: string;
}

export const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({ dealerId }) => {
  const { currentUser } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'public' as 'public' | 'private',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    expiration_date: '',
    is_active: true,
    max_uses: undefined as number | undefined
  });

  const effectiveDealerId = dealerId || currentUser?.id;

  useEffect(() => {
    if (effectiveDealerId) {
      loadPromoCodes();
    }
  }, [effectiveDealerId]);

  const loadPromoCodes = async () => {
    if (!effectiveDealerId) return;
    
    try {
      const codes = await PromoCodeService.getPromoCodesByDealer(effectiveDealerId);
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Failed to load promo codes');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'public',
      discount_type: 'percentage',
      discount_value: 10,
      expiration_date: '',
      is_active: true,
      max_uses: undefined
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingCode(null);
    setShowCreateModal(true);
  };

  const handleEdit = (code: PromoCode) => {
    setFormData({
      code: code.code,
      type: code.type,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      expiration_date: code.expiration_date ? code.expiration_date.split('T')[0] : '',
      is_active: code.is_active,
      max_uses: code.max_uses
    });
    setEditingCode(code);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!effectiveDealerId) return;
    
    setLoading(true);
    try {
      const promoData: CreatePromoCodeData = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        expiration_date: formData.expiration_date || undefined,
        is_active: formData.is_active,
        max_uses: formData.max_uses
      };

      let result;
      if (editingCode) {
        result = await PromoCodeService.updatePromoCode(editingCode.id, promoData);
      } else {
        result = await PromoCodeService.createPromoCode(effectiveDealerId, promoData);
      }

      if (result.success) {
        toast.success(editingCode ? 'Promo code updated!' : 'Promo code created!');
        setShowCreateModal(false);
        resetForm();
        loadPromoCodes(); // Reload the list
      } else {
        toast.error(result.error || 'Failed to save promo code');
      }
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error('Failed to save promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      const result = await PromoCodeService.deletePromoCode(codeId);
      if (result.success) {
        toast.success('Promo code deleted!');
        loadPromoCodes(); // Reload the list
      } else {
        toast.error(result.error || 'Failed to delete promo code');
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (code: PromoCode) => {
    if (!code.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (code.expiration_date && new Date(code.expiration_date) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (code.max_uses && code.usage_count >= code.max_uses) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promo Codes</h2>
          <p className="text-gray-600">Create and manage discount codes for your customers</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Promo Code
        </Button>
      </div>

      <div className="grid gap-4">
        {promoCodes.map((code) => (
          <Card key={code.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-lg font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                        {code.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {code.discount_value}{code.discount_type === 'percentage' ? '%' : '$'} off
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {code.usage_count}{code.max_uses ? `/${code.max_uses}` : ''} uses
                      </span>
                      {code.expiration_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires {formatDate(code.expiration_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(code)}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(code)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Created: {formatDate(code.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {promoCodes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No promo codes yet</h3>
              <p className="text-gray-600 mb-4">Create your first discount code to attract customers</p>
              <Button onClick={handleCreate}>Create Promo Code</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Edit Promo Code' : 'Create New Promo Code'}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Create a discount code for your customers
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Promo Code *</Label>
              <Input
                id="code"
                placeholder="e.g., WASH10"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'public' | 'private') => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can use</SelectItem>
                  <SelectItem value="private">Private - Invitation only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => 
                  setFormData(prev => ({ ...prev, discount_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">
                  {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount'} *
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  placeholder={formData.discount_type === 'percentage' ? '10' : '25'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_value: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiration_date">Expiration Date (optional)</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="max_uses">Maximum Uses (optional)</Label>
              <Input
                id="max_uses"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.max_uses || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_uses: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_active">Active (customers can use this code)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.code}>
              {loading ? 'Saving...' : editingCode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};