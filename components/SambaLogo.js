import Image from 'next/image';

export default function SambaLogo({ size = 34, className = '' }) {
  return (
    <Image
      src="/logo.png"
      alt="Samba"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
