import { Panel } from "types/dashboard";
import { requestApi } from "utils/axios/request";

export async function saveAndRefreshLibraryPanel(panel: Panel) {
  const panelSaveModel = toPanelSaveModel(panel);
  const savedPanel = await saveOrUpdateLibraryPanel(panelSaveModel)
  updatePanelModelWithUpdate(panel, savedPanel);
  return [panel, savedPanel]
}

function toPanelSaveModel(panel: Panel) {

  let { ...panelSaveModel } = panel
  panelSaveModel = {
    libraryPanel: {
      name: panel.libraryPanel.name,
      uid: undefined
    },
    ...panelSaveModel,
  }
  return panelSaveModel
}

function updatePanelModelWithUpdate(panel: Panel, updated: any): void {
  panel.libraryPanel = updated
  panel.title = updated.name
}

function saveOrUpdateLibraryPanel(panel: Panel) {
  if (!panel.libraryPanel) {
    return Promise.reject()
  }
  if (panel.libraryPanel && !panel.libraryPanel.uid) {
    return addLibraryPanel(panel)
  }
  return updateLibraryPanel(panel)
}

async function addLibraryPanel(panel: Panel) {
  const { data } = await requestApi.post('/library-elements', {
    name: panel.libraryPanel.name,
    model: panel,
  })
  console.log('data:', data)
  return data
}

async function updateLibraryPanel(panel: Panel) {
  const { libraryPanel, ...model } = panel
  const { uid, name } = libraryPanel
  await requestApi.patch(`/library-elements/${uid}`, {
    name,
    model,
  })
}
