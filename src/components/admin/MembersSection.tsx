"use client";

import React from 'react';
import Members from '../Members';
import { useAdminTheme } from './AdminThemeProvider';

interface MembersSectionProps {
  // Add any props that Members needs
}

export default function MembersSection(props: MembersSectionProps) {
  const { theme } = useAdminTheme();
  
  return (
    <div className="flex-1 overflow-hidden">
      <Members />
    </div>
  );
}
