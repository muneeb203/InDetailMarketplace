import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface OrderSummaryItem {
  id: string;
  name: string;
  price: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  className?: string;
}

export function OrderSummary({ items, className = '' }: OrderSummaryProps) {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No services selected yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <span className="text-sm flex-1">{item.name}</span>
              <span className="text-sm font-medium ml-4">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
        </div>

        {/* Item Count */}
        <div className="text-sm text-gray-500 text-center">
          {items.length} {items.length === 1 ? 'service' : 'services'} selected
        </div>
      </CardContent>
    </Card>
  );
}
