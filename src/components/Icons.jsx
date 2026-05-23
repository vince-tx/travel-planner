import {
  Plane,
  Calendar,
  ClipboardList,
  Wallet,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Compass
} from 'lucide-react';

export const Icons = {
  plane: Plane,
  calendar: Calendar,
  checklist: ClipboardList,
  wallet: Wallet,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  mapPin: MapPin,
  compass: Compass
};

export const AppIcon = ({ name, size = 20, className = '', ...props }) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      strokeWidth={2}
      {...props}
    />
  );
};

export const EmptyIcon = ({ name, size = 64, className = '' }) => {
  return <AppIcon name={name} size={size} className={`empty-icon-svg ${className}`} />;
};
