export type PublicPackage = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
};

export const fallbackPackages: PublicPackage[] = [
  {
    id: 'starter-website',
    name: 'Starter Website',
    description: 'A clean, responsive website for personal brands, small businesses, campaigns, and service launches.',
    features: ['Landing page or up to 4 key pages', 'Responsive interface', 'Contact links and inquiry form', 'Basic SEO setup'],
    price: 250000,
    currency: 'RWF',
  },
  {
    id: 'business-platform',
    name: 'Business Platform',
    description: 'A stronger web presence with structured content, dashboards, forms, and conversion-focused user flows.',
    features: ['Multi-page website or app shell', 'Database-backed forms', 'Admin-ready content structure', 'Deployment support'],
    price: 650000,
    currency: 'RWF',
  },
  {
    id: 'custom-product',
    name: 'Custom Product',
    description: 'A tailored platform for marketplaces, fintech tools, streaming concepts, booking systems, or internal software.',
    features: ['Product planning', 'Custom UI and workflows', 'Auth and data architecture', 'Launch and iteration support'],
    price: 1200000,
    currency: 'RWF',
  },
];

export function packageDatabaseId(id: string): string | undefined {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ? id
    : undefined;
}

export function formatPackagePrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'RWF' ? 0 : 2,
  }).format(price);
}
