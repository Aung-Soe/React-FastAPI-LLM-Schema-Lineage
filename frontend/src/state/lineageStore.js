import { create } from "zustand";

export const useLineageStore = create(set => ({
  lineage: null,
  selectedNode: null,

  setLineage: lineage => set({ lineage }),
  selectNode: node => set({ selectedNode: node }),
}));