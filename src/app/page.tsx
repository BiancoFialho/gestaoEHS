
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon, Settings, LogOut, ListSteps, FileText } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

  // Show loading state or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p> {/* Or a spinner */}
        </div>
    );
  }

  // Render the protected content if authenticated
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarHeader className="items-center gap-2">
                 <svg
                    className="size-6 shrink-0 group-data-[collapsible=icon]:hidden"
                    viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.34296 21.75H17.6566C19.517 21.75 21.0286 20.2912 21.0286 18.4308V13.3038C21.0286 12.3736 20.657 11.4853 19.9997 10.828L13.1717 4.00004C12.5144 3.34276 11.6261 2.97119 10.6959 2.97119H6.34296C4.48255 2.97119 2.97095 4.43 2.97095 6.2904V18.4308C2.97095 20.2912 4.48255 21.75 6.34296 21.75Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.5 21.75V3" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.75 11.25H10.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.75 16.5H10.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">StepWise</span>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton href="#" isActive tooltip="Home">
                        <HomeIcon />
                        <span>Home</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="#" tooltip="View Steps">
                         <ListSteps />
                        <span>View Steps</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="#" tooltip="Parse Text">
                        <FileText />
                        <span>Parse Text</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="#" tooltip="Settings">
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="items-center gap-2">
                 <Avatar className="size-8 group-data-[collapsible=icon]:size-6">
                    <AvatarImage src="https://picsum.photos/40/40" alt="Admin" data-ai-hint="profile avatar"/>
                    <AvatarFallback>AD</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">admin@stepwise.app</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto group-data-[collapsible=icon]:hidden"
                    onClick={logout}
                    aria-label="Logout"
                    >
                    <LogOut className="size-4" />
                </Button>
                 {/* Tooltip version for collapsed state */}
                <SidebarMenuButton
                    variant="ghost"
                    size="icon"
                    className="ml-auto hidden group-data-[collapsible=icon]:flex"
                    onClick={logout}
                    tooltip="Logout"
                    aria-label="Logout"
                    >
                    <LogOut />
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>

        <SidebarInset>
            <header className="flex items-center justify-between border-b bg-background p-4 md:justify-end">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold md:hidden">StepWise App</h1> {/* Title for mobile */}
                 {/* Add User menu or other header items here if needed */}
            </header>

            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Welcome to StepWise!</h1>
                <p>Select an option from the sidebar to get started.</p>
                 {/* Content area for the selected menu item will go here */}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
