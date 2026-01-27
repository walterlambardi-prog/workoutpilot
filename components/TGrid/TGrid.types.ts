import React from "react";

export interface TGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: "$1" | "$2" | "$3" | "$4" | "$5" | "$6";
  space?: "$1" | "$2" | "$3" | "$4" | "$5" | "$6";
}
