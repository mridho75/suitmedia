// 'use client'; // Removed as per the requirement

// IdeasPage component: main page for displaying ideas list with header and banner

import { Suspense } from "react";
import Header from '../../components/Header';
import Banner from '../../components/Banner';
import IdeasList from '../../components/IdeasList';
import '../../app/globals.css';


 export default function IdeasPage() {
  // Extract query params for SSR hydration
  return (
    <main className="main">
      {/* Header with active menu item */}
      <Header active="Ideas" />
      {/* Banner section with dynamic image, title, and subtitle */}
      <div className="bannerWrapper">
        <Banner
          imageUrl="/globe.svg"
          title="Ideas"
          subtitle="Where all our great things begin"
        />
      </div>
      {/* Content section with ideas list */}
      <section className="contentSection">
        <Suspense fallback={<div>Loading...</div>}>
          <IdeasList />
        </Suspense>
      </section>
    </main>
  );
}
