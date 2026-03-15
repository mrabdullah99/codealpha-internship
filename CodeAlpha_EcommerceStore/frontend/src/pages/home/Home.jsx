import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/hero/Hero";
import HomeProducts from "../../components/homeProducts/HomeProducts";
import FeatureProducts from "../../components/featureProducts/FeatureProducts";
import Banner from "../../components/banner/Banner";
import NewsLetter from "../../components/newsLetter/NewsLetter";

const Home = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Hero />
      <HomeProducts />
      <FeatureProducts />
      <Banner />
      <NewsLetter />
    </div>
  );
};

export default Home;
