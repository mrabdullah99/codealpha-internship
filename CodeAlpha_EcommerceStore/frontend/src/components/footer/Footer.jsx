import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";

const Footer = () => {
  const linkSections = [
    {
      title: "PRODUCTS",
      links: [
        { text: "Earphones", path: "/", icon: null },
        { text: "Headphones", path: "/", icon: null },
        { text: "Smartphones", path: "/", icon: null },
        { text: "Laptops", path: "/", icon: null },
      ],
    },
    {
      title: "WEBSITE?",
      links: [
        { text: "Home", path: "/", icon: null },
        { text: "Privacy Policy", path: "/", icon: null },
        { text: "Become Plus Member", path: "/pricing", icon: null },
        { text: "Create Your Store", path: "/create-store", icon: null },
      ],
    },
    {
      title: "CONTACT",
      links: [
        { text: "+1-212-456-7890", path: "/", icon: MdEmail },
        { text: "contact@example.com", path: "/", icon: MdPhone },
        { text: "794 Francisco, 94102", path: "/", icon: MdLocationOn },
      ],
    },
  ];
  const socialIcons = [
    { icon: FaFacebook, link: "http://www.facebook.com" },
    { icon: FaInstagram, link: "http://www.instagram.com" },
    { icon: FaTwitter, link: "http://twitter.com" },
    { icon: FaLinkedin, link: "http://www.linkedin.com" },
  ];

  return (
    <footer>
      <div className="flex flex-col max-w-7xl mx-auto mt-10 mb-3 px-7 text-slate-500">
        <div className="flex flex-col md:flex-row  justify-between ">
          <div className=" flex flex-col items-start justify-start gap-3">
            <Link to="/" className="text-4xl font-semibold text-slate-700">
              <span className="text-blue-600">e</span>store
              <span className="text-blue-600">.</span>
            </Link>
            <p className="max-w-[410px] mt-6 text-sm ">
              Welcome to estore, your ultimate destination for the latest and
              smartest gadgets. From smartphones and smartwatches to essential
              accessories, we bring you the best in innovation — all in one
              place.
            </p>
            <div className="flex items-center gap-3 mt-3">
              {socialIcons.map((item, i) => (
                <Link
                  to={item.link}
                  key={i}
                  className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:scale-105 hover:border transition rounded-full"
                >
                  <item.icon />
                </Link>
              ))}
            </div>
          </div>
          <div className=" flex flex-wrap justify-between w-full md:w-[45%] gap-5 text-sm mt-10">
            {linkSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-medium text-slate-700 md:mb-5 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {link.icon && <link.icon />}
                      <Link
                        href={link.path}
                        className="hover:underline transition"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <hr className="text-slate-300" />
          <p className="py-2 text-sm text-slate-500 ">
            Copyright 2025 © estore All Right Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
