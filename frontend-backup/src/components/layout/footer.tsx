"use client";

import Link from "next/link";
import { Bike, Facebook, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";

const footerLinks = {
    company: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Advertise", href: "/advertise" },
        { label: "Careers", href: "/careers" },
    ],
    resources: [
        { label: "Bike News", href: "/news" },
        { label: "Compare Bikes", href: "/compare" },
        { label: "Used Bikes", href: "/used-bikes" },
        { label: "Dealers", href: "/dealers" },
    ],
    legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
    ],
};

const socialLinks = [
    { icon: Facebook, href: APP_CONFIG.socialLinks.facebook, label: "Facebook" },
    { icon: Instagram, href: APP_CONFIG.socialLinks.instagram, label: "Instagram" },
    { icon: Youtube, href: APP_CONFIG.socialLinks.youtube, label: "YouTube" },
    { icon: Twitter, href: APP_CONFIG.socialLinks.twitter, label: "Twitter" },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <Bike className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl">
                                MrBike<span className="text-primary">BD</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                            {APP_CONFIG.tagline}. Discover, compare, and buy motorcycles from Bangladesh&apos;s most trusted platform.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-2 md:col-span-2 lg:col-span-1">
                        <h3 className="font-semibold mb-4">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Get the latest bike news and updates.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} {APP_CONFIG.name}. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Made with ❤️ in Bangladesh
                    </p>
                </div>
            </div>
        </footer>
    );
}
