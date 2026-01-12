import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const pixelateKeyframes = `@keyframes pixelate {
  0% { filter: none; }
  50% { filter: pixelate(6px); }
  100% { filter: none; }
}`;

const Footer = () => {
  const navigation = {
    product: [
      { name: "Overview", href: "#" },
      { name: "Features", href: "#" },
      { name: "Solutions", href: "#" },
      { name: "Pricing", href: "#" },
    ],
    solutions: [
      { name: "Enterprise", href: "#" },
      { name: "Small Business", href: "#" },
      { name: "Startups", href: "#" },
      { name: "Teams", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "Guides", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Support Center", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Partners", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
    social: [
      {
        name: "Facebook",
        href: "#",
        icon: FaFacebookF,
      },
      {
        name: "Twitter",
        href: "#",
        icon: FaTwitter,
      },
      {
        name: "LinkedIn",
        href: "#",
        icon: FaLinkedinIn,
      },
      {
        name: "Instagram",
        href: "#",
        icon: FaInstagram,
      },
    ],
  };
  return (
    <footer
      className="z-50 w-full bg-gray-200 dark:bg-gray-800"
      aria-labelledby="footer-heading"
    >
      <style>{pixelateKeyframes}</style>
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <img
              className="h-10"
              src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3"
              alt="Company logo"
            />
            <p className="cursor-pointer text-base text-gray-600 hover:animate-[pixelate_0.5s_ease-in-out] dark:text-gray-400">
              Making the world a better place through innovative AI solutions.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-400"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-200">
                  Product
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-base text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-200">
                  Solutions
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-base text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-200">
                  Resources
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-base text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-200">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-base text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex space-x-6 md:order-2">
              {navigation.legal.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm text-gray-600 transition-colors duration-300 hover:text-gray-300 dark:text-gray-300"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <p className="mt-8 cursor-pointer text-base text-gray-600 hover:animate-[pixelate_0.5s_ease-in-out] md:order-1 md:mt-0 dark:text-gray-300">
              © {new Date().getFullYear()} Your Company, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
