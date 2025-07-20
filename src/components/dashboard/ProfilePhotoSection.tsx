import React from 'react';
import { PhotoSection } from '@/components/PhotoSection';

export const ProfilePhotoSection: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <PhotoSection>{children}</PhotoSection>;
};
