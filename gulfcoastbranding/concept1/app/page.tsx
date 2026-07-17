const services = [
  { number: "01", title: "Apparel & Headwear", copy: "Polos, tees, uniforms, jackets, and embroidered caps chosen for how your team actually works.", tags: ["Embroidery", "Screen print", "Team wear"] },
  { number: "02", title: "Promotional Products", copy: "Useful, memorable merchandise that keeps your name in the right hands long after the event ends.", tags: ["Drinkware", "Bags", "Giveaways"] },
  { number: "03", title: "Signs & Displays", copy: "Banners, event displays, and branded environments that help your business show up with confidence.", tags: ["Banners", "Displays", "Event graphics"] },
  { number: "04", title: "Awards & Recognition", copy: "Thoughtful awards and presentation pieces that give milestones the weight they deserve.", tags: ["Awards", "Plaques", "Employee gifts"] },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Gulf Coast Branding home"><img src="/gcb-logo-transparent.png" alt="Gulf Coast Branding" /></a>
        <nav aria-label="Main navigation"><a href="#services">What we do</a><a href="#approach">Our approach</a><a href="#contact">Contact</a></nav>
        <a className="button button-small" href="#contact">Get a quote <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Promotional products · Apparel · Signage</p>
          <h1>Make your brand<br /><em>worth remembering.</em></h1>
          <p className="hero-intro">Smart product choices. Thoughtful design. Reliable delivery. We make it easier to put your brand on things people will be proud to use.</p>
          <div className="hero-actions"><a className="button" href="#contact">Start a project <span>↗</span></a><a className="text-link" href="#services">See what we do <span>↓</span></a></div>
          <div className="proof-line"><strong>BRANDED FOR SUCCESS.</strong><span>Serving businesses, teams, events, and organizations.</span></div>
        </div>
        <div className="hero-image"><img src="/hero-products.png" alt="A curated collection of Gulf Coast Branding apparel, drinkware, bags, and awards" /><div className="image-label"><b>One partner.</b><span>More ways to show up.</span></div></div>
      </section>

      <div className="category-strip"><span>APPAREL</span><i>✦</i><span>DRINKWARE</span><i>✦</i><span>SIGNAGE</span><i>✦</i><span>EVENTS</span><i>✦</i><span>RECOGNITION</span></div>

      <section className="section services" id="services">
        <div className="section-heading"><div><p className="eyebrow"><span /> What we do</p><h2>Built to be used.<br /><em>Designed to be seen.</em></h2></div><p>We help you choose the right product, decoration, and presentation for the job—then manage the details from proof to delivery.</p></div>
        <div className="service-list">{services.map(service => <article key={service.number}><div className="service-number">{service.number}</div><div><h3>{service.title}</h3><p>{service.copy}</p></div><div className="tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href="#contact" aria-label={`Ask about ${service.title}`}>↗</a></article>)}</div>
      </section>

      <section className="approach" id="approach">
        <div className="approach-image"><img src="/brand-process.png" alt="Reviewing thread, color, and apparel samples for a branding project" /><div className="photo-note"><span>DETAILS MATTER</span><b>From thread color<br />to final delivery.</b></div></div>
        <div className="approach-copy"><p className="eyebrow light"><span /> A better way to source branded products</p><h2>Less catalog.<br /><em>More clarity.</em></h2><p>Thousands of products can technically carry a logo. Far fewer are right for your audience, budget, and moment. We narrow the field, recommend with purpose, and keep production moving.</p><div className="principles"><div><b>01</b><span><strong>Curated recommendations</strong>Options selected around your real goal—not a link to an endless catalog.</span></div><div><b>02</b><span><strong>Proof before production</strong>Artwork, placement, colors, and details are reviewed before anything gets made.</span></div><div><b>03</b><span><strong>One point of contact</strong>Clear communication from the first idea through the final box.</span></div></div></div>
      </section>

      <section className="project-types">
        <div className="section-heading compact"><div><p className="eyebrow"><span /> Where we fit</p><h2>One brand.<br /><em>Every moment.</em></h2></div><p>Build a consistent presence across the places your customers, employees, and community meet your brand.</p></div>
        <div className="type-grid"><article><small>01</small><h3>Equip the team</h3><p>Uniforms, polos, hats, and gear that make everyone feel part of the same brand.</p></article><article><small>02</small><h3>Show up at events</h3><p>Displays, giveaways, bags, and apparel designed to work together—not compete.</p></article><article><small>03</small><h3>Thank the right people</h3><p>Client gifts, awards, and employee recognition that feel personal and considered.</p></article></div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-overlay" /><div className="contact-content"><p className="eyebrow light"><span /> Tell us what you’re working on</p><h2>Let’s put your<br /><em>brand to work.</em></h2><p>Share the idea, quantity, timing, and budget. We’ll help shape the right solution and make the next step clear.</p><a className="button button-light" href="mailto:info@gulfcoastbranding.com?subject=Project%20inquiry">Start your project <span>↗</span></a></div>
      </section>

      <footer><img src="/gcb-logo-transparent.png" alt="Gulf Coast Branding" /><p>Promotional products · Apparel · Signage · Brand solutions</p><div><a href="#services">What we do</a><a href="#approach">Approach</a><a href="#contact">Contact</a></div><p>© 2026 Gulf Coast Branding, LLC</p></footer>
    </main>
  );
}
