import { getSkipLinkAttrs } from "@/lib/a11y";

export default function SkipLink() {
  const attrs = getSkipLinkAttrs("#main-content");
  
  return (
    <a {...attrs}>
      Skip to main content
    </a>
  );
}
