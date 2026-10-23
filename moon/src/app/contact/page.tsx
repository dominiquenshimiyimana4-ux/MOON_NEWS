import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Moon News newsroom.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
          Tips, corrections and questions — the newsroom is listening.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <ContactCard icon={<MapPin className="h-5 w-5" />} label="Newsroom" value="KG 7 Ave, Kigali, Rwanda" />
          <ContactCard icon={<Mail className="h-5 w-5" />} label="Email" value="newsroom@moonnews.rw" href="mailto:newsroom@moonnews.rw" />
          <ContactCard icon={<Phone className="h-5 w-5" />} label="Phone" value="+250 700 000 000" href="tel:+250700000000" />
          <div className="card p-5 text-sm text-[rgb(var(--text-muted))]">
            For secure tips, contact us via encrypted email. We protect our sources.
          </div>
        </div>
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="card flex items-start gap-3 p-5 transition-shadow hover:shadow-card-hover">
      <span className="text-brand-600">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">{inner}</a>
  ) : (
    inner
  );
}
