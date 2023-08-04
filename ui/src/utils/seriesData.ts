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
import { first, last, toNumber } from "lodash"
import { SeriesData } from "types/seriesData"
import { ValueCalculationType } from "types/value"
import { isEmpty } from "./validate"

export const calcValueOnSeriesData = (series: SeriesData, calc: ValueCalculationType):number => {
    const values = series.fields[1].values
    if (!calc) {
        return last(values)
    }

   return calcValueOnArray(values, calc)
}

export const calcValueOnArray = (values: number[], calc: ValueCalculationType):number => {
    switch (calc) {
        case ValueCalculationType.Avg:
            return values.reduce((a, b) => toNumber(a) + toNumber(b) , 0) / values.length
        case ValueCalculationType.Min:
            return Math.min(...values)
        case ValueCalculationType.Max:
            return Math.max(...values)
        case ValueCalculationType.Sum:
            return values.reduce((a, b) => toNumber(a)  + toNumber(b) , 0)
        case ValueCalculationType.Last:
            return last(values)
        case ValueCalculationType.First:
            return first(values)
        case ValueCalculationType.Count:
            return values.length
        default:
            return last(values)
    }
}

export const isSeriesData = (d: any) => {
    const data: SeriesData[] = d?.flat()
    for (const s of data) {
        if (s.name !== undefined && s.fields !== undefined) {
            return true
        }
    }

    return false
}