import { writable } from 'svelte/store';

export type Route = 'main' | 'about';
export const currentRoute = writable<Route>('main'); 