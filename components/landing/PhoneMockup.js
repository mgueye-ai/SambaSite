import Image from 'next/image';

export default function PhoneMockup() {
  return (
    <div className="lp-phone">
      <Image
        src="/phone.png"
        alt="Samba app — discover events, buy tickets, and manage your passes"
        width={788}
        height={1536}
        className="lp-phone-img"
        priority
      />
    </div>
  );
}
