import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-navy-900">
      <Image
        src="/logos/logo-white.png"
        alt="Statline"
        width={72}
        height={72}
        style={{ height: 72, width: "auto" }}
        priority
      />
    </div>
  );
}
