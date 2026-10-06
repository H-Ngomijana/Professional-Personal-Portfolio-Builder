import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X, Hexagon, Layers, MoveUpRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryDialog } from '@/components/inquiry-dialog';
import { PersonalAbout, PersonalPortfolio } from '@/components/personal-portfolio';
import { portfolioSections, shouldDockNavigation } from '@/lib/portfolio-navigation';
import sculptureImage from '@/assets/ascend-sculpture.jpg';

const Sculpture = lazy(() => import('@/components/sculpture'));

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Ascend — Creative Developer & Design Portfolio' },
    { name: 'description', content: 'A personal portfolio at the intersection of design and code. Explore featured projects, a creative technology toolkit, and notes on digital craft.' },
    { property: 'og:title', content: 'Ascend — Creative Developer & Design Portfolio' },
    { property: 'og:description', content: 'Selected projects, creative development, and thoughts on design. A portfolio of considered digital experiences.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <path key={i} d="M20 3 L23 10 L20 14" stroke="currentColor" strokeWidth="1.2" transform={`rotate(${i * 30} 20 20)`} />)}</svg>;
}

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    const onScroll = () => setScrolled(shouldDockNavigation(window.scrollY));
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }), { threshold: .13 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id === 'home' ? '' : entry.target.id);
    }), { rootMargin: '-20% 0px -55% 0px' });
    document.querySelectorAll('main > section').forEach((element) => sectionObserver.observe(element));
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); sectionObserver.disconnect(); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', escape); };
  }, [menuOpen]);
  const openContact = () => { setMenuOpen(false); setContactOpen(true); };
  const cta = (label = 'Get in Touch') => <Button className="portfolio-button" onClick={openContact}>{label}<ArrowUpRight className="round-arrow" /></Button>;
  return <div className="site-shell">
    <div className={`scene-backdrop ${scrolled ? 'is-scrolled' : ''}`}>
      <img className="scene-image" src={sculptureImage} alt="" width={1536} height={1024} fetchPriority="high" />
      <ClientOnly><Suspense fallback={null}><Sculpture /></Suspense></ClientOnly>
    </div>
    <header className={`site-header ${scrolled && !menuOpen ? 'nav-away' : ''}`} inert={scrolled && !menuOpen}>
      <div className="header-inner">
        <a href="#home" className="brand" aria-label="Ascend home" onClick={() => setMenuOpen(false)}><BrandMark />Ascend.</a>
        <nav className="desktop-nav" aria-label="Main navigation">{portfolioSections.map(({ id, label }) => <a key={id} className="nav-link" href={`#${id}`} data-active={active === id} aria-current={active === id ? 'location' : undefined}>{label}</a>)}</nav>
        <div className="header-contact">{cta()}</div>
        <Button className="mobile-toggle" variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X /> : <Menu />}</Button>
      </div>
    </header>
    {menuOpen && <nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation">{portfolioSections.map(({ id, label }, i) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}><span className="eyebrow">0{i + 1}</span> {label}<MoveUpRight className="inline ml-4 size-6" /></a>)}<div className="mt-8">{cta()}</div></nav>}
    <nav className={`bottom-navigation ${scrolled && !menuOpen ? 'is-docked' : ''}`} aria-label="Portfolio navigation" inert={!scrolled || menuOpen}>
      <Button variant="ghost" size="icon" asChild className="dock-home"><a href="#home" aria-label="Back to top" title="Back to top"><Home /></a></Button>
      <div className="dock-links">{portfolioSections.map(({ id, label }) => <a key={id} href={`#${id}`} data-active={active === id} aria-current={active === id ? 'location' : undefined}>{label}</a>)}</div>
      <Button variant="ghost" size="icon" className="dock-contact" onClick={openContact} aria-label="Get in touch" title="Get in touch"><ArrowUpRight /></Button>
    </nav>
    <main>
      <section id="home" className="hero-section">
        <div className="page-enter"><div className="eyebrow">Design minded. Code driven.</div>
          <h1 className="hero-title">Ascend.<br /><em>Digital craft,</em><br />with a human touch.</h1>
          <div className="hero-actions"><Button className="portfolio-button" asChild><a href="#projects">Explore my work <ArrowUpRight className="round-arrow" /></a></Button>{cta('Let’s talk')}</div>
        </div>
        <div className="hero-bottom section-container"><a href="#about" className="scroll-link">Scroll to explore<ArrowDown /></a><p className="hero-caption">Design. Development. A little curiosity.<br />Thoughtful experiences, built<br />one detail at a time.</p></div>
      </section>
      <PersonalAbout />
      <PersonalPortfolio />
      <section id="clients" className="clients-section section-container">
        <div className="clients-layout">
          <div className="reveal"><div className="eyebrow">Clients / 02</div><h2 className="section-title"><em>Trusted</em> by Leading<br />Innovators in Web3.</h2>{cta('Get Started')}</div>
          <div className="reveal"><p className="clients-intro">We partner with forward-thinking startups, protocols, marketplaces, and innovative brands shaping the future of the internet. Whether you’re launching your first project or scaling globally, our clients rely on us to turn attention into adoption.</p>
            <div className="client-grid">
              <a className="client-tile" href="https://www.animocabrands.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Animoca Brands"><div className="animoca-logo">animoca<br /><span>BRANDS</span></div></a>
              <a className="client-tile" href="https://www.immutable.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Immutable"><div className="client-wordmark"><Hexagon />Immutable</div></a>
              <a className="client-tile" href="https://spintop.network/" target="_blank" rel="noopener noreferrer" aria-label="Visit Spintop"><div className="spintop-logo">spintop<span className="text-muted-foreground">.</span></div></a>
              <a className="client-tile" href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" aria-label="Visit Polygon"><div className="client-wordmark polygon-logo"><Layers />polygon</div></a>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="contact-section section-container"><div className="reveal"><div className="eyebrow">The next chapter / 06</div><h2 className="section-title">Have something<br /><em>in mind?</em></h2>{cta('Let’s make it happen')}</div></section>
    </main>
    <footer className="footer"><div className="section-container">
      <div className="footer-top"><div><a href="#home" className="brand"><BrandMark />Ascend.</a><p className="footer-copy">Good ideas deserve<br />a thoughtful execution.</p></div>
        <div className="footer-nav"><div className="footer-column"><span className="eyebrow">Explore</span>{portfolioSections.map(({ id, label }) => <a href={`#${id}`} key={id}>{label}</a>)}</div><div className="footer-column"><span className="eyebrow">Connect</span><Button variant="link" className="h-auto p-0 justify-start text-xs" onClick={openContact}>Let’s talk <ArrowUpRight /></Button><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight /></a><a href="https://x.com/" target="_blank" rel="noopener noreferrer">X / Twitter<ArrowUpRight /></a></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ascend. All rights reserved.</span><span className="footer-status">Design &amp; development. With intention.</span><a href="#home" className="scroll-link">Back to top<ArrowUpRight /></a></div>
    </div></footer>
    <InquiryDialog open={contactOpen} onOpenChange={setContactOpen} />
  </div>;
}
