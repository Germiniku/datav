import { Panel } from "types/dashboard"
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import SearchResultPlot from "./SearchResultPlot"
import { TimeRange } from "types/time"
import { Box, Button, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Select, StackDivider, Text, VStack, chakra, useMediaQuery } from "@chakra-ui/react"
import TraceCard from "./TraceCard"
import { useCallback, useEffect, useMemo, useState } from "react"
import { clone, remove } from "lodash"
import TraceCompare from "./TraceCompare/TraceCompare"
import { FaTimes } from "react-icons/fa"
import React from "react";
import { useStore } from "@nanostores/react"
import { tracePanelMsg } from "src/i18n/locales/en"
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar"
import { MobileBreakpoint } from "src/data/constants"
import { $datasources } from "src/views/datasource/store"
import { Datasource } from "types/datasource"
import { getDatasource } from "utils/datasource"

interface Props {
    dashboardId: string
    teamId: number
    panel: Panel
    traces: Trace[]
    timeRange: TimeRange
    height: number
}

const TraceSearchResult = ({dashboardId, teamId, panel, traces, timeRange ,height}: Props) => {
    const t1 = useStore(tracePanelMsg)
    const datasources = useStore($datasources)
    const [selectedTraces, setSelectedTraces] = useState<Trace[]>([])
    const [sort, setSort] = useState(traceSortTypes[0].value)
    const [comparison, setComparison] = useState<string[]>([])
    
    useEffect(() => {
        setSelectedTraces(clone(traces))
        setComparison([])
    }, [traces])

    const maxDuration = useMemo(() => Math.max(...traces.map(trace => trace.duration)), [traces])

    const onSelect = useCallback((traceIds: string[]) => {
        const selected = traces.filter(trace => traceIds.includes(trace.traceID))
        setSelectedTraces(selected)
    },[])

    const sortedTraces = useMemo(() => {
        switch (sort) {
            case "recent":
                return selectedTraces.sort((a, b) => b.startTime - a.startTime)
            case "mostErrors":
                return selectedTraces.sort((a, b) => b.errorsCount - a.errorsCount)
            case "longest":
                return selectedTraces.sort((a, b) => b.duration - a.duration)
            case "shortest":
                return selectedTraces.sort((a, b) => a.duration - b.duration)
            case "mostSpans":
                return selectedTraces.sort((a, b) => b.spans.length - a.spans.length)
            case "leastSpans":
                return selectedTraces.sort((a, b) => a.spans.length - b.spans.length)
            default:
                return traces
        }
    }, [selectedTraces, sort])

    const onTraceChecked = traceId => {

        if (comparison.includes(traceId)) {
            remove(comparison, i => i == traceId)
        } else {
            comparison.push(traceId)
        }

        setComparison([...comparison])
    }

    const comparedTraces = comparison.map(traceId => {
        return traces.find(t => t.traceID == traceId)
    }).filter(t => t)

    const removeFromCompare = traceId => {
        remove(comparison, i => i == traceId)
        setComparison([...comparison])
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const plotHeight = 200

    const ds = getDatasource(panel.datasource.id, datasources)

    const onTraceClick = (trace) => {
        if (ds) {
            window.open(`/trace/${trace.traceID}/${ds.id}?dashboardId=${dashboardId}&panelId=${panel.id}&teamId=${teamId}`)
        }
    }

    return (<>
    <Box pl="2">
        <SearchResultPlot traces={traces} timeRange={timeRange} onSelect={onSelect} height={plotHeight} />
        <Box pl="2" pr="20px" pt="4">
            <Flex alignItems="center" justifyContent="space-between" mb="1" fontSize={isLargeScreen ? null : "xs"}>
                <HStack height="40px" fontSize="0.9rem">
                    {selectedTraces.length != traces.length ? <Text>{selectedTraces.length} {t1.tracesSelected}</Text> : <Text>{selectedTraces.length} {t1.tracesTotal}</Text>}
                    {selectedTraces.length != traces.length && <Button size="sm" variant="outline" onClick={() => setSelectedTraces(clone(traces))}>{t1.clearSelection}</Button>}
                </HStack>
                {
                    comparison.length > 0 && <HStack textStyle="title">
                        <Text><ComparisonTraces removeFromCompare={removeFromCompare} comparedTraces={comparedTraces} maxDuration={maxDuration} datasources={datasources}/> {t1.selectForCompre}</Text>
                        <TraceCompare traces={comparedTraces}/>
                    </HStack>
                }
                <HStack alignItems="center">
                    {/* <Text minWidth="fit-content" fontSize="0.9rem">排序</Text> */}
                    <Select variant="unstyled" size={isLargeScreen ? "sm" : "xs"} value={sort} onChange={e => setSort(e.currentTarget.value)}>
                        {traceSortTypes.map(sortType => <option key={sortType.value} value={sortType.value}>{t1[sortType.value]}</option>)}
                    </Select>
                </HStack>
            </Flex>
            <VStack alignItems="left" maxH={height - plotHeight - 58}>
                <CustomScrollbar>
                    {sortedTraces.map(trace => <TraceCard key={trace.traceID} trace={trace} maxDuration={maxDuration} checked={comparison.includes(trace.traceID)} checkDisabled={comparison.length >= 2 && !comparison.includes(trace.traceID)} onChecked={onTraceChecked} onClick={() => onTraceClick(trace)}/>)}
                </CustomScrollbar>
            </VStack>
        </Box>
    </Box>

    </>)
}

export default TraceSearchResult


const ComparisonTraces = ({ comparedTraces,maxDuration,removeFromCompare, datasources }: { comparedTraces: Trace[],maxDuration: number,removeFromCompare:any, datasources: Datasource[] }) => {
    return (<>
        <Popover trigger="hover" placement="left">
            <PopoverTrigger>
                <chakra.span color="brand.500" cursor="pointer">{comparedTraces.length}</chakra.span>
            </PopoverTrigger>
            <PopoverContent minWidth="500px">
                <PopoverArrow />
                <PopoverBody>
                    <VStack alignItems="left" divider={<StackDivider />}>
                        {comparedTraces.map(trace => {return trace && <HStack spacing={2}>
                        <TraceCard  trace={trace} maxDuration={maxDuration} simple/>
                        <FaTimes cursor="pointer" onClick={() => removeFromCompare(trace.traceID)}/>
                        </HStack>})}
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    </>)
}
const traceSortTypes = [
    {
        label: "Most Recent",
        value: "recent"
    },
    {
        label: "Most Errors",
        value: "mostErrors"
    },
    {
        label: "Longest Duruation",
        value: "longest"
    },
    {
        label: "Shortest Duruation",
        value: "shortest"
    },
    {
        label: "Most Spans",
        value: "mostSpans"
    },
    {
        label: "Least Spans",
        value: "leastSpans"
    }
]