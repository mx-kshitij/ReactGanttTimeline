/**
 * ECharts Options Configuration
 * 
 * Builds the complete ECharts configuration object for the Gantt timeline chart.
 * Includes tooltip, dataZoom, grid, axes, and series configuration.
 */

import { graphic } from "echarts/core";
import { CategoryRow } from "./dataTransformer";
import { CHART_CONFIG, stripHtmlTags, formatTimeLabel } from "./chartHelpers";

/**
 * Parameters for building chart options
 */
export interface ChartOptionsParams {
  categories: CategoryRow[];
  seriesData: any[];
  chartMinTime: number;
  chartMaxTime: number;
  yAxisZoomEnd: number;
  minBarWidth: number;
  timeFormat?: string;
  containerWidth?: number;
}

/**
 * Builds the complete ECharts configuration object.
 * 
 * @param params - Configuration parameters including categories, series data, and settings
 * @returns ECharts option configuration object
 */
export const buildChartOptions = (params: ChartOptionsParams): any => {
  const { categories, seriesData, chartMinTime, chartMaxTime, yAxisZoomEnd, minBarWidth, timeFormat = "HH:mm:ss", containerWidth } = params;

  // Calculate Y-axis label width based on container width (15% of container, matching grid.left)
  // Fallback to 150px if containerWidth not provided
  const yAxisLabelWidth = containerWidth ? Math.floor(containerWidth * 0.15) - 20 : 150;

  return {
    // Tooltip configuration - shown on hover over timeline bars and axis labels
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(50, 50, 50, 0.9)",
      borderColor: "#333",
      borderWidth: 1,
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      padding: [8, 12],
      // Show tooltip on axis labels to display full text
      axisPointer: {
        type: "none"
      },
      formatter: (tooltipParams: any) => {
        // Handle Y-axis label hover to show full text
        if (tooltipParams.componentType === "yAxis") {
          return tooltipParams.value;
        }
        
        if (!tooltipParams.data) return "";
        const data = tooltipParams.data;
        
        // Use custom tooltip HTML if provided, otherwise use default format
        if (data.tooltipHTML) {
          return data.tooltipHTML;
        }
        
        // Default tooltip format with start/end times and duration
        return `
          <div style="font-weight: bold; margin-bottom: 6px; color: #fff;">${tooltipParams.name}</div>
          <div style="line-height: 1.6; color: #ddd;">
            <div>Start: ${data.startStr}</div>
            <div>End: ${data.endStr}</div>
            <div>Duration: <strong>${data.value[3]} min</strong></div>
          </div>
        `;
      }
    },

    // DataZoom controls for scrolling and zooming
    dataZoom: [
      // Horizontal slider at bottom for X-axis (time) navigation
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "weakFilter",
        height: 20,
        top: 0,
        start: 0,
        end: 100,
        handleIcon: "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        showDetail: false
      },
      // Horizontal inside zoom for mouse drag on X-axis
      {
        type: "inside",
        xAxisIndex: 0,
        filterMode: "weakFilter",
        start: 0,
        end: 100,
        zoomOnMouseWheel: false,  // Disable zoom, only allow panning
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      },
      // Vertical slider on right for Y-axis (row) navigation
      {
        type: "slider",
        yAxisIndex: 0,
        zoomLock: true,  // Lock zoom level, only allow scrolling
        width: 10,
        right: 10,
        top: 70,
        bottom: 40,
        start: 0,
        end: yAxisZoomEnd,  // Show only first N rows initially if many rows
        handleSize: 0,
        showDetail: false
      },
      // Vertical inside zoom for mouse wheel scrolling on Y-axis
      {
        type: "inside",
        yAxisIndex: 0,
        start: 0,
        end: yAxisZoomEnd,
        zoomOnMouseWheel: false,  // Disable zoom on wheel
        moveOnMouseMove: true,
        moveOnMouseWheel: true,   // Enable scroll on wheel
        orient: "vertical"
      }
    ],

    // Grid configuration - defines chart plotting area
    grid: {
      left: "15%",   // Space for Y-axis labels
      right: "5%",   // Space for vertical scrollbar
      top: 50,       // Space for title/legend
      bottom: 40     // Space for X-axis and horizontal scrollbar
    },

    // X-Axis configuration - time axis (horizontal)
    xAxis: {
      type: "time",
      min: chartMinTime,
      max: chartMaxTime,
      scale: true,
      axisLabel: {
        formatter: (value: number) => formatTimeLabel(value, timeFormat)
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e8e8e8",
          type: "dashed"
        }
      }
    },

    // Y-Axis configuration - category axis for rows (vertical)
    yAxis: {
      type: "category",
      data: categories.map(c => c.name),
      axisLabel: {
        // Enable text overflow handling with ellipsis
        overflow: "truncate",
        ellipsis: "...",
        width: yAxisLabelWidth,  // Calculated based on container width
        formatter: (value: string, index: number) => {
          const cat = categories[index];
          // Strip HTML tags since ECharts Canvas rendering cannot display HTML
          const strippedValue = stripHtmlTags(value);
          
          // Apply different styling for parent vs child rows
          if (cat && cat.isParent) {
            return "{parent|" + strippedValue + "}";
          }
          return "{child|" + strippedValue + "}";
        },
        // Rich text styles for parent and child rows
        rich: {
          parent: {
            fontWeight: "bold",
            fontSize: 13,
            color: "#1890ff",
            backgroundColor: "#e6f7ff",
            padding: [4, 8],
            borderRadius: 4
          } as any,
          child: {
            fontSize: 11,
            color: "#595959",
            padding: [2, 8, 2, 20]
          } as any
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#f0f0f0"
        }
      },
      // Enable tooltip on Y-axis to show full label text
      triggerEvent: true
    },

    // Series configuration - custom rendered timeline bars
    series: [
      {
        type: "custom",
        renderItem: (renderParams: any, api: any) => {
          // Extract data for this timeline bar
          const categoryIndex = api.value(0);  // Y position (row index)
          const startTime = api.value(1);      // Start timestamp
          const endTime = api.value(2);        // End timestamp
          const durationMin = api.value(3);    // Duration in minutes
          
          // Get custom bar label from data if available
          const dataIndex = renderParams.dataIndex;
          const barLabel = seriesData[dataIndex]?.barLabel;
          const labelText = barLabel || `${durationMin}m`;
          
          // Convert data coordinates to pixel coordinates
          const start = api.coord([startTime, categoryIndex]);
          const end = api.coord([endTime, categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;  // Bar height as 60% of row height

          // Calculate bar width with minimum width enforcement
          let barWidth = end[0] - start[0];
          const minWidth = minBarWidth || CHART_CONFIG.DEFAULT_MIN_BAR_WIDTH;
          if (barWidth < minWidth) {
            barWidth = minWidth;
          }

          // Clip the bar shape to the visible chart area
          const rectShape = graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
              width: barWidth,
              height: height
            },
            {
              x: renderParams.coordSys.x,
              y: renderParams.coordSys.y,
              width: renderParams.coordSys.width,
              height: renderParams.coordSys.height
            }
          );

          // Determine if label should be inside or outside the bar
          // Estimate text width (roughly 6px per character for 10px font)
          const estimatedTextWidth = labelText.length * 6;
          const shouldShowLabelOutside = barWidth < estimatedTextWidth + 10; // 10px padding
          
          // Position label inside or above the bar based on width
          // If too narrow, show above to avoid overlap with adjacent bars
          const labelX = shouldShowLabelOutside 
            ? start[0] + barWidth / 2  // Centered above bar
            : start[0] + barWidth / 2;  // Centered in bar
          
          const labelY = shouldShowLabelOutside
            ? start[1] - height / 2 - 5  // 5px above the bar
            : start[1];  // Vertically centered in bar
          
          const labelAlign = "center";
          const labelFill = shouldShowLabelOutside ? "#333" : "#fff";

          // Return the rendered bar with duration label
          return (
            rectShape && {
              type: "group",
              children: [
                // The colored bar rectangle
                {
                  type: "rect",
                  transition: ["shape"],
                  shape: rectShape,
                  style: {
                    fill: api.visual("color"),
                    stroke: "#fff",
                    lineWidth: 1,
                    opacity: 0.9
                  }
                },
                // Duration text label inside or above the bar
                {
                  type: "text",
                  style: {
                    text: labelText,
                    x: labelX,
                    y: labelY,
                    fill: labelFill,
                    fontSize: 10,
                    fontWeight: "bold",
                    textAlign: labelAlign,
                    textVerticalAlign: "middle"
                  }
                }
              ]
            }
          );
        },
        encode: {
          x: [1, 2],  // Use values 1 and 2 for X-axis (start and end time)
          y: 0        // Use value 0 for Y-axis (row index)
        },
        data: seriesData
      }
    ]
  };
};
