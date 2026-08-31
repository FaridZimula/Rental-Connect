import HeroSection from '../components/features/home/HeroSection';
import CategoriesCircleSection from '../components/features/home/CategoriesCircleSection';
import FeaturedPropertiesSection from '../components/features/home/FeaturedPropertiesSection';
import MidPromoBannerSection from '../components/features/home/MidPromoBannerSection';
import HotDealsSection from '../components/features/home/HotDealsSection';
import PricingSection from '../components/features/home/PricingSection';
import FeaturesSection from '../components/features/home/FeaturesSection';
import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout hideFader>
      <HeroSection />
      <CategoriesCircleSection />
      <FeaturedPropertiesSection />
      <MidPromoBannerSection />
      <HotDealsSection />
      <PricingSection />
      <FeaturesSection />
    </Layout>
  );
};

export default Home;