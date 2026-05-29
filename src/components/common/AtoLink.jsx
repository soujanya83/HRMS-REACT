import React from "react";

/**
 * Clickable government / ATO URL — opens in new tab, pointer on hover.
 * @param {string} href - e.g. "ato.gov.au/tfn" or "https://ato.gov.au/tfn"
 */
const AtoLink = ({ href, children, className = "" }) => {
  const url = href.startsWith("http") ? href : `https://${href.replace(/^\/\//, "")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-bold cursor-pointer hover:underline hover:text-[#009FDA] ${className}`}
    >
      {children ?? href}
    </a>
  );
};

export default AtoLink;
