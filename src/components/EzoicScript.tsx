"use client";

import Script from "next/script";

export default function EzoicScript({ ezoicId }: { ezoicId: string }) {
  if (!ezoicId) return null;

  return (
    <>
      <Script
        id="ezoic-privacy"
        strategy="afterInteractive"
        src="https://cmp.gatekeeperconsent.com/min.js"
        data-cfasync="false"
      />
      <Script
        id="ezoic-privacy-cmp"
        strategy="afterInteractive"
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        data-cfasync="false"
      />
      <Script
        id="ezoic-script"
        strategy="afterInteractive"
        src="//www.ezojs.com/ezoic/sa.min.js"
      />
      <Script id="ezoic-init" strategy="afterInteractive">
        {`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}
      </Script>
    </>
  );
}
