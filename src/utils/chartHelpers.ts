/**
 * Chart Helper Utilities
 * 
 * Utility functions for the Apache Gantt Timeline Chart widget.
 * These functions handle common operations like data transformation,
 * calculations, and formatting.
 */

import { format } from "date-fns";

/**
 * Configuration constants for the chart behavior
 */
export const CHART_CONFIG = {
  MIN_HEIGHT: 400,
  MAX_HEIGHT: 800,
  MAX_VISIBLE_ROWS: 10,
  DEFAULT_MIN_ROW_HEIGHT: 40,
  DEFAULT_MIN_BAR_WIDTH: 2,
  TIME_PADDING_PERCENT: 0.05,
  PROGRESS_STEPS: {
    START: 10,
    GROUPING_END: 30,
    SORTING: 35,
    TRANSFORM_START: 40,
    TRANSFORM_END: 90,
    COMPLETE: 100
  }
} as const;

/**
 * Recursively deep-merges a source object into a target object.
 * Used to merge custom chart options with default ECharts configuration.
 * 
 * @param target - The target object to merge into (will be mutated)
 * @param source - The source object to merge from
 * 
 * @example
 * const target = { tooltip: { show: true } };
 * const source = { tooltip: { backgroundColor: "red" } };
 * mergeOptions(target, source);
 * // Result: { tooltip: { show: true, backgroundColor: "red" } }
 */
export const mergeOptions = (target: any, source: any): void => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // Nested object: create if missing, then recurse
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        mergeOptions(target[key], source[key]);
      } else {
        // Primitive or array: direct assignment
        target[key] = source[key];
      }
    }
  }
};

/**
 * Strips HTML tags from a string, leaving only text content.
 * ECharts uses Canvas rendering and cannot display HTML in axis labels.
 * 
 * @param html - String that may contain HTML tags
 * @returns Plain text with all HTML tags removed
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Calculates the time range (min/max) for the X-axis from series data.
 * Adds padding on both sides for better visualization.
 * 
 * @param seriesData - Array of series data points with timestamps
 * @returns Object with chartMinTime and chartMaxTime in milliseconds
 */
export const calculateTimeRange = (seriesData: any[]): { chartMinTime: number; chartMaxTime: number } => {
  let minTime = Infinity;
  let maxTime = -Infinity;
  
  seriesData.forEach(item => {
    const startTime = item.value[1];
    const endTime = item.value[2];
    if (startTime < minTime) minTime = startTime;
    if (endTime > maxTime) maxTime = endTime;
  });

  // Add padding (5% of time range) on each side for better visualization
  const timeRange = maxTime - minTime;
  const padding = timeRange * CHART_CONFIG.TIME_PADDING_PERCENT;
  
  return {
    chartMinTime: minTime - padding,
    chartMaxTime: maxTime + padding
  };
};

/**
 * Calculates the optimal chart height based on number of rows and minimum row height.
 * Height is capped between MIN_HEIGHT and MAX_HEIGHT constants.
 * 
 * @param rowCount - Number of category rows in the chart
 * @param minRowHeight - Minimum height per row in pixels
 * @returns Calculated height in pixels
 */
export const calculateChartHeight = (rowCount: number, minRowHeight: number): number => {
  return Math.max(
    CHART_CONFIG.MIN_HEIGHT,
    Math.min(CHART_CONFIG.MAX_HEIGHT, rowCount * minRowHeight + 100)
  );
};

/**
 * Calculates the Y-axis zoom end percentage for vertical scrolling.
 * When rows exceed MAX_VISIBLE_ROWS, only show a portion initially.
 * 
 * @param rowCount - Total number of rows
 * @returns End percentage for dataZoom (0-100)
 */
export const calculateYAxisZoomEnd = (rowCount: number): number => {
  const needsScroll = rowCount > CHART_CONFIG.MAX_VISIBLE_ROWS;
  return needsScroll ? (CHART_CONFIG.MAX_VISIBLE_ROWS / rowCount) * 100 : 100;
};

/**
 * Formats a timestamp for display in axis labels using date-fns.
 * 
 * @param timestamp - Time value in milliseconds
 * @param formatString - Format string using date-fns tokens (e.g., "HH:mm:ss", "MM/dd HH:mm", "yyyy-MM-dd HH:mm")
 * @returns Formatted time string
 * 
 * @see https://date-fns.org/docs/format for all available format tokens
 * 
 * @example
 * formatTimeLabel(1234567890000, "HH:mm:ss") // "13:00:00"
 * formatTimeLabel(1234567890000, "MM/dd/yyyy") // "02/13/2009"
 * formatTimeLabel(1234567890000, "MMM d, h:mm a") // "Feb 13, 1:00 PM"
 */
export const formatTimeLabel = (timestamp: number, formatString: string = "HH:mm:ss"): string => {
  try {
    return format(new Date(timestamp), formatString);
  } catch (error) {
    // Fallback to ISO string if format fails
    console.error("Invalid date format string:", formatString, error);
    return new Date(timestamp).toISOString();
  }
};
