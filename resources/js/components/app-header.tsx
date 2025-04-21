"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Icon } from "@/components/icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useInitials } from "@/hooks/use-initials"
import { cn } from "@/lib/utils"
import type { BreadcrumbItem, NavItem, SharedData } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  Folder,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Terminal,
  FileCode,
  Code,
  Shield,
  Users,
  Settings,
  Moon,
  Sun,
  Zap,
} from "lucide-react"
import { useState } from "react"

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Articles",
    href: "/articles",
    icon: FileCode,
  },
  {
    title: "Exploits",
    href: "/exploits",
    icon: Code,
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
]

const rightNavItems: NavItem[] = [
  {
    title: "Repository",
    href: "https://github.com/laravel/react-starter-kit",
    icon: Folder,
  },
  {
    title: "Documentation",
    href: "https://laravel.com/docs/starter-kits",
    icon: BookOpen,
  },
]

const activeItemStyles = "text-green-500 bg-black/30 dark:bg-black/50"

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const page = usePage<SharedData>()
  const { auth } = page.props
  const getInitials = useInitials()
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    // This is a placeholder - in a real app, you'd implement actual dark mode toggling
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <>
      <div className="border-neutral-800/50 border-b bg-black/20 dark:bg-black/40">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
          {/* Terminal icon and blinking cursor for hacker aesthetic */}
          <div className="flex items-center">
            <Terminal className="h-5 w-5 text-green-500 mr-2" />
            <span className="h-4 w-1 bg-green-500 animate-pulse hidden sm:inline-block"></span>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden ml-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 h-[34px] w-[34px] text-neutral-400 hover:text-green-500 hover:bg-black/30"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-neutral-900 border-neutral-800 flex h-full w-64 flex-col items-stretch justify-between"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetHeader className="flex justify-start text-left">
                  <div className="flex items-center">
                    <Terminal className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-mono text-green-500">HackersBlog</span>
                  </div>
                </SheetHeader>
                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                  <div className="flex h-full flex-col justify-between text-sm">
                    <div className="flex flex-col space-y-4">
                      {mainNavItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-2 font-mono p-2 rounded-md",
                            page.url === item.href
                              ? "bg-black/30 text-green-500"
                              : "text-neutral-400 hover:text-green-500 hover:bg-black/20",
                          )}
                        >
                          {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </Link>
                      ))}

                      {/* Create Article link in mobile menu */}
                      <Link
                        href="/articles/create"
                        className="flex items-center space-x-2 font-mono mt-4 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        <Icon iconNode={Plus} className="h-5 w-5" />
                        <span>Create New Article</span>
                      </Link>
                    </div>

                    <div className="flex flex-col space-y-4 mt-8 pt-4 border-t border-neutral-800">
                      {rightNavItems.map((item) => (
                        <a
                          key={item.title}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 font-mono text-neutral-400 hover:text-green-500"
                        >
                          {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </a>
                      ))}

                      {/* Dark mode toggle in mobile menu */}
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center space-x-2 font-mono text-neutral-400 hover:text-green-500"
                      >
                        <Icon iconNode={darkMode ? Sun : Moon} className="h-5 w-5" />
                        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/dashboard" prefetch className="flex items-center space-x-2 ml-4 lg:ml-0">
            <div className="flex items-center">
              <span className="font-mono text-green-500 text-lg hidden sm:inline-block">HackersBlog</span>
              <span className="font-mono text-green-500 text-lg sm:hidden">HB</span>
              <span className="text-green-500 animate-pulse ml-1">_</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="ml-6 hidden h-full items-center space-x-2 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-1">
                {mainNavItems.map((item, index) => (
                  <NavigationMenuItem key={index} className="relative flex h-full items-center">
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        page.url === item.href && activeItemStyles,
                        "h-9 cursor-pointer px-3 font-mono text-neutral-400 hover:text-green-500 hover:bg-black/30",
                      )}
                    >
                      {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                      {item.title}
                    </Link>
                    {page.url === item.href && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-green-500"></div>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            {/* Create New Article Button */}
            <Button
              variant="default"
              asChild
              className="hidden lg:flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Link href="/articles/create" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span className="font-mono">New Article</span>
              </Link>
            </Button>

            <div className="relative flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="group h-9 w-9 cursor-pointer text-neutral-400 hover:text-green-500 hover:bg-black/30"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">Search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Dark mode toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleDarkMode}
                      className="group h-9 w-9 cursor-pointer text-neutral-400 hover:text-green-500 hover:bg-black/30"
                    >
                      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{darkMode ? "Light Mode" : "Dark Mode"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="hidden lg:flex">
                {rightNavItems.map((item) => (
                  <TooltipProvider key={item.title} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-neutral-400 hover:text-green-500 hover:bg-black/30 transition-colors"
                        >
                          <span className="sr-only">{item.title}</span>
                          {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1 hover:bg-black/30">
                  <Avatar className="size-8 overflow-hidden rounded-full border-2 border-green-500/30">
                    <AvatarImage src={auth.user.avatar || "/placeholder.svg"} alt={auth.user.name} />
                    <AvatarFallback className="bg-black text-green-500 font-mono">
                      {getInitials(auth.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800" align="end">
                <div className="flex items-center justify-start p-2 border-b border-neutral-800">
                  <Avatar className="h-8 w-8 mr-2 border border-green-500/30">
                    <AvatarImage src={auth.user.avatar || "/placeholder.svg"} alt={auth.user.name} />
                    <AvatarFallback className="bg-black text-green-500 font-mono">
                      {getInitials(auth.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{auth.user.name}</p>
                    <p className="text-xs text-neutral-500 font-mono">
                      @{auth.user.name.toLowerCase().replace(/\s/g, "")}
                    </p>
                  </div>
                </div>

                <DropdownMenuItem className="cursor-pointer hover:bg-black/30 hover:text-green-500">
                  <FileCode className="mr-2 h-4 w-4" />
                  <span className="font-mono">My Articles</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer hover:bg-black/30 hover:text-green-500">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="font-mono">Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-neutral-800" />

                <DropdownMenuItem className="cursor-pointer hover:bg-black/30 hover:text-red-500">
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="font-mono">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {breadcrumbs.length > 1 && (
        <div className="border-neutral-800/50 flex w-full border-b bg-black/10 dark:bg-black/30">
          <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
            <div className="flex items-center">
              <Code className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-mono text-xs text-green-500 mr-2">path:</span>
            </div>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      )}
    </>
  )
}
