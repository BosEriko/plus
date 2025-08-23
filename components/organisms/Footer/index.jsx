import env from '@utilities/env';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-black">
      <div className="container mx-auto flex justify-between py-2 items-center">
        <div>{env.siteName} &copy; {new Date().getFullYear()}</div>
        <button
          onClick={scrollToTop}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Back to Top
        </button>
      </div>
    </footer>
  );
};

export default Footer;