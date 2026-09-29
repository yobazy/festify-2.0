"use client";

import { useEffect } from "react";
import { useTasteStore } from "@/stores/tasteStore";

/** Loads the persisted taste store after hydration to avoid SSR mismatches. */
export function TasteStoreHydrator() {
  useEffect(() => {
    void useTasteStore.persist.rehydrate();
  }, []);

  return null;
}
