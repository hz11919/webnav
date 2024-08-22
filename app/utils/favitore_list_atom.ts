// atoms.ts
import { atomWithStorage } from 'jotai/utils';
import { CardProps } from '~/libs/card-props';
import { FavoriteKey } from '~/libs/constants';

export const favitoreListAtom = atomWithStorage<CardProps[]>(FavoriteKey, []);

export const themeAtom = atomWithStorage<string>('theme', 'light');