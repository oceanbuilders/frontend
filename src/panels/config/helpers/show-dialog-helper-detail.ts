import { fireEvent } from "../../../common/dom/fire_event";
import { DataEntryFlowDialogParams } from "../../../dialogs/config-flow/show-dialog-data-entry-flow";

export const loadHelperDetailDialog = () => import("./dialog-helper-detail");

export interface ShowDialogHelperDetailParams {
  // Only used for config entries
  dialogClosedCallback: DataEntryFlowDialogParams["dialogClosedCallback"];
}

export const showHelperDetailDialog = (
  element: HTMLElement,
  params: ShowDialogHelperDetailParams
) => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-helper-detail",
    dialogImport: loadHelperDetailDialog,
    dialogParams: params,
  });
};
