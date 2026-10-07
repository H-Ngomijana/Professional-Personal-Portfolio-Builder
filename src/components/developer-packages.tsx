import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listPackages } from '@/lib/packages.functions';
export function DeveloperPackages({ onSelect }: { onSelect: (id?: string, name?: string) => void }) {
  const fetchPackages = useServerFn(listPackages);
  const { data = [], isPending, isError } = useQuery({ queryKey: ['public-packages'], queryFn: () => fetchPackages() });
  return <section id="packages" className="portfolio-band packages-section"><div className="section-container">
    <div className="section-heading reveal"><span className="eyebrow">From idea to launch / 05</span><span className="section-index">Work with me</span></div>
    <div className="portfolio-heading reveal"><h2 className="section-title">Your next <em>big thing.</em></h2><p>Websites with character.<br />Platforms built around your business.</p></div>
    {isPending ? <p role="status">Loading packages…</p> : isError ? <p role="alert">Packages are unavailable right now. Send me your project brief below.</p> : data.length ? <div className="package-grid">{data.map(item => <article className="package-item" key={item.id}><span className="eyebrow">Development package</span><h3>{item.name}</h3><p>{item.description}</p><div className="package-price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency, maximumFractionDigits: item.currency === 'RWF' ? 0 : 2 }).format(item.price)}</div><ul>{item.features.map(feature => <li key={feature}><Check />{feature}</li>)}</ul><Button onClick={() => onSelect(item.id, item.name)} className="portfolio-button">Request this package<ArrowUpRight /></Button></article>)}</div> : <div className="package-custom"><span className="eyebrow">Custom development</span><h3>Built for your ambition.</h3><p>Share your website or platform idea. Let’s find the right scope for your project.</p><Button className="portfolio-button" onClick={() => onSelect()}>Discuss my project<ArrowUpRight /></Button></div>}
  </div></section>;
}
