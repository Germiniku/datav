// Copyright (c) 2017 Uber Technologies, Inc.
//
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

import * as React from 'react';
import './SpanBarRow.css';
import ReferencesButton from './ReferencesButton';
import TimelineRow from '../TimelineRow';

import SpanTreeOffset from './SpanTreeOffset';
import SpanBar from './SpanBar';
import Ticks from '../Ticks';

import { TNil } from 'types/misc';
import { TraceSpan } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace';
import { ViewedBoundsFunctionType } from '../utils';
import { IoAlert } from 'react-icons/io5';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { FaEye, FaNetworkWired } from 'react-icons/fa';
import { MdOutlineUploadFile } from 'react-icons/md';
import { Box, Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import customColors from 'src/theme/colors';
import { formatDuration } from 'utils/date'
import KeyValuesTable from './SpanDetail/KeyValuesTable';

type SpanBarRowProps = {
    className?: string;
    color: string;
    columnDivision: number;
    isChildrenExpanded: boolean;
    isDetailExpanded: boolean;
    isMatchingFilter: boolean;
    onDetailToggled: (spanID: string) => void;
    onChildrenToggled: (spanID: string) => void;
    numTicks: number;
    rpc?:
    | {
        viewStart: number;
        viewEnd: number;
        color: string;
        operationName: string;
        serviceName: string;
    }
    | TNil;
    noInstrumentedServer?:
    | {
        color: string;
        serviceName: string;
    }
    | TNil;
    showErrorIcon: boolean;
    getViewedBounds: ViewedBoundsFunctionType;
    traceStartTime: number;
    span: TraceSpan;
    focusSpan: (spanID: string) => void;
    hoverIndentIds: Set<string>;
    addHoverIndentId: (spanID: string) => void;
    removeHoverIndentId: (spanID: string) => void;
};

/**
 * This was originally a stateless function, but changing to a PureComponent
 * reduced the render time of expanding a span row detail by ~50%. This is
 * even true in the case where the stateless function has the same prop types as
 * this class and arrow functions are created in the stateless function as
 * handlers to the onClick props. E.g. for now, the PureComponent is more
 * performance than the stateless function.
 */
const SpanBarRow = (props: SpanBarRowProps) => {
    const { colorMode } = useColorMode()
    const {
        className = "",
        color,
        columnDivision,
        isChildrenExpanded,
        isDetailExpanded,
        isMatchingFilter,
        numTicks,
        rpc,
        noInstrumentedServer,
        showErrorIcon,
        getViewedBounds,
        traceStartTime,
        span,
        focusSpan,
        hoverIndentIds,
        addHoverIndentId,
        removeHoverIndentId,
        onDetailToggled,
        onChildrenToggled
    } = props;
    const [onHover, setOnHover] = React.useState(false)
    const _detailToggle = () => {
        onDetailToggled(span.spanID);
    };

    const _childrenToggle = () => {
        onChildrenToggled(span.spanID);
    };



    const {
        duration,
        hasChildren: isParent,
        operationName,
        process: { serviceName },
    } = span;
    const label = formatDuration(duration);
    const viewBounds = getViewedBounds(span.startTime, span.startTime + span.duration);
    const viewStart = viewBounds.start;
    const viewEnd = viewBounds.end;
    const labelDetail = `${serviceName}::${operationName}`;
    let longLabel;
    let hintSide;
    if (viewStart > 1 - viewEnd) {
        longLabel = `${labelDetail} | ${label}`;
        hintSide = 'left';
    } else {
        longLabel = `${label} | ${labelDetail}`;
        hintSide = 'right';
    }

    const matchLightBg = "#fffce9"
    const matchDarkBg = 'rgb(22, 43, 50)'
    return (
        <Box sx={{
            '.span-row:hover .span-name-wrapper': {
                backgroundColor: useColorModeValue('#f8f8f8', 'gray.700'),
                background: colorMode == "light" ? 'linear-gradient(90deg, #fafafa, #f8f8f8 50%, #eee)' : null,
                //  `linear-gradient(90deg, ${customColors.hoverBg.dark}, ${customColors.hoverBg.dark} 50%, #222)`
            },
            '.span-row:hover .span-view': {
                backgroundColor: useColorModeValue('#f5f5f5', 'gray.700'),
                outline: colorMode == "light" ? '1px solid #ddd' : null
            },
            '.span-row.is-expanded .SpanBar--label,.span-row:hover .SpanBar--label, .span-name .endpoint-name': {
                color: useColorModeValue('#000', '#aaa')
            },
            '.span-row.is-expanded .span-name-wrapper': {
                background: useColorModeValue('#f8f8f8', 'gray.700'),
            },

            '.span-row.is-expanded .span-view': {
                background: useColorModeValue('#f8f8f8', 'gray.700'),
            },


            ' .span-row.is-matching-filter': {
                /* background-color: #fffce4; */
            },
            '.span-name-wrapper.is-matching-filter': {
                backgroundColor: useColorModeValue(matchLightBg, matchDarkBg),
                color: useColorModeValue('#000', '#fff')
            },
            '.span-row.is-expanded .span-name-wrapper.is-matching-filter': {
                background: useColorModeValue(matchLightBg, matchDarkBg),
            },
            '.span-row.is-expanded.is-matching-filter .span-view': {
                background: useColorModeValue(matchLightBg, matchDarkBg),
            },
            '.span-row.is-matching-filter:hover .span-name-wrapper': {
                background: useColorModeValue(matchLightBg, matchDarkBg),
            },
            '.span-row.is-matching-filter:hover .span-view': {
                backgroundColor: useColorModeValue(matchLightBg, matchDarkBg),
            },
            '.span-row.is-expanded.is-matching-filter:hover .span-view': {
                // background: '#ffeccf'
            }

        }} onMouseEnter={() => { setOnHover(true) }} onMouseLeave={() => setOnHover(false)}>
            <TimelineRow
                className={`
          span-row
          ${className || ''}
          ${isDetailExpanded ? 'is-expanded' : ''}
          ${isMatchingFilter ? 'is-matching-filter' : ''}
        `}
            >
                <TimelineRow.Cell className="span-name-column" style={{ position: "relative" }} width={columnDivision}>
                    <Box className={`span-name-wrapper ${isMatchingFilter ? 'is-matching-filter' : ''}`} bg={useColorModeValue('#f8f8f8', customColors.bodyBg.dark)}>
                        <SpanTreeOffset
                            childrenVisible={isChildrenExpanded}
                            span={span}
                            onClick={isParent ? _childrenToggle : undefined}
                            hoverIndentIds={hoverIndentIds}
                            addHoverIndentId={addHoverIndentId}
                            removeHoverIndentId={removeHoverIndentId}
                        />
                        <Flex
                            className={`span-name ${isDetailExpanded ? 'is-detail-expanded' : ''}`}
                            aria-checked={isDetailExpanded}
                            onClick={_detailToggle}
                            role="switch"
                            style={{ borderColor: color }}
                            tabIndex={0}
                        >
                            <Flex
                                alignItems="center"
                                className={`span-svc-name ${isParent && !isChildrenExpanded ? 'is-children-collapsed' : ''}`}
                            // style={{verticalAlign: "middle"}}
                            >
                                {showErrorIcon && <IoAlert style={{ display: "inline-block", marginBottom: '-2px' }} className="SpanBarRow--errorIcon" />}
                                <Text>{serviceName}{' '}</Text>
                                {rpc && (
                                    <Flex alignItems="center">
                                        <AiOutlineArrowRight />
                                        <i className="SpanBarRow--rpcColorMarker" style={{ background: rpc.color }} />
                                        <Text>{rpc.serviceName}</Text>
                                    </Flex>
                                )}
                                {noInstrumentedServer && (
                                    <Flex alignItems="center">
                                        <AiOutlineArrowRight />
                                        <i
                                            className="SpanBarRow--rpcColorMarker"
                                            style={{ background: noInstrumentedServer.color }}
                                        />
                                        <Text>{noInstrumentedServer.serviceName}</Text>
                                    </Flex>
                                )}
                            </Flex>
                            <small className="endpoint-name">{rpc ? rpc.operationName : operationName}</small>
                        </Flex>
                        {span.references && span.references.length > 1 && (
                            <ReferencesButton
                                references={span.references}
                                tooltipText="Contains multiple references"
                                focusSpan={focusSpan}
                            >
                                <FaNetworkWired />
                            </ReferencesButton>
                        )}
                        {span.subsidiarilyReferencedBy && span.subsidiarilyReferencedBy.length > 0 && (
                            <ReferencesButton
                                references={span.subsidiarilyReferencedBy}
                                tooltipText={`This span is referenced by ${span.subsidiarilyReferencedBy.length === 1 ? 'another span' : 'multiple other spans'
                                    }`}
                                focusSpan={focusSpan}
                            >
                                <MdOutlineUploadFile />
                            </ReferencesButton>
                        )}
                    </Box>
                  
                    {onHover && <Popover trigger="hover" placement="auto-end" offset={[12, -10]}>
                            <PopoverTrigger><Box position='absolute' right="2" top="2" fontSize="0.6rem" cursor="pointer">
                                <FaEye className='color-text'/>
                                </Box>
                            </PopoverTrigger>
                            <Portal>
                            <PopoverContent zIndex={1000} minW="500px">
                                <PopoverArrow />
                                <PopoverBody>
                                      <KeyValuesTable data={span.tags} linksGetter={null} />
                                      <KeyValuesTable data={span.process.tags} linksGetter={null} />
                                </PopoverBody>
                            </PopoverContent>
                            </Portal>
                        </Popover>
                    }
                </TimelineRow.Cell>
                <TimelineRow.Cell
                    className="span-view"
                    style={{ cursor: 'pointer' }}
                    width={1 - columnDivision}
                    onClick={_detailToggle}
                >
                    <Ticks numTicks={numTicks} />
                    <SpanBar
                        rpc={rpc}
                        viewStart={viewStart}
                        viewEnd={viewEnd}
                        getViewedBounds={getViewedBounds}
                        color={color}
                        shortLabel={label}
                        longLabel={longLabel}
                        hintSide={hintSide}
                        traceStartTime={traceStartTime}
                        span={span}
                    />
                </TimelineRow.Cell>
            </TimelineRow>
        </Box>
    );
}


export default SpanBarRow;