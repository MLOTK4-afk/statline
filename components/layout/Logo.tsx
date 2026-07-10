import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** Rendered height in px. Width is derived automatically (square source art). */
  height?: number;
  /** Footer/dark-panel variant — bakes in the "Data. Performance. Opportunity." tagline. */
  withTagline?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Renders the Statline wordmark (helmet + "STATLINE"), white-on-transparent,
 * for use on dark navy backgrounds. Source files are square canvases, so
 * width == height keeps the real aspect ratio intact.
 */
export function Logo({
  height = 36,
  withTagline = false,
  className,
  priority = true,
}: LogoProps) {
  return (
    <Link href="/" className={className}>
      <Image
        src={withTagline ? "/logos/logo-white.png" : "/logos/logo-no-tagline.png"}
        alt="Statline"
        width={height}
        height={height}
        priority={priority}
      />
    </Link>
  );
}
