/**
 * This file was generated from ApacheGanttTimelineChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue } from "mendix";
import { Big } from "big.js";

export interface ApacheGanttTimelineChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    itemsDatasource: ListValue;
    sortAttribute?: ListAttributeValue<Big>;
    itemUuidAttribute: ListAttributeValue<Big | string>;
    parentUuidAttribute?: ListAttributeValue<Big | string>;
    startDatetimeAttribute: ListAttributeValue<Date>;
    endDatetimeAttribute: ListAttributeValue<Date>;
    tooltipHTMLAttribute?: ListExpressionValue<string>;
    rowLabelContent?: ListExpressionValue<string>;
    barLabelContent?: ListExpressionValue<string>;
    colorAttribute?: ListAttributeValue<string>;
    onClickAction?: ListActionValue;
    viewStartTimestamp?: EditableValue<Date>;
    viewEndTimestamp?: EditableValue<Date>;
    enableDateFilter: boolean;
    minBarWidth: number;
    minRowHeight: number;
    timeFormat?: DynamicValue<string>;
    chartOptionsJSON?: DynamicValue<string>;
}

export interface ApacheGanttTimelineChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    itemsDatasource: {} | { caption: string } | { type: string } | null;
    sortAttribute: string;
    itemUuidAttribute: string;
    parentUuidAttribute: string;
    startDatetimeAttribute: string;
    endDatetimeAttribute: string;
    tooltipHTMLAttribute: string;
    rowLabelContent: string;
    barLabelContent: string;
    colorAttribute: string;
    onClickAction: {} | null;
    viewStartTimestamp: string;
    viewEndTimestamp: string;
    enableDateFilter: boolean;
    minBarWidth: number | null;
    minRowHeight: number | null;
    timeFormat: string;
    chartOptionsJSON: string;
}
