export default function ProfileAvatar({
  name,
  photo,
  className = "h-9 w-9",
}: {
  name: string;
  photo?: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (photo) {
    return <img src={photo} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-teal-800 text-xs font-semibold text-white ${className}`}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}
