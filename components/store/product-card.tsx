'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const [hasImageError, setHasImageError] = useState(false);
  const image = product.images?.[0] ?? product.imageUrl ?? product.image ?? '';
  const canShowImage = Boolean(image) && !hasImageError;
  const price = Number(product.price ?? 0);
  const comparePrice = Number(product.comparePrice ?? 0);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  useEffect(() => {
    setHasImageError(false);
  }, [image]);

  return (
    <article className='overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900'>
      <Link href={product.slug ? `/products/${product.slug}` : '#'} className='relative block h-56 bg-amber-50'>
        {canShowImage ? (
          <img src={image} alt={product.name} className='h-full w-full object-cover' onError={() => setHasImageError(true)} />
        ) : (
          <div className='flex h-full flex-col items-center justify-center text-center'>
            <div className='rounded-full border-4 border-amber-300 bg-white px-5 py-4 shadow-sm'>
              <p className='text-lg font-black text-amber-700'>Göçmen</p>
              <p className='text-xs font-bold tracking-[0.25em] text-zinc-500'>KIRTASİYE</p>
            </div>
            <p className='mt-3 text-sm font-semibold text-zinc-500'>Ürün resmi hazırlanıyor</p>
          </div>
        )}
        {discount > 0 && <span className='absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white'>%{discount} indirim</span>}
      </Link>
      <div className='space-y-3 p-4'>
        <p className='text-xs font-bold uppercase tracking-wide text-amber-600'>{product.category?.name ?? product.categoryName ?? 'Kırtasiye'}</p>
        <h3 className='line-clamp-2 min-h-12 font-black text-zinc-900 dark:text-white'>{product.name}</h3>
        <div className='flex items-end gap-2'>
          <span className='text-2xl font-black text-zinc-950 dark:text-white'>₺{price.toLocaleString('tr-TR')}</span>
          {comparePrice > price && <span className='text-sm text-zinc-400 line-through'>₺{comparePrice.toLocaleString('tr-TR')}</span>}
        </div>
        <button
          onClick={() => addItem({ id: product.id, name: product.name, price, image: canShowImage ? image : '', quantity: 1, shippingCost: Number(product.shippingCost ?? 0), freeShipping: Boolean(product.freeShipping) })}
          className='flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 font-black text-white dark:bg-white dark:text-zinc-950'
        >
          <ShoppingCart className='h-4 w-4' /> Sepete ekle
        </button>
      </div>
    </article>
  );
}
