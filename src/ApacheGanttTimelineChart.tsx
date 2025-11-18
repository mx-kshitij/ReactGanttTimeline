import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { init, use } from "echarts/core";
import { CustomChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent, DataZoomComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { ApacheGanttTimelineChartContainerProps } from "../typings/ApacheGanttTimelineChartProps";
import {
  CHART_CONFIG,
  mergeOptions,
  calculateTimeRange,
  calculateChartHeight,
  calculateYAxisZoomEnd
} from "./utils/chartHelpers";
import { transformData } from "./utils/dataTransformer";
import { buildChartOptions } from "./utils/chartOptions";
import "./ui/ApacheGanttTimelineChart.css";

/**
 * Register ECharts components for minimal bundle size.
 * Only include what we actually use in the chart.
 */
use([CustomChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, CanvasRenderer]);

/**
 * Apache Gantt Timeline Chart Widget
 * 
 * A Mendix pluggable widget that renders timeline/Gantt chart using ECharts.
 * Supports hierarchical parent-child relationships, custom tooltips, row labels,
 * and advanced configuration through JSON options.
 * 
 * Key Features:
 * - Timeline visualization with customizable bars
 * - Vertical and horizontal scrolling/zooming
 * - Parent-child hierarchical grouping
 * - Custom HTML tooltips
 * - Configurable row heights and bar widths
 * - Click actions on timeline items
 * - JSON-based advanced configuration
 */
export function ApacheGanttTimelineChart(props: ApacheGanttTimelineChartContainerProps): ReactElement {
  // ========== Refs ==========
  /** Reference to the DOM element that contains the chart */
  const chartRef = useRef<HTMLDivElement>(null);
  
  /** Reference to the ECharts instance */
  const chartInstance = useRef<any>(null);
  
  /** Map of rowIndex to Mendix ObjectItem for click event handling */
  const itemsMapRef = useRef<Map<number, any>>(new Map());

  // ========== State ==========
  /** Error message to display to the user */
  const [error, setError] = useState<string>("");
  
  /** Loading progress percentage (0-100) */
  const [progress, setProgress] = useState<number>(0);
  
  /** Whether the chart is currently loading/processing data */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /** Whether all items from datasource have been loaded (for potential lazy loading) */
  const [_allItemsLoaded, setAllItemsLoaded] = useState<boolean>(false);

  // ========== Helper Functions ==========

  /**
   * Updates the loading progress state.
   * Progress is displayed as a percentage bar to the user.
   * 
   * @param value - Progress percentage (0-100)
   */
  const updateProgress = (value: number): void => {
    setProgress(value);
  };

  // ========== Chart Rendering ==========

  /**
   * Initializes or updates the ECharts instance with current data and configuration.
   * 
   * This function:
   * 1. Validates container dimensions
   * 2. Transforms Mendix data into ECharts format
   * 3. Calculates chart height and time range
   * 4. Builds ECharts option configuration
   * 5. Applies custom JSON options if provided
   * 6. Sets up click event handlers
   * 7. Handles errors gracefully
   */
  const renderChart = () => {
    if (!chartRef.current) {
      return;
    }

    // Validate container has valid dimensions before initializing ECharts
    // This prevents the "Can't get DOM width or height" warning
    const containerWidth = chartRef.current.clientWidth;
    const containerHeight = chartRef.current.clientHeight;
    
    if (containerWidth === 0 || containerHeight === 0) {
      // Container not ready yet, skip rendering and wait for next cycle
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      // Initialize ECharts instance if not already created
      if (!chartInstance.current) {
        chartInstance.current = init(chartRef.current);
      }

      // Transform Mendix datasource into ECharts format using extracted utility
      const { categories, seriesData } = transformData(props, itemsMapRef, updateProgress, setAllItemsLoaded);

      // Early return if no data available
      if (categories.length === 0 || seriesData.length === 0) {
        chartInstance.current.clear();
        setIsLoading(false);
        return;
      }

      // ===== Calculate chart dimensions and scroll behavior =====
      const minRowHeight = props.minRowHeight || CHART_CONFIG.DEFAULT_MIN_ROW_HEIGHT;
      const rowCount = categories.length;
      const yAxisZoomEnd = calculateYAxisZoomEnd(rowCount);
      
      // Set chart container height dynamically based on row count
      const calculatedHeight = calculateChartHeight(rowCount, minRowHeight);
      if (chartRef.current) {
        chartRef.current.style.height = `${calculatedHeight}px`;
      }

      // ===== Determine X-axis time range =====
      let chartMinTime: number;
      let chartMaxTime: number;

      if (props.viewStartTimestamp?.value && props.viewEndTimestamp?.value) {
        // Use provided time range from widget configuration
        chartMinTime = new Date(props.viewStartTimestamp.value).getTime();
        chartMaxTime = new Date(props.viewEndTimestamp.value).getTime();
      } else {
        // Calculate time range from actual data with padding
        const timeRange = calculateTimeRange(seriesData);
        chartMinTime = timeRange.chartMinTime;
        chartMaxTime = timeRange.chartMaxTime;
      }

      // ===== Build ECharts Configuration using extracted utility =====
      const minBarWidth = props.minBarWidth || CHART_CONFIG.DEFAULT_MIN_BAR_WIDTH;
      const timeFormat = props.timeFormat?.value || "HH:mm:ss";
      const containerWidth = chartRef.current?.clientWidth || 0;
      const option: any = buildChartOptions({
        categories,
        seriesData,
        chartMinTime,
        chartMaxTime,
        yAxisZoomEnd,
        minBarWidth,
        timeFormat,
        containerWidth
      });

      // ===== Apply Custom JSON Options =====
      // Allow users to override/extend default options via JSON configuration
      if (props.chartOptionsJSON?.value) {
        try {
          const customOptions = JSON.parse(props.chartOptionsJSON.value);
          mergeOptions(option, customOptions);
        } catch (parseError) {
          console.error("Failed to parse chartOptionsJSON:", parseError);
          setError("Invalid JSON in chart options configuration");
        }
      }

      // Apply the configuration to the chart
      chartInstance.current.setOption(option, { notMerge: false });
      
      // ===== Resize Chart =====
      // Ensure chart fits properly within container after option update
      setTimeout(() => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      }, 0);
      
      // ===== Setup Click Event Handler =====
      chartInstance.current.off('click');  // Remove any previous handlers
      chartInstance.current.on('click', (params: any) => {
        // Handle clicks on timeline bars
        if (params.componentType === 'series' && params.data && params.data.rowIndex !== undefined) {
          // Retrieve the Mendix ObjectItem using the stored rowIndex
          const clickedItem = itemsMapRef.current.get(params.data.rowIndex);
          if (clickedItem && props.onClickAction) {
            const action = props.onClickAction.get(clickedItem);
            if (action.canExecute) {
              action.execute();
            }
          }
        }
      });
      
      setIsLoading(false);
    } catch (err) {
      // Handle any errors during rendering
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Chart render error: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  // ========== Lifecycle Hooks ==========

  /**
   * Effect: Render chart when props change
   * 
   * Re-renders the chart whenever any relevant prop changes.
   * Also sets up window resize handler to keep chart responsive.
   * 
   * Dependencies: All props that affect chart rendering
   */
  useEffect(() => {
    renderChart();

    // Handle window resize to keep chart responsive
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    props.itemsDatasource,
    props.startDatetimeAttribute,
    props.endDatetimeAttribute,
    props.itemUuidAttribute,
    props.parentUuidAttribute,
    props.sortAttribute,
    props.colorAttribute,
    props.viewStartTimestamp,
    props.viewEndTimestamp
  ]);

  /**
   * Effect: Cleanup on unmount
   * 
   * Disposes the ECharts instance when the component unmounts
   * to prevent memory leaks.
   */
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // ========== Render ==========
  return (
    <div className="apache-gantt-timeline-chart-container">
      {/* Error banner - shown when there's an error */}
      {error && <div className="error-banner">{error}</div>}
      
      {/* Loading progress bar - shown during data transformation */}
      {isLoading && (
        <div className="progress-bar-container">
          <div className="progress-bar-label">Loading and processing data... {progress}%</div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      
      {/* Chart container - ECharts will be initialized here */}
      <div ref={chartRef} className="apache-gantt-chart" />
    </div>
  );
}
