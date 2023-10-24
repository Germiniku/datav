import { useAsyncFn } from "react-use"
import { Panel } from "types/dashboard"
import { saveAndRefreshLibraryPanel } from "./utils"

export const usePanelSave = () => {
  const [state, saveLibraryPanel] = useAsyncFn(async (panel: Panel) => {
    try {
      return await saveAndRefreshLibraryPanel(panel)
    } catch (err) {
      throw err;
    }
  }, [])
  return { state, saveLibraryPanel }
}