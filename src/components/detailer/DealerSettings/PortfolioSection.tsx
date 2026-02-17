import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { DealerImageManager } from '../DealerImageManager';
import { ImageIcon } from 'lucide-react';

interface PortfolioSectionProps {
  userId: string;
  onPortfolioChange?: (urls: string[]) => void;
}

export function PortfolioSection({ userId, onPortfolioChange }: PortfolioSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Portfolio Management
        </CardTitle>
        <CardDescription>
          Upload up to 5 images. Max 5MB each. JPG, JPEG, PNG only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DealerImageManager
          userId={userId}
          showPortfolio={true}
          onPortfolioChange={onPortfolioChange}
        />
      </CardContent>
    </Card>
  );
}
