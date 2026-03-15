"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const NAV_ITEMS = [
  { href: "/", label: "Events" },
  { href: "/source", label: "Sources" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-background px-6">
      <div className="flex h-12 items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ECE1779
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  asChild
                  active={pathname === item.href}
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href={item.href}>{item.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
