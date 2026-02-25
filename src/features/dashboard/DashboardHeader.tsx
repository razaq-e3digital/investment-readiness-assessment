'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { ActiveLink } from '@/components/ActiveLink';
import { Logo } from '@/components/Logo';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export const DashboardHeader = (props: {
  menu: {
    href: string;
    label: string;
  }[];
}) => (
  <>
    <div className="flex items-center">
      <Link href="/dashboard" className="max-sm:hidden">
        <Logo />
      </Link>

      <nav className="ml-6 max-lg:hidden">
        <ul className="flex flex-row items-center gap-x-3 text-lg font-medium [&_a:hover]:opacity-100 [&_a]:opacity-75">
          {props.menu.map(item => (
            <li key={item.href}>
              <ActiveLink href={item.href}>{item.label}</ActiveLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>

    <div>
      <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
        <li data-fade>
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToggleMenuButton />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {props.menu.map(item => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>

        <li>
          <Separator orientation="vertical" className="h-4" />
        </li>

        <li>
          <UserButton
            appearance={{
              elements: {
                rootBox: 'px-2 py-1.5',
              },
            }}
          />
        </li>
      </ul>
    </div>
  </>
);
