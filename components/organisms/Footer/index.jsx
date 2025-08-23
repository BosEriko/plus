'use client';

import env from '@utilities/env';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import {
  faDiscord,
  faTwitch,
  faFacebook,
  faYoutube,
  faTiktok,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import { Tooltip } from 'antd';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const baseButtonStyle =
    'w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-colors duration-200 shadow-sm';

  const socialLinks = [
    { icon: faDiscord, title: 'Discord', url: 'http://discord.boseriko.com/' },
    { icon: faTwitch, title: 'Twitch', url: 'http://twitch.boseriko.com/' },
    { icon: faFacebook, title: 'Facebook', url: 'http://facebook.boseriko.com/' },
    { icon: faYoutube, title: 'YouTube', url: 'http://youtube.boseriko.com/' },
    { icon: faTiktok, title: 'TikTok', url: 'http://tiktok.boseriko.com/' },
    { icon: faInstagram, title: 'Instagram', url: 'http://instagram.boseriko.com/' },
  ];

  return (
    <footer className="bg-white text-black border-t border-gray-200 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-4 md:px-6 gap-4">
        {/* Left Side - Branding */}
        <div className="text-center md:text-left text-sm sm:text-base text-gray-700 order-2 md:order-1">
          {env.siteName} &copy; {new Date().getFullYear()}
        </div>

        {/* Middle - Social Links */}
        <div className="flex flex-wrap justify-center gap-3 order-1 md:order-2">
          {socialLinks.map((social, index) => (
            <Tooltip key={index} title={social.title}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            </Tooltip>
          ))}
        </div>

        {/* Right Side - Back to Top */}
        <div className="order-3">
          <Tooltip title="Back to Top">
            <button
              onClick={scrollToTop}
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d] cursor-pointer`}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
          </Tooltip>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
