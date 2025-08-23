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

  const baseButtonStyle = 'w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors duration-200';

  return (
    <footer className="bg-white text-black border-t border-gray-200 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-4 gap-4">
        <div className="text-center md:text-left text-gray-700">
          {env.siteName} &copy; {new Date().getFullYear()}
        </div>

        <div className="flex gap-3 text-lg">
          <Tooltip title="Discord">
            <a
              href="http://discord.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faDiscord} />
            </a>
          </Tooltip>

          <Tooltip title="Twitch">
            <a
              href="http://twitch.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faTwitch} />
            </a>
          </Tooltip>

          <Tooltip title="Facebook">
            <a
              href="http://facebook.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
          </Tooltip>

          <Tooltip title="YouTube">
            <a
              href="http://youtube.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </Tooltip>

          <Tooltip title="TikTok">
            <a
              href="http://tiktok.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faTiktok} />
            </a>
          </Tooltip>

          <Tooltip title="Instagram">
            <a
              href="http://instagram.boseriko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d]`}
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </Tooltip>
        </div>

        <Tooltip title="Back to Top">
          <button onClick={scrollToTop} className={`${baseButtonStyle} bg-[#f7b43d] hover:bg-[#e0a736] active:bg-[#c98f2d] cursor-pointer`}>
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </Tooltip>
      </div>
    </footer>
  );
};

export default Footer;
