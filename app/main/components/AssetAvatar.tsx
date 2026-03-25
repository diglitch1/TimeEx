'use client';

import Image from 'next/image';
import { getAssetLogo, hasAssetLogo } from '../utils/marketData';

export default function AssetAvatar({
    symbol,
    name,
    size,
    className,
    imageClassName = '',
    fallbackTextClassName = '',
}: {
    symbol: string;
    name?: string;
    size: number;
    className: string;
    imageClassName?: string;
    fallbackTextClassName?: string;
}) {
    const displaySymbol = symbol.toUpperCase();

    return (
        <div className={className}>
            {hasAssetLogo(displaySymbol) ? (
                <Image
                    src={getAssetLogo(displaySymbol)}
                    alt={`${name ?? displaySymbol} logo`}
                    width={size}
                    height={size}
                    className={imageClassName}
                />
            ) : (
                <span
                    className={`text-center font-semibold uppercase tracking-[0.16em] text-slate-600 ${fallbackTextClassName}`.trim()}
                >
                    {displaySymbol.slice(0, 4)}
                </span>
            )}
        </div>
    );
}
