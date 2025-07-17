import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const menu = [
  { name: 'Work', href: '' },
  { name: 'About', href: '' },
  { name: 'Services', href: '' },
  { name: 'Ideas', href: '/ideas' },
  { name: 'Careers', href: '' },
  { name: 'Contact', href: '' },
];

export default function Header({ active }: { active: string }) {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [transparent, setTransparent] = useState(true);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (currentScroll === 0) {
            setTransparent(false); 
            setShow(true);
          } else if (currentScroll > lastScroll && currentScroll > 80) {
            setShow(false);
            setTransparent(false); 
          } else {
            setShow(true);
            setTransparent(true); 
          }
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
          <Image src="/logo.png" alt="Suitmedia Logo" width={130} height={130} />
        </div>
        <ul className="menu">
          {menu.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={active === item.name ? 'active' : ''}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
