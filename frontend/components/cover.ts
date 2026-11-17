import type { SyntheticEvent } from 'react';

/** Capas horizontais (logos de Fortnite, 2XKO, Fallout) aparecem inteiras no quadro 3:4 em vez de cortadas. */
export const fitWideCover = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.naturalWidth > img.naturalHeight * 1.1) {
    img.style.objectFit = 'contain';
    img.style.padding = '12%';
  }
};
