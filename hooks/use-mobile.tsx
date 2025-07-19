"use client"

import { useMediaQuery } from "react-responsive"

export function useMobile() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
  return isMobile
}
