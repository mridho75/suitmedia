import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import '../app/globals.css';

export default function Banner({ imageUrl, title, subtitle }: { imageUrl: string; title: string; subtitle: string }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (imageRef.current) {
        imageRef.current.style.transform = 'translateY(' + scrollY * 0.2 + 'px)';
      }
      if (textRef.current) {
        textRef.current.style.transform = 'translateY(' + scrollY * 0.08 + 'px)';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="banner">
      <div
        className="bannerImage"
        ref={imageRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Image
          src={imageUrl}
          alt="Banner"
          fill
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          priority
        />
      </div>
      <div className="bannerText" ref={textRef}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
