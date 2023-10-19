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
import { Box, HStack, Input, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery, VStack } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import {  useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import React from "react";
import { useStore } from "@nanostores/react"
import { locale } from "src/i18n/i18n"
import InputSelect from "components/select/InputSelect"
import { MobileVerticalBreakpoint } from "src/data/constants"
import CodeEditor from "components/CodeEditor/CodeEditor"
import SelectDataFormat from "../../../components/query-edtitor/SelectDataFormat"
import { DataFormat } from "types/format"

const HttpQueryEditor = ({ panel, datasource, query, onChange }: DatasourceEditorProps) => {
    const code = useStore(locale)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const api = apiList.find(api => api.name == tempQuery.metrics)
    if (api && api.params) {
        if (!tempQuery.data[api.name]) {
            tempQuery.data[api.name] = {}
        }
        if (!tempQuery.data[api.name]['params']) {
            tempQuery.data[api.name]['params'] = api.params
            const q = cloneDeep(tempQuery)
            setTempQuery(q)
            onChange(q)
        }
    }

    if (!tempQuery.data['format']) {
        tempQuery.data['format'] = api?.format ??  DataFormat.Table
        const q = cloneDeep(tempQuery)
        setTempQuery(q)
        onChange(q)
    }
    
    const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
    return (<>
        <Form spacing={1}>
            <FormItem title="API" labelWidth="100px" size="sm" alignItems={isMobileScreen ? "start" : "center"} flexDirection={isMobileScreen ? "column" : "row"}>
                <InputSelect value={tempQuery.metrics} options={apiList.map(api => ({ label: api.name, value: api.name, annotation: api.desc }))} annotationDir="vertical" onChange={v => {
                    tempQuery.metrics = v 
                    const api1 = apiList.find(api => api.name == v)
                    if (!tempQuery.data[v]) {
                        tempQuery.data[v] = {}
                    }
                    if (!tempQuery.data[v]['params'] ) {
                        tempQuery.data[v]['params'] = api1.params
                    }
                    const q = cloneDeep(tempQuery)
                    setTempQuery(q)
                    onChange(q)
                }} />
                {!isMobileScreen && api?.desc && <Text textStyle="annotation">{api.desc}</Text>}
            </FormItem>
            {api?.params && <FormItem title="Params" labelWidth="100px" size="sm" flexDirection={isMobileScreen ? "column" : "row"} desc={<TableContainer>
                <Table variant='simple' size="sm">
                    <Thead>
                        <Tr>
                            <Th>Param</Th>
                            <Th>Desc</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            api?.paramsDesc?.map(desc => <Tr>
                                <Td>{desc[0]}</Td>
                                <Td>{desc[1]}</Td>
                            </Tr>)
                        }
                    </Tbody>
                </Table>
            </TableContainer>}>
                <Box width={!isMobileScreen ? "calc(100% - 200px)" : "calc(100% - 180px)"}>
                    <CodeEditor
                        language="json"
                        value={tempQuery.data[tempQuery.metrics].params}
                        onChange={(v) => {
                            tempQuery.data[tempQuery.metrics]['params'] = v
                            const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
                            setTempQuery(q)
                        }}
                        onBlur={() => {
                            onChange(tempQuery)
                        }}
                        isSingleLine
                    />
                </Box>
            </FormItem>}

            <SelectDataFormat tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange} labelWidth="100px"/>
        </Form>
    </>)
}

export default HttpQueryEditor



const apiList = [{
    name: "getServiceInfoList",
    desc: "get service infos, such as p99 latency, errors, qps, render as a table",
    params: `{
    "env": "prod"
}`,
    paramsDesc: [
        ["env", "environment name, such as dev, test, prod etc"],
        ["service", "filter by service names, e.g datav|driver"]
]
},
{
    name: "getServiceNames",
    desc: "get service names, can be used in variable values",
    params: `{
    "env": "test"
}`,
    paramsDesc: [["env", "environment name, such as dev, test, prod etc"]],
    format: DataFormat.Table
},
{
    name: "getServiceOperations",
    desc: "get service operations",
    params: `{
    "env": "test",
    "service": "datav"
}`,
    paramsDesc: [["env", "environment name, such as dev, test, prod etc"]],
    format: DataFormat.Table
}
]
