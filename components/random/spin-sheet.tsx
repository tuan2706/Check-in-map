'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RandomFiltersPanel } from '@/components/random/random-filters-panel';
import { SpinCyclingPreview } from '@/components/random/spin-cycling-preview';
import { ResultCard } from '@/components/random/result-card';
import { ConfettiBurst } from '@/components/random/confetti-burst';
import { ConvertSheet } from '@/components/wishlist/convert-sheet';
import { SpinHistoryStrip } from '@/components/random/spin-history-strip';
import { useRandomDiscovery } from '@/lib/hooks/use-random-discovery';
import { useCategories } from '@/lib/hooks/use-categories';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { Dices } from 'lucide-react';

interface SpinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpinSheet({ open, onOpenChange }: SpinSheetProps) {
  const { filters, setFilters, pool, poolSize, result, isSpinning, spin, reset } = useRandomDiscovery();
  const categories = useCategories();
  const wishlist = useWishlist();
  const [showConfetti, setShowConfetti] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const categoryEmojiById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.emoji;
    return map;
  }, [categories]);

  const categoryLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.label;
    return map;
  }, [categories]);

  const convertingItem = wishlist?.find((w) => w.id === convertingId) ?? null;

  async function handleSpin(excludeCurrent = false) {
    await spin(excludeCurrent);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎲 Hôm nay đi đâu?</DialogTitle>
          </DialogHeader>

          {isSpinning ? (
            <SpinCyclingPreview pool={pool} categoryEmojiById={categoryEmojiById} />
          ) : result ? (
            <ResultCard
              candidate={result.candidate}
              reasons={result.reasons}
              categoryEmoji={categoryEmojiById[result.candidate.categoryId]}
              categoryLabel={categoryLabelById[result.candidate.categoryId]}
              onRespin={() => handleSpin(true)}
              onMarkVisited={() => setConvertingId(result.candidate.id)}
            />
          ) : (
            <div className="space-y-6">
              <RandomFiltersPanel filters={filters} onChange={setFilters} poolSize={poolSize} />
              <SpinHistoryStrip />
              <Button
                className="w-full"
                size="lg"
                disabled={poolSize === 0}
                onClick={() => handleSpin(false)}
              >
                <Dices className="mr-2 h-5 w-5" />
                Quay số!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showConfetti && <ConfettiBurst />}

      <ConvertSheet
        item={convertingItem}
        onOpenChange={(o) => !o && setConvertingId(null)}
        onConverted={() => {
          setConvertingId(null);
          handleClose(false);
        }}
      />
    </>
  );
}
