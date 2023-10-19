// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { EditorInputItem } from "src/components/editor/EditorItem"
import RadionButtons from "src/components/RadioButtons"  
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { textPanelMsg } from "src/i18n/locales/en"
import { PanelType, DatavLogEditorProps, DatavLogPanel as Panel } from "./types"
import CodeEditor from "components/CodeEditor/CodeEditor"

const PanelEditor = memo(({ panel, onChange }: DatavLogEditorProps) => {
    const t1 = useStore(textPanelMsg)
    return (<PanelAccordion title={t1.textSettings}>
        <PanelEditItem title={t1.content}>
            <CodeEditor value={panel.plugins[PanelType].md} onChange={(v) => {
                onChange((panel: Panel) => {
                    panel.plugins[PanelType].md = v
                })
            }} language="markdown" height="240px" />
        </PanelEditItem>

        <PanelEditItem title={t1.horizontalPos}>
            <RadionButtons options={[{ label: t1.left, value: "left" }, { label: t1.center, value: "center" }, { label: t1.right, value: "right" }]} value={panel.plugins[PanelType].justifyContent} onChange={v => onChange((panel: Panel) => {
                panel.plugins[PanelType].justifyContent = v
            })} />

        </PanelEditItem>

        <PanelEditItem title={t1.verticalPos}>
            <RadionButtons options={[{ label: t1.top, value: "top" }, { label: t1.center, value: "center" }, { label: t1.bottom, value: "end" }]} value={panel.plugins[PanelType].alignItems} onChange={v => onChange((panel: Panel) => {
                panel.plugins[PanelType].alignItems = v
            })} />

        </PanelEditItem>
    </PanelAccordion>
    )
})

export default PanelEditor