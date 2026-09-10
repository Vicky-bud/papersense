export function Logo({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 21V3h8a6 6 0 0 1 0 12H6" />
      <circle cx="14" cy="9" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
