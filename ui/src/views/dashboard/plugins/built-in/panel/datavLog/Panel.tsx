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
import { Box, Center, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import React, { memo, useMemo, useState } from "react";
import { DatavLogPanel } from "./types";
import ColumnResizableTable from "components/table/ColumnResizableTable";
import { ColumnDef } from "@tanstack/react-table";
import { DatasourceMaxDataPoints, DatasourceMinInterval, IsSmallScreen } from "src/data/constants";
import moment from "moment";
import { isEmpty } from "utils/validate";
import NoData from "src/views/dashboard/components/PanelNoData";
import DatavLogChart from "./Chart";
import Search from "./Search";
import { dateTimeFormat } from "utils/datetime/formatter";
import { setDateTime } from "components/DatePicker/DatePicker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { builtinDatasourcePlugins } from "../../plugins";
import { $datasources } from "src/views/datasource/store";
import { externalDatasourcePlugins } from "../../../external/plugins";
import { cloneDeep } from "lodash";
import { calculateInterval } from "utils/datetime/range";

interface Props extends PanelProps {
    panel: DatavLogPanel
}

const PanelWrapper = memo((props: Props) => {
    const data = props.data.flat()

    if (isEmpty(data)) {
        return <Center height="100%"><NoData /></Center>
    }

    return (<>
        {
            !isLogData(data[0])
                ?
                <Center height="100%">
                    <VStack>
                        <Text fontWeight={500} fontSize="1.1rem">Data format not support!</Text>
                        <Text className='color-text'>Try to change to Datav datasource to use this panel</Text>
                    </VStack>
                </Center>
                :
                <Panel {...props} data={data[0]} />
        }
    </>
    )
})



export default PanelWrapper

const queryClient = new QueryClient()
const Panel = (props: Props) => {
    const { panel, data } = props

    const [isMobileScreen] = useMediaQuery(IsSmallScreen)
    const [displayLogCount, setDisplayLogs] = useState<number>(0)
    const wrapLine = false

    const defaultColumns: ColumnDef<any>[] = useMemo(() => ([
        {
            accessorKey: 'timestamp',
            header: 'Timestamp',
            size: isMobileScreen ? 100 : 170,
            cell: info => <Text opacity={0.7} fontWeight={550} fontSize={12}>{info.getValue() as any}</Text>,
        },
        // {
        //     accessorFn: row => row.lastName,
        //     id: 'lastName',
        //     cell: info => info.getValue(),
        //     header: () => <span>Last Name</span>,
        // },

        {
            accessorKey: 'severity_text',
            header: "Level",
            cell: info => {
                const severity = info.getValue() as any
                return <Text className={severity == "error" && "error-text"}>{severity}</Text>
            },
            size: isMobileScreen ? 50 : 90
        },
        {
            accessorKey: '_service',
            header: "Service",
            size: isMobileScreen ? 150 : 120
        },
        {
            accessorKey: 'body',
            header: 'Message',
            size: wrapLine ? 500 : 800
        }
    ]), [isMobileScreen, wrapLine])

    const logs = useMemo(() => {
        return parseLogs(data, isMobileScreen)
    }, [isMobileScreen, data])

    
    const totalLogs = useMemo(() => {
        const d: any[] = data.chart.data
        return d.reduce((total, b) =>  {
            return total + b[1]
        }, 0)
    },[data.chart])

    const onClickChart = (ts, level, step) => {
        const from = Number(ts)
        const to = Number(ts) + Number(step)
        setDateTime(from, to)
    }

    const onLoadLogsPage = async (page) => {
        const ds = $datasources.get().find(ds => ds.id == panel.datasource.id)
        const plugin = builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
        if (plugin) {
            const query = cloneDeep(panel.datasource.queries[0])
            const intervalObj = calculateInterval(props.timeRange, panel.datasource.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints, isEmpty(panel.datasource.queryOptions.minInterval) ? DatasourceMinInterval : panel.datasource.queryOptions.minInterval)
            query.interval = intervalObj.intervalMs / 1000
     
            const res = await plugin.runQuery(panel, query, props.timeRange, ds, {
                page: page
            })

        
            if (res.data.length > 0) {
                const logs = parseLogs(res.data[0], isMobileScreen)
                return logs
            } else {
                return []
            }
        }
    }

    const chartHeight = 100
    return (<Box px="2" height="100%" id="datav-log-panel" >
        <Search panel={panel} />
        {data.chart && <Box height={chartHeight} mb="2">
            <DatavLogChart panel={panel} width={props.width} data={data.chart} onClick={onClickChart} totalLogs={totalLogs} displayLogs={displayLogCount} />
        </Box>}
        <QueryClientProvider client={queryClient}>
            <ColumnResizableTable columns={defaultColumns} data={logs} wrapLine={wrapLine} fontSize={12} allowOverflow={false} height={props.height - chartHeight} totalRowCount={totalLogs} onLoadPage={onLoadLogsPage} onRowsCountChange={setDisplayLogs}/>
      
        </QueryClientProvider>
     
    </Box>)
}


const isLogData = (data: any) => {
    if (!data.logs) {
        return false
    }

    return true
}

const parseLogs = (data, isMobileScreen) => {
    const logs = []
    for (const log of data.logs) {
        logs.push({
            ...log,
            timestamp: isMobileScreen ? moment(log.timestamp / 1e6).format("MM-DD hh:mm:ss") : dateTimeFormat(log.timestamp / 1e6, { format: "YY-MM-DD HH:mm:ss.SSS" })
        })
    }

    return logs
}