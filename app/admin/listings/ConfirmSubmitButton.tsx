'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';

export default function ConfirmSubmitButton({ 
  children, 
  title, 
  confirmMessage, 
  className 
}: { 
  children: React.ReactNode, 
  title: string, 
  confirmMessage?: string,
  className: string
}) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) {
          e.preventDefault();
        }
      }} 
      title={title} 
      className={`${className} ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`${pending ? 'animate-pulse' : ''}`}>
        {children}
      </div>
    </button>
  );
}
