"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/sessions", label: "Session Log" },
  { href: "/attendance", label: "Attendance" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1 whitespace-nowrap">
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "text-ink-soft hover:bg-card hover:text-navy"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
