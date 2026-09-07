'use client';

import React from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';

const signOutBtn = () => {
    const router = useRouter();
    return (
        <DropdownMenuItem
            onClick={async () => {
                const result = await signOut();
                if (result.data) {
                    router.push('/sign-in');
                } else {
                    alert('Error signing out');
                }
            }}>
            Log Out
        </DropdownMenuItem>
    );
};

export default signOutBtn;
