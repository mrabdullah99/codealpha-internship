import Footer from "../components/footer/Footer";
import Navbar from "../components/navbar/Navbar";
import ChatBot from "../components/chatbot/ChatBot";

import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="flex justify-center px-5 ">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};
export default MainLayout;
