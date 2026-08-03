import Link from "next/link";
import { Logo } from "@/components/brand/logo";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-black px-6 pt-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 pb-10 sm:grid-cols-3">
        <FooterColumn
          title="Product"
          links={[
            { label: "Rooms & Global", href: "#rooms" },
            { label: "How it works", href: "#how-it-works" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { label: "Sign in", href: "/login" },
            { label: "Get started", href: "/signup" },
          ]}
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            topfour.app
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-sm font-bold">topfour.app</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/50">
            topfour.app — create a group, predict with friends.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-white/10 py-6">
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} topfour.app
        </p>
      </div>
    </footer>
  );
}
