export function formatPrice(price: number): string {
  return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻',
  fashion: '👗',
  'home-living': '🏠',
  vehicles: '🚗',
  beauty: '💄',
  sports: '⚽',
  gaming: '🎮',
  collectibles: '🏆',
  appliances: '🔌',
  tools: '🔧',
  books: '📚',
  other: '📦',
};

export const PH_LOCATIONS = [
  { province: 'Metro Manila', cities: ['Quezon City', 'Manila', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Pasay', 'Marikina', 'San Juan'] },
  { province: 'Cavite', cities: ['Dasmarinas', 'Bacoor', 'Imus', 'Tagaytay', 'Trece Martires'] },
  { province: 'Laguna', cities: ['Calamba', 'San Pedro', 'Biñan', 'Santa Rosa', 'Los Baños'] },
  { province: 'Bulacan', cities: ['Meycauayan', 'San Jose del Monte', 'Malolos'] },
  { province: 'Rizal', cities: ['Antipolo', 'Cainta', 'Taytay'] },
  { province: 'Pampanga', cities: ['Angeles', 'San Fernando', 'Mabalacat'] },
  { province: 'Cebu', cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay'] },
  { province: 'Davao', cities: ['Davao City', 'Tagum', 'Panabo'] },
  { province: 'Iloilo', cities: ['Iloilo City', 'Passi'] },
  { province: 'Bacolod', cities: ['Bacolod City', 'Talisay'] },
  { province: 'Zamboanga', cities: ['Zamboanga City'] },
  { province: 'General Santos', cities: ['General Santos City'] },
  { province: 'Baguio', cities: ['Baguio City', 'La Trinidad'] },
  { province: 'Other', cities: ['Other'] },
];
