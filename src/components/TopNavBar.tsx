import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOfflineDemo } from "@/contexts/OfflineDemoContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NexVyapaarIcon } from "@/components/NexVyapaarIcon";
import { Home, Search, Bell, Mic, Radio, User, LayoutDashboard, Package, ShoppingCart, Megaphone, Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationBell } from "@/components/NotificationBell";
import { motion } from "framer-motion";

export function TopNavBar() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toggleOffline, isOffline } = useOfflineDemo();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Logout failed: " + error.message);
        } else {
            toast.success("Successfully logged out");
            navigate("/auth");
        }
    };

    // Detect scroll for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const primaryLinks = [
        { title: "Home", url: "/", icon: Home },
        { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
        { title: t.nav.inventory, url: "/inventory", icon: Package },
        { title: t.nav.sales, url: "/sales", icon: ShoppingCart },
        { title: t.nav.marketingCampaigns, url: "/marketing", icon: Megaphone },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`
          fixed top-0 left-0 right-0 z-50 h-16
          transition-all duration-300
          ${scrolled
                        ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200"
                        : "bg-white border-b border-slate-100"
                    }
        `}
            >
                <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-full">
                    {/* Brand Identity Area */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu for mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Logo - Using unique NexVyapaar icon */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 p-2">
                                <NexVyapaarIcon className="w-full h-full text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-xl font-display font-bold text-slate-900 tracking-tight">NexVyapaar</div>
                                <div className="text-xs text-slate-500">My Awesome Cafe</div>
                            </div>
                        </Link>
                    </div>

                    {/* Primary Navigation Links - Hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-8">
                        {primaryLinks.map((link) => (
                            <Link
                                key={link.url}
                                to={link.url}
                                className="
                  text-sm font-medium text-slate-600 hover:text-indigo-600
                  transition-colors duration-200
                  relative group
                  flex items-center gap-2
                "
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.title}</span>
                                <span className="
                  absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600
                  group-hover:w-full transition-all duration-300
                " />
                            </Link>
                        ))}
                    </nav>

                    {/* Utility Icons */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Global Search */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => {
                                // TODO: Open search modal with Cmd+K
                                console.log("Open search modal");
                            }}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* DEMO: Offline Toggle */}
                        {!isOffline && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden lg:flex text-xs border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800"
                                onClick={toggleOffline}
                            >
                                <span className="mr-2">⚡</span>
                                Go Offline
                            </Button>
                        )}

                        {/* Notifications */}
                        <div className="hidden sm:block">
                            <NotificationBell />
                        </div>

                        {/* Language Selector */}
                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>

                        {/* Voice Control Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-glow-indigo transition-all duration-300"
                            onClick={() => navigate("/voice")}
                        >
                            <Mic className="h-4 w-4" />
                        </Button>

                        {/* Broadcast Button - Desktop only */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex bg-gradient-to-br from-saffron-500 to-saffron-600 text-white hover:from-saffron-600 hover:to-saffron-700 shadow-md hover:shadow-glow-saffron transition-all duration-300"
                            onClick={() => navigate("/broadcasts")}
                        >
                            <Radio className="h-4 w-4" />
                        </Button>

                        {/* User Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="/placeholder.svg" alt="User" />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                                            <User className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/settings/voice")}>
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/voice-history")}>
                                    Voice History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/billing")}>
                                    Subscription
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-40 bg-white md:hidden"
                    style={{ top: "64px" }}
                >
                    <nav className="flex flex-col p-4 space-y-2">
                        {primaryLinks.map((link) => (
                            <Link
                                key={link.url}
                                to={link.url}
                                onClick={() => setMobileMenuOpen(false)}
                                className="
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  text-slate-700 hover:bg-indigo-50 hover:text-indigo-600
                  transition-colors duration-200
                  font-medium
                "
                            >
                                <link.icon className="h-5 w-5" />
                                <span>{link.title}</span>
                            </Link>
                        ))}
                    </nav>
                </motion.div>
            )}
        </>
    );
}
