import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X, Hexagon, Layers, Orbit, Sparkles, MoveUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryDialog } from '@/components/inquiry-dialog';
import sculptureImage from '@/assets/ascend-sculpture.jpg';

const Sculpture = lazy(() => import('@/components/sculpture'));

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Ascend — The next generation of Web3 brands' },
    { name: 'description', content: 'Ascend is a creative marketing agency for the decentralized world. Building brands, launching campaigns, and connecting Web3 communities.' },
    { property: 'og:title', content: 'Ascend — The next generation of Web3 brands' },
    { property: 'og:description', content: 'Creative strategy, meaningful communities, and ambitious ideas for the next generation of Web3.' },
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
    const onScroll = () => setScrolled(window.scrollY > 100);
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
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <a href="#home" className="brand" aria-label="Ascend home" onClick={() => setMenuOpen(false)}><BrandMark />Ascend.</a>
        <nav className="desktop-nav" aria-label="Main navigation">{['About', 'Clients', 'Contact'].map((item) => <a key={item} className="nav-link" href={`#${item.toLowerCase()}`} data-active={active === item.toLowerCase()}>{item}</a>)}</nav>
        <div className="header-contact">{cta()}</div>
        <Button className="mobile-toggle" variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X /> : <Menu />}</Button>
      </div>
    </header>
    {menuOpen && <nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation">{['About', 'Clients', 'Contact'].map((item, i) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}><span className="eyebrow">0{i + 1}</span> {item}<MoveUpRight className="inline ml-4 size-6" /></a>)}<div className="mt-8">{cta()}</div></nav>}
    <main>
      <section id="home" className="hero-section">
        <div className="page-enter"><div className="eyebrow">Independent minds. Limitless possibilities.</div>
          <h1 className="hero-title">Powering the <em>next<br />generation</em> of web3 brands.</h1>
          <div className="hero-actions">{cta()}<Button className="portfolio-button" variant="secondary" asChild><a href="#about">Learn More</a></Button></div>
        </div>
        <div className="hero-bottom section-container"><a href="#about" className="scroll-link">Scroll to explore<ArrowDown /></a><p className="hero-caption">We help bold ideas move forward.<br />Building brands and communities<br />for a decentralized tomorrow.</p></div>
      </section>
      <section id="about" className="agency-section section-container">
        <div className="agency-copy reveal"><div className="eyebrow">Our agency / 01</div><div className="section-rule" />
          <h2 className="editorial-copy">We specialize in marketing for the decentralized world. From launching token campaigns to building loyal communities, we connect Web3 projects with the audiences that matter most.</h2>
          <p className="agency-details">We’re strategists, storytellers, and digital natives. Bringing clarity to complex ideas and turning ambition into meaningful connections.</p>
          <div className="service-list"><span><Orbit />Brand strategy</span><span><Sparkles />Creative campaigns</span><span><Layers />Community growth</span></div>
        </div>
      </section>
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
      <section id="contact" className="contact-section section-container"><div className="reveal"><div className="eyebrow">The next chapter / 03</div><h2 className="section-title">Ready to <em>ascend</em> your<br />web3 project?</h2>{cta()}</div></section>
    </main>
    <footer className="footer"><div className="section-container">
      <div className="footer-top"><div><a href="#home" className="brand"><BrandMark />Ascend.</a><p className="footer-copy">Spark your next<br />marketing breakthrough.</p></div>
        <div className="footer-nav"><div className="footer-column"><span className="eyebrow">Explore</span><a href="#about">About</a><a href="#clients">Clients</a><a href="#contact">Contact</a></div><div className="footer-column"><span className="eyebrow">Connect</span><Button variant="link" className="h-auto p-0 justify-start text-xs" onClick={openContact}>Let’s talk <ArrowUpRight /></Button><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight /></a><a href="https://x.com/" target="_blank" rel="noopener noreferrer">X / Twitter<ArrowUpRight /></a></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ascend. All rights reserved.</span><span className="footer-status"><span className="status-dot" />Independent agency. Global perspective.</span><a href="#home" className="scroll-link">Back to top<ArrowUpRight /></a></div>
    </div></footer>
    <InquiryDialog open={contactOpen} onOpenChange={setContactOpen} />
  </div>;
}
