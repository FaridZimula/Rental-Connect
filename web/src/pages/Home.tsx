import HeroSection from '../components/features/home/HeroSection';
import FeaturesSection from '../components/features/home/FeaturesSection';
import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout hideFader>
      <HeroSection />
      <FeaturesSection />
    </Layout>
  );
};

export default Home;