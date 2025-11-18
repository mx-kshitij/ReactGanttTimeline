/**
 * Data Transformation Utilities
 * 
 * Handles transformation of Mendix datasource items into ECharts-compatible format.
 * Processes hierarchical relationships, sorting, and data validation.
 */

import { ApacheGanttTimelineChartContainerProps } from "../../typings/ApacheGanttTimelineChartProps";
import { CHART_CONFIG } from "./chartHelpers";

/**
 * Represents a single row in the Y-axis (category axis).
 * Can be either a parent group row or a child item row.
 */
export interface CategoryRow {
  name: string;
  isParent: boolean;
}

/**
 * Result of data transformation
 */
export interface TransformedData {
  categories: CategoryRow[];
  seriesData: any[];
}

/**
 * Transforms Mendix datasource items into ECharts-compatible format.
 * 
 * This function:
 * 1. Validates and filters items with valid date ranges
 * 2. Builds parent-child hierarchical relationships
 * 3. Sorts items if sort attribute is provided
 * 4. Creates category rows for Y-axis
 * 5. Generates series data points for timeline bars
 * 6. Tracks progress throughout the transformation
 * 
 * @param props - Widget properties containing datasource and configuration
 * @param itemsMapRef - Reference to map for storing ObjectItem references
 * @param updateProgress - Callback function to update progress
 * @param setAllItemsLoaded - Callback to set whether all items are loaded
 * @returns Object containing categories (Y-axis rows) and seriesData (timeline bars)
 */
export const transformData = (
  props: ApacheGanttTimelineChartContainerProps,
  itemsMapRef: React.MutableRefObject<Map<number, any>>,
  updateProgress: (value: number) => void,
  setAllItemsLoaded: (loaded: boolean) => void
): TransformedData => {
  const categories: CategoryRow[] = [];
  const seriesData: any[] = [];
  let rowIndex = 0;

  // Clear previous ObjectItem mapping for click event handling
  itemsMapRef.current.clear();

  // Early return if no data available
  if (!props.itemsDatasource?.items || props.itemsDatasource.items.length === 0) {
    updateProgress(0);
    return { categories, seriesData };
  }

  const totalItems = props.itemsDatasource.items.length;
  updateProgress(CHART_CONFIG.PROGRESS_STEPS.START);

  // ===== Phase 1: Build parent-child hierarchy =====
  const items = props.itemsDatasource.items;
  const itemsMap = new Map<string, any>();
  const parentItems = new Map<string, any[]>();

  items.forEach((item: any, index: number) => {
    const itemId = item.id;
    itemsMap.set(String(itemId), item);

    // Update progress during grouping (10-30%)
    if (index % 100 === 0) {
      const groupProgress = CHART_CONFIG.PROGRESS_STEPS.START + 
        Math.floor((index / totalItems) * (CHART_CONFIG.PROGRESS_STEPS.GROUPING_END - CHART_CONFIG.PROGRESS_STEPS.START));
      updateProgress(groupProgress);
    }

    // Build parent-child relationships if parent attribute is configured
    if (props.parentUuidAttribute) {
      const parentId = props.parentUuidAttribute?.get(item).value;
      if (parentId) {
        const parentIdStr = String(parentId);
        if (!parentItems.has(parentIdStr)) {
          parentItems.set(parentIdStr, []);
        }
        parentItems.get(parentIdStr)!.push(item);
      }
    }
  });

  updateProgress(CHART_CONFIG.PROGRESS_STEPS.SORTING);

  // ===== Phase 2: Sort items if sort attribute is provided =====
  const sortedItems = props.sortAttribute
    ? items.sort((a: any, b: any) => {
        const aVal = props.sortAttribute?.get(a).value;
        const bVal = props.sortAttribute?.get(b).value;
        const aNum = aVal ? Number(aVal) : 0;
        const bNum = bVal ? Number(bVal) : 0;
        return aNum - bNum;
      })
    : items;

  updateProgress(CHART_CONFIG.PROGRESS_STEPS.TRANSFORM_START);

  // ===== Phase 3: Build categories and series data =====
  const processedParents = new Set<string>();

  sortedItems.forEach((item: any, index: number) => {
    // Update progress during data transformation (40-90%)
    if (index % 100 === 0) {
      const transformProgress = CHART_CONFIG.PROGRESS_STEPS.TRANSFORM_START + 
        Math.floor((index / totalItems) * (CHART_CONFIG.PROGRESS_STEPS.TRANSFORM_END - CHART_CONFIG.PROGRESS_STEPS.TRANSFORM_START));
      updateProgress(transformProgress);
    }

    const itemId = item.id;
    
    // Extract date attributes using Mendix ListAttributeValue API
    const startDateObj = props.startDatetimeAttribute?.get(item);
    const endDateObj = props.endDatetimeAttribute?.get(item);
    const startDate = startDateObj?.value;
    const endDate = endDateObj?.value;

    // Skip items with invalid dates
    if (!startDate || !endDate) {
      return;
    }

    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    if (isNaN(startTime) || isNaN(endTime)) {
      return;
    }

    // Calculate duration in minutes
    const durationMin = Math.round((endTime - startTime) / 60000);
    
    // Extract optional attributes
    const colorValue = props.colorAttribute ? props.colorAttribute?.get(item).value : undefined;
    const color = colorValue || "#1890ff";
    const tooltipHTML = props.tooltipHTMLAttribute ? props.tooltipHTMLAttribute?.get(item).value : undefined;
    const rowLabelHTML = props.rowLabelContent ? props.rowLabelContent?.get(item).value : undefined;
    const barLabelText = props.barLabelContent ? props.barLabelContent?.get(item).value : undefined;

    // Add parent row if this item has a parent that hasn't been added yet
    if (props.parentUuidAttribute) {
      const parentId = props.parentUuidAttribute?.get(item).value;
      const parentIdStr = String(parentId);
      if (parentId && !processedParents.has(parentIdStr)) {
        const parentItem = itemsMap.get(parentIdStr);
        if (parentItem) {
          categories.push({
            name: parentItem.displayValue || `Parent ${parentId}`,
            isParent: true
          });
          processedParents.add(parentIdStr);
          rowIndex++;
        }
      }
    }

    // Add item as a category row
    const displayName = rowLabelHTML || item.displayValue || `Item ${itemId}`;
    categories.push({
      name: displayName,
      isParent: false
    });

    // Store ObjectItem reference for click event handling
    itemsMapRef.current.set(rowIndex, item);

    // Create series data point for this timeline bar
    seriesData.push({
      name: displayName,
      value: [rowIndex, startTime, endTime, durationMin],
      itemStyle: {
        color: color
      },
      state: "normal",
      startStr: new Date(startDate).toLocaleString(),
      endStr: new Date(endDate).toLocaleString(),
      tooltipHTML: tooltipHTML,
      barLabel: barLabelText,
      rowIndex: rowIndex
    });

    rowIndex++;
  });

  updateProgress(CHART_CONFIG.PROGRESS_STEPS.COMPLETE);

  // Check if datasource has more items to load (for potential pagination)
  const hasMoreItems = props.itemsDatasource?.hasMoreItems || false;
  setAllItemsLoaded(!hasMoreItems);

  return { categories, seriesData };
};
