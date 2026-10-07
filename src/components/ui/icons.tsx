import type { SVGProps } from "react";

// Small inline icon set (24px grid, 1.75 stroke). Inline SVG keeps the
// bundle free of an icon library.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (d: React.ReactNode) =>
  function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {d}
      </svg>
    );
  };

const fill = (d: string, viewBox = "0 0 24 24") =>
  function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg width={size} height={size} viewBox={viewBox} fill="currentColor" aria-hidden="true" focusable="false" {...props}>
        <path d={d} />
      </svg>
    );
  };

// Arrows point "forward" in reading direction; add className="flip-rtl" to mirror.
export const ArrowIcon = stroke(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
export const ArrowUpRightIcon = stroke(<><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>);
export const ChevronDownIcon = stroke(<path d="m6 9 6 6 6-6" />);
export const ChevronIcon = stroke(<path d="m9 6 6 6-6 6" />);
export const MenuIcon = stroke(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></>);
export const CloseIcon = stroke(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>);
export const PlusIcon = stroke(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const MinusIcon = stroke(<path d="M5 12h14" />);
export const CheckIcon = stroke(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const MailIcon = stroke(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>);
export const PhoneIcon = stroke(<path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />);
export const MapPinIcon = stroke(<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>);
export const ClockIcon = stroke(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const GlobeIcon = stroke(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>);
export const PlayIcon = fill("M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z");
export const PauseIcon = fill("M7 5h3.5v14H7zM13.5 5H17v14h-3.5z");
export const StarIcon = fill("m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z");
export const SearchIcon = stroke(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const ExternalIcon = stroke(<><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>);
export const QuoteIcon = fill("M9.6 6C6 7.6 4 10.4 4 14.2V18h6v-6H7.3c.2-2.1 1.4-3.6 3.4-4.6L9.6 6Zm9 0C15 7.6 13 10.4 13 14.2V18h6v-6h-2.7c.2-2.1 1.4-3.6 3.4-4.6L18.6 6Z");

// Admin
export const GridIcon = stroke(<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>);
export const InboxIcon = stroke(<><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.5 5h13L21 13v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z" /></>);
export const FolderIcon = stroke(<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />);
export const LayersIcon = stroke(<><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></>);
export const QuoteOutlineIcon = stroke(<><path d="M4 6h16v10H9l-5 4Z" /></>);
export const UsersIcon = stroke(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>);
export const BuildingIcon = stroke(<><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" /></>);
export const FileTextIcon = stroke(<><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z" /><path d="M14 3v5h5" /><path d="M8.5 13h7M8.5 16.5h5" /></>);
export const HelpIcon = stroke(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5" /><path d="M12 17h.01" /></>);
export const ShareIcon = stroke(<><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4" /></>);
export const ImageIcon = stroke(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9.5" r="1.75" /><path d="m21 16-5-5-9 9" /></>);
export const VideoIcon = stroke(<><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>);
export const SettingsIcon = stroke(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>);
export const LogoutIcon = stroke(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="m10 17-5-5 5-5" /><path d="M5 12h11" /></>);
export const TrashIcon = stroke(<><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /></>);
export const EditIcon = stroke(<><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>);
export const EyeIcon = stroke(<><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></>);
export const EyeOffIcon = stroke(<><path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-2.9 3.8M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 19 12 19a9.4 9.4 0 0 0 4.4-1.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>);
export const GripIcon = stroke(<><circle cx="9" cy="6" r=".8" /><circle cx="15" cy="6" r=".8" /><circle cx="9" cy="12" r=".8" /><circle cx="15" cy="12" r=".8" /><circle cx="9" cy="18" r=".8" /><circle cx="15" cy="18" r=".8" /></>);
export const UploadIcon = stroke(<><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>);
export const BellIcon = stroke(<><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const ArrowUpIcon = stroke(<><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>);
export const ArrowDownIcon = stroke(<><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>);
export const CopyIcon = stroke(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>);
export const SparkIcon = stroke(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>);
export const AlertIcon = stroke(<><path d="M12 4 2.5 20h19Z" /><path d="M12 10v4.5" /><path d="M12 17.5h.01" /></>);
export const InfoIcon = stroke(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.5h.01" /></>);
export const TagIcon = stroke(<><path d="M3 12.6V4.5A1.5 1.5 0 0 1 4.5 3h8.1a1.5 1.5 0 0 1 1.1.4l6.9 7a1.5 1.5 0 0 1 0 2.1l-7.6 7.6a1.5 1.5 0 0 1-2.1 0l-7-6.9a1.5 1.5 0 0 1-.4-1.1Z" /><circle cx="8" cy="8" r="1.5" /></>);
export const ChartIcon = stroke(<><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>);
export const HomeIcon = stroke(<><path d="m3 11 9-7 9 7" /><path d="M5 9.5V20h14V9.5" /></>);

// Brand / social (filled glyphs)
export const WhatsAppIcon = fill(
  "M12.04 2a9.9 9.9 0 0 0-8.46 15.04L2.5 21.5l4.58-1.06A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.15 15.06l-.3-.18-2.72.63.65-2.64-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm-3.3 4.07c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.07 3.3 5.1 4.5 2.52.99 3.03.79 3.58.74.55-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.64-.93-2.24-.23-.53-.47-.54-.68-.55l-.58-.01Z",
);
export const FacebookIcon = fill("M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.45A21 21 0 0 0 14.27 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.8v3h2.6V21Z");
export const InstagramIcon = stroke(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></>);
export const TikTokIcon = fill("M16.6 3h-3.1v12.2a2.7 2.7 0 1 1-2.7-2.7c.27 0 .53.04.78.11V9.43a5.9 5.9 0 1 0 5.02 5.83V9.08a7.3 7.3 0 0 0 4.1 1.27V7.27A4.1 4.1 0 0 1 16.6 3Z");
export const LinkedInIcon = fill("M6.5 8.5H3.6V20h2.9ZM5.05 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20.4 13.3c0-3.1-1.66-4.98-4.33-4.98-1.54 0-2.6.84-3.02 1.62V8.5h-2.8V20h2.9v-5.7c0-1.5.28-2.97 2.15-2.97 1.84 0 1.86 1.73 1.86 3.06V20h2.9Z");
export const YouTubeIcon = fill("M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z");
export const XIcon = fill("M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77Zm-1.08 16.17h1.7L7.4 4.74H5.58Z");
export const BehanceIcon = fill("M8.8 11.4c.9-.45 1.4-1.14 1.4-2.2C10.2 7.1 8.66 6.5 6.9 6.5H2v11h5.05c1.9 0 3.65-.9 3.65-3.03 0-1.3-.62-2.27-1.9-2.66ZM4.3 8.3h2.15c.8 0 1.55.23 1.55 1.17 0 .87-.57 1.22-1.37 1.22H4.3Zm2.45 7.4H4.3v-3.03h2.5c1.02 0 1.66.42 1.66 1.5 0 1.06-.77 1.53-1.71 1.53ZM19.9 13.43c0-2.36-1.38-4.32-3.88-4.32-2.43 0-4.08 1.82-4.08 4.22 0 2.48 1.56 4.18 4.08 4.18 1.9 0 3.13-.86 3.73-2.68h-1.94c-.2.68-1.06 1.04-1.72 1.04-1.28 0-1.95-.75-1.95-2.02h5.73c.01-.14.03-.28.03-.42Zm-5.76-.98c.07-1.04.76-1.7 1.8-1.7 1.1 0 1.64.64 1.74 1.7ZM14.3 7h4.6v1.2h-4.6Z");
export const SnapchatIcon = stroke(<path d="M12 3.5c2.9 0 4.6 2.2 4.6 4.9v2.1l1.6-.5c.5-.1.9.5.4.9-.6.5-1.5.8-2.1 1 .6 1.6 1.9 3 3.4 3.4.4.1.4.7 0 .9-.6.3-1.4.4-2 .5l-.3 1.2c-1-.2-2-.2-2.9.2-.8.4-1.6 1.4-2.7 1.4s-1.9-1-2.7-1.4c-.9-.4-1.9-.4-2.9-.2l-.3-1.2c-.6-.1-1.4-.2-2-.5-.4-.2-.4-.8 0-.9 1.5-.4 2.8-1.8 3.4-3.4-.6-.2-1.5-.5-2.1-1-.5-.4-.1-1 .4-.9l1.6.5V8.4c0-2.7 1.7-4.9 4.6-4.9Z" />);
export const ThreadsIcon = stroke(<><path d="M16.5 11.3c-.4-2.5-2-3.8-4.4-3.8-2.7 0-4.3 2-4.3 4.5S9.4 16.5 12 16.5c2.3 0 3.6-1.3 3.6-3 0-2.5-3.6-2.9-5.2-1.6" /><path d="M12 21c5 0 8.5-3.5 8.5-9S17 3 12 3 3.5 6.5 3.5 12 7 21 12 21Z" /></>);

export const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  behance: BehanceIcon,
  snapchat: SnapchatIcon,
  threads: ThreadsIcon,
} as const;
