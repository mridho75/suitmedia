import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const menu = [
  { name: 'Work', href: '/work' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Ideas', href: '/ideas' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

export default function Header({ active }: { active: string }) {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [transparent, setTransparent] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (currentScroll > lastScroll && currentScroll > 80) {
            setShow(false);
          } else {
            setShow(true);
          }
          setTransparent(currentScroll < 80);
          setLastScroll(currentScroll);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <header
      className={
        'header ' +
        (show ? 'headerVisible' : 'headerHidden') +
        (transparent ? ' headerTransparent' : '')
      }
      data-show={show}
      data-transparent={transparent}
    >
      <nav className="nav">
        <div className="logo">
          <Image src="/logo.png" alt="Suitmedia Logo" width={56} height={56} />
        </div>
        <ul className="menu">
          {menu.map((item) => (
            <li key={item.name} className={active === item.name ? 'active' : ''}>
              <Link href={item.href}>{item.name}</Link>
              {active === item.name && <div className="menuUnderline" />}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
