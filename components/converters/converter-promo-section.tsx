"use client"

import { ConversionType } from '@/types';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { AdPlaceholder } from '@/components/common/ad-placeholder';

interface ConverterPromoSectionProps {
  converterType: ConversionType;
}

export function ConverterPromoSection({ converterType }: ConverterPromoSectionProps) {
  return (
    <div>
      {getPromoComponent(converterType)}
    </div>
  );
}

function getPromoComponent(converterType: ConversionType) {
  switch (converterType) {
    case 'csv-to-json':
      return <LoveTestPromoCard />;
    case 'json-to-csv':
      return <MRRLeaderboardPromoCard />;
    case 'json-to-excel':
    case 'excel-to-json':
    default:
      return <AdPlaceholder variant="compact" />;
  }
}
