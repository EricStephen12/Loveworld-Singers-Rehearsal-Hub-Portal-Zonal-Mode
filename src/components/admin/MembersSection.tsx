"use client";

import React from 'react';
import Members from '../Members';

interface MembersSectionProps {
  // Add any props that Members needs
}

export default function MembersSection(props: MembersSectionProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <Members />
    </div>
  );
}
