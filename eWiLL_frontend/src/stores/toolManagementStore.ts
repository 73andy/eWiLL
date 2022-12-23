import { defineStore } from "pinia";
import Mode from "../enums/Mode";

import Entity from "../model/diagram/Entity";
import Line from "../model/diagram/Line";

interface State {
  showModalAddAttributes: boolean;
  selectedEntity: Entity | null;
  selectedLine: Line | null;
  mode: Mode;
}

export const useToolManagementStore = defineStore("tool-management", {
  state: (): State => ({
    showModalAddAttributes: false,
    selectedEntity: null,
    selectedLine: null,
    mode: Mode.EDIT,
  }),
  getters: {},
  actions: {},
});
