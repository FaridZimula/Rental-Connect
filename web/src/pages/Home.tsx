import React from 'react';
import HeroSection from '../components/features/home/HeroSection';
import UniversitySection from '../components/features/home/UniversitySection';
import FeaturesSection from '../components/features/home/FeaturesSection';
import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout hideFader>
      <HeroSection />
      <UniversitySection />
      <FeaturesSection />
    </Layout>
  );
};

export default Home;