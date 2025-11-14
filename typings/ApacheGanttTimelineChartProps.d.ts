/**
 * This file was generated from ApacheGanttTimelineChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { EditableValue, ListValue, ListActionValue, ListAttributeValue, ListWidgetValue } from "mendix";
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
    popupWidget?: ListWidgetValue;
    detailWidget?: ListWidgetValue;
    colorAttribute?: ListAttributeValue<string>;
    onClickAction?: ListActionValue;
    viewStartTimestamp?: EditableValue<Date>;
    viewEndTimestamp?: EditableValue<Date>;
    minBarWidth: number;
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
    popupWidget: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    detailWidget: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    colorAttribute: string;
    onClickAction: {} | null;
    viewStartTimestamp: string;
    viewEndTimestamp: string;
    minBarWidth: number | null;
}
