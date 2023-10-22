import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { Datasource } from "types/datasource"
import { Variable } from "types/variable"
import { requestApi } from "utils/axios/request"
import { isEmpty } from "lodash"
import { QueryPluginResult } from "types/plugin"
import { mysqlToSeriesData } from "./utils"
import { getDatasource, roundDsTime } from "utils/datasource"
import { getNewestTimeRange } from "components/DatePicker/TimePicker"
import { replaceWithVariablesHasMultiValues } from "utils/variable"
import { PromDsQueryTypes } from "./VariableEditor"
import isURL from "validator/lib/isURL"
import { $variables } from "src/views/variables/store"
import { parseVariableFormat } from "utils/format"
import { VariableSplitChar, VarialbeAllOption } from "src/data/variable"

export const runQuery = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data: []
        }
    }
    const res: QueryPluginResult = await requestApi.get(`/proxy/${ds.id}`,{
        params: {
            query: q.metrics.replaceAll("\n", " ")
        }
    })
    if (res.status !== "success") {
        console.log("Failed to fetch data from target datasource", res)
        return {
            error: res.error,
            data: []
        }
    }

    const data = mysqlToSeriesData(res.data, panel, q, range)
    return {
        error: null,
        data: data,
    }
}

export const testDatasource = async (ds: Datasource) => {
    // check datasource setting is valid
    const error = isDemoDatasourceValid(ds)
    if (error != null) {
        return error
    }
    // when create dashboard how to test connect
    const res: QueryPluginResult = await requestApi.get(`/datasource/test?type=${ds.type}&url=${ds.url}&database=${ds.data.database}&username=${ds.data.username}&password=${ds.data.password}`)
    return res.status == "success" ? true : res.error
}

export const queryVariableValues = async (variable: Variable) => {
    const ds = getDatasource(variable.datasource)
    let result = {
        error: null,
        data: []
    }

    let data;
    try {
        data = JSON.parse(variable.value)
    } catch (error) {
        return result
    }

    const timeRange = getNewestTimeRange()
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)

    if (data.type == PromDsQueryTypes.LabelValues) {
        if (data.label) {
            // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            let url = `/proxy/${ds.id}/api/v1/label/${data.label}/values?${data.useCurrentTime ? `&start=${start}&end=${end}` : ""}`
            const metrics = replaceWithVariablesHasMultiValues(data.metrics)
            for (const m of metrics) {
                url += `${m ? `&match[]=${m}` : ''}`
            }
            const res: any = await requestApi.get(url)
            if (res.status == "success") {
                result.data = result.data.concat(res.data)
            } else {
                result.error = res.error
            }
        }
    } else if (data.type == PromDsQueryTypes.Metrics) {
        if (!isEmpty(data.regex)) {
            const res = await queryDemoAllMetrics(variable.datasource, data.useCurrentTime)
            if (res.error) {
                result.error = res.error
            } else {
                try {
                    const regex = new RegExp(data.regex)
                    result.data = res.data.filter(r => regex.test(r))
                } catch (error) {
                    result.error = error.message
                }

            }
        }
    } else if (data.type == PromDsQueryTypes.LabelNames) {
        result = await queryDemoLabels(variable.datasource)
    }

    return result
}

export const replaceQueryWithVariables = (query: PanelQuery, interval: string) => {
    const vars = $variables.get()
    const formats = parseVariableFormat(query.metrics);
    for (const f of formats) {
        const v = vars.find(v => v.name == f)
        if (v) {
            let selected = []
            if (v.selected == VarialbeAllOption) {
                selected = v.values?.filter(v1 => v1 != VarialbeAllOption) ?? []
            } else {
                selected = v.selected?.split(VariableSplitChar) ?? []
            }
            const joined = selected.join(',')
            if (joined) {
                query.metrics = query.metrics.replaceAll(`\${${f}}`, joined);
            }
        }
    }
}

export const queryAlerts = async (panel: Panel, timeRange: TimeRange, ds: Datasource) => {
    const res: any = await requestApi.get(`/proxy/${ds.id}/api/v1/rules?type=alert`)
    if (res.status !== "success") {
        console.log("Failed to fetch data from demo datasource", res)
        return {
            error: `${res.errorType}: ${res.error}`,
            data: []
        }
    }

    res.data.fromDs = ds.type
    return {
        error: null,
        data: res.data,
    }
}

export const queryDemoAllMetrics = async (dsId, useCurrentTimerange = true) => {
    const ds = getDatasource(dsId)

    const timeRange = getNewestTimeRange()
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)

    const url = `/proxy/${ds.id}/api/v1/label/__name__/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}`

    const res: any = await requestApi.get(url)
    if (res.status == "success") {
        return {
            data: res.data,
            error: null
        }
    } else {
        return {
            data: null,
            error: res.error
        }
    }
}

export const queryDemoLabels = async (dsId, metric = "", useCurrentTimerange = true) => {
    const ds = getDatasource(dsId)
    const timeRange = getNewestTimeRange()
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)
    const metrics = replaceWithVariablesHasMultiValues(metric)
    let url = `/proxy/${ds.id}/api/v1/labels?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}`
    for (const m of metrics) {
        url += `${m ? `&match[]=${m}` : ''}`
    }

    const res: any = await requestApi.get(url)
    if (res.status == "success") {
        return {
            data: res.data,
            error: null
        }
    } else {
        return {
            data: null,
            error: res.error
        }
    }
}


const isDemoDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, {
        require_protocol: false,
        require_tld: false,
        require_host: true,
        require_port: true,
    })) {
        return 'invalid host url'
    }
    if (!ds.data.database) {
        return 'need database'
    }
    if (!ds.data.username) {
        return 'need username'
    }

    if (!ds.data.password) {
        return 'need password'
    }
    return
}