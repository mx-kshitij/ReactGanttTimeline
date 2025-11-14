import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { init, graphic, use } from "echarts/core";
import { CustomChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent, DataZoomComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { ApacheGanttTimelineChartContainerProps } from "../typings/ApacheGanttTimelineChartProps";
import "./ui/ApacheGanttTimelineChart.css";

// Register only the components and renderers we need for minimal bundle
use([CustomChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, CanvasRenderer]);

interface CategoryRow {
  name: string;
  isParent: boolean;
}

// Batch size for lazy loading (currently disabled, set to 10 for testing)
// const BATCH_SIZE = 1000;

export function ApacheGanttTimelineChart(props: ApacheGanttTimelineChartContainerProps): ReactElement {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_allItemsLoaded, setAllItemsLoaded] = useState<boolean>(false);

  /**
   * Transform Mendix datasource into ECharts series data.
   * Handles hierarchical parent-child relationships and flat event lists.
   * Processes current items batch and shows progress.
   */
  const transformData = (): { categories: CategoryRow[]; seriesData: any[] } => {
    const categories: CategoryRow[] = [];
    const seriesData: any[] = [];
    let rowIndex = 0;

    console.info("[ApacheGanttTimelineChart] transformData called");
    console.info("[ApacheGanttTimelineChart] itemsDatasource status:", props.itemsDatasource?.status);
    console.info("[ApacheGanttTimelineChart] itemsDatasource limit:", props.itemsDatasource?.limit);
    console.info("[ApacheGanttTimelineChart] itemsDatasource offset:", props.itemsDatasource?.offset);
    console.info("[ApacheGanttTimelineChart] itemsDatasource hasMoreItems:", props.itemsDatasource?.hasMoreItems);
    console.info("[ApacheGanttTimelineChart] items count:", props.itemsDatasource?.items?.length);

    // Validate required props
    if (!props.itemsDatasource?.items || props.itemsDatasource.items.length === 0) {
      if (props.itemsDatasource?.status === "available") {
        console.warn("[ApacheGanttTimelineChart] Datasource is AVAILABLE but returning 0 items. Check your Mendix datasource configuration:");
        console.warn("  - Verify the datasource is bound to the correct entity");
        console.warn("  - Check if the data source (microflow/nanoflow/database) is returning data");
        console.warn("  - Review any filters applied to the datasource");
        console.warn("  - Datasource details:", {
          status: props.itemsDatasource.status,
          limit: props.itemsDatasource.limit,
          offset: props.itemsDatasource.offset,
          hasMoreItems: props.itemsDatasource.hasMoreItems
        });
      }
      console.info("[ApacheGanttTimelineChart] No items in datasource, returning empty");
      setProgress(0);
      return { categories, seriesData };
    }

    const totalItems = props.itemsDatasource.items.length;
    console.info("[ApacheGanttTimelineChart] Processing", totalItems, "items");

    // Update progress at start
    setProgress(10);

    // Collect items and build parent-child hierarchy
    const items = props.itemsDatasource.items || [];
    const itemsMap = new Map<string, any>();
    const parentItems = new Map<string, any[]>();

    // First pass: group items by parent
    items.forEach((item: any, index: number) => {
      const itemId = item.id;
      itemsMap.set(String(itemId), item);

      // Update progress during grouping (10-30%)
      if (index % 100 === 0) {
        const groupProgress = 10 + Math.floor((index / totalItems) * 20);
        setProgress(groupProgress);
      }

      // Check if there's a parent association
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

    setProgress(35);

    // Sort items if sortAttribute is provided
    const sortedItems = props.sortAttribute
      ? items.sort(
          (a: any, b: any) => {
            const aVal = props.sortAttribute?.get(a).value;
            const bVal = props.sortAttribute?.get(b).value;
            const aNum = aVal ? Number(aVal) : 0;
            const bNum = bVal ? Number(bVal) : 0;
            return aNum - bNum;
          }
        )
      : items;

    setProgress(40);

    // Build categories and series data
    const processedParents = new Set<string>();

    sortedItems.forEach((item: any, index: number) => {
      // Update progress during data transformation (40-90%)
      if (index % 100 === 0) {
        const transformProgress = 40 + Math.floor((index / totalItems) * 50);
        setProgress(transformProgress);
      }
      const itemId = item.id;
      
      // For ListAttributeValue, use the get() method on the attribute with the item parameter
      const startDateObj = props.startDatetimeAttribute?.get(item);
      const endDateObj = props.endDatetimeAttribute?.get(item);
      const startDate = startDateObj?.value;
      const endDate = endDateObj?.value;

      // Skip if dates are invalid
      if (!startDate || !endDate) {
        return;
      }

      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();

      if (isNaN(startTime) || isNaN(endTime)) {
        return;
      }

      const durationMin = Math.round((endTime - startTime) / 60000);
      const colorValue = props.colorAttribute ? props.colorAttribute?.get(item).value : undefined;
      const color = colorValue || "#1890ff";

      // If item has a parent and parent hasn't been added yet, add parent row
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

      // Add item as a row
      const displayName = item.displayValue || `Item ${itemId}`;
      categories.push({
        name: displayName,
        isParent: false
      });

      // Add series data point for this event
      seriesData.push({
        name: displayName,
        value: [rowIndex, startTime, endTime, durationMin],
        itemStyle: {
          color: color
        },
        state: "normal",
        startStr: new Date(startDate).toLocaleString(),
        endStr: new Date(endDate).toLocaleString(),
        originalObject: item
      });

      rowIndex++;
    });

    setProgress(95);

    // Check if we have more items to load
    const hasMoreItems = props.itemsDatasource?.hasMoreItems || false;
    if (hasMoreItems) {
      setAllItemsLoaded(false);
    } else {
      setAllItemsLoaded(true);
    }

    setProgress(100);
    console.info("[ApacheGanttTimelineChart] transformData result - categories:", categories.length, "seriesData:", seriesData.length);
    if (seriesData.length > 0) {
      console.info("[ApacheGanttTimelineChart] First series item:", seriesData[0]);
      console.info("[ApacheGanttTimelineChart] First category:", categories[0]);
    }
    return { categories, seriesData };
  };

  /**
   * Initialize or update the ECharts instance.
   */
  const renderChart = () => {
    if (!chartRef.current) {
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      // Get or create chart instance
      if (!chartInstance.current) {
        chartInstance.current = init(chartRef.current);
      }

      const { categories, seriesData } = transformData();

      console.info("[ApacheGanttTimelineChart] renderChart - categories:", categories.length, "seriesData:", seriesData.length);

      // If no data, show placeholder
      if (categories.length === 0 || seriesData.length === 0) {
        console.info("[ApacheGanttTimelineChart] No data, showing placeholder");
        chartInstance.current.clear();
        setIsLoading(false);
        return;
      }

      // Calculate chart height based on number of rows - cap at reasonable height for virtualization
      const rowHeight = 30;
      const minHeight = 400;
      const maxHeight = 800; // Cap height to 800px, users scroll through chart
      const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, categories.length * rowHeight + 100));
      if (chartRef.current) {
        chartRef.current.style.height = `${calculatedHeight}px`;
      }

      // Use provided time range from context or calculate from data
      let chartMinTime: number;
      let chartMaxTime: number;

      if (props.viewStartTimestamp?.value && props.viewEndTimestamp?.value) {
        // Use provided time range from context
        chartMinTime = new Date(props.viewStartTimestamp.value).getTime();
        chartMaxTime = new Date(props.viewEndTimestamp.value).getTime();
        console.info("[ApacheGanttTimelineChart] Using provided time range from context");
        
        // Check if the range is too wide compared to actual data
        if (seriesData.length > 0) {
          let minDataTime = Infinity;
          let maxDataTime = -Infinity;
          seriesData.forEach(item => {
            const startTime = item.value[1];
            const endTime = item.value[2];
            if (startTime < minDataTime) minDataTime = startTime;
            if (endTime > maxDataTime) maxDataTime = endTime;
          });
          const dataRange = maxDataTime - minDataTime;
          const viewRange = chartMaxTime - chartMinTime;
          const ratio = viewRange / dataRange;
          if (ratio > 10) {
            console.warn("[ApacheGanttTimelineChart] WARNING: View range is", ratio.toFixed(1), "times wider than actual data!");
            console.warn("  View range:", new Date(chartMinTime).toLocaleString(), "to", new Date(chartMaxTime).toLocaleString());
            console.warn("  Data range:", new Date(minDataTime).toLocaleString(), "to", new Date(maxDataTime).toLocaleString());
            console.warn("  Consider narrowing your viewStartTimestamp/viewEndTimestamp or leave them empty for auto-calculation");
          }
        }
      } else {
        // Calculate time range from actual data
        let minTime = Infinity;
        let maxTime = -Infinity;
        
        seriesData.forEach(item => {
          const startTime = item.value[1];
          const endTime = item.value[2];
          if (startTime < minTime) minTime = startTime;
          if (endTime > maxTime) maxTime = endTime;
        });

        // Add 5% padding on each side for better visualization
        const timeRange = maxTime - minTime;
        const padding = timeRange * 0.05;
        chartMinTime = minTime - padding;
        chartMaxTime = maxTime + padding;
        console.info("[ApacheGanttTimelineChart] Calculated time range from data");
      }

      console.info("[ApacheGanttTimelineChart] Time range - min:", new Date(chartMinTime).toLocaleString(), "max:", new Date(chartMaxTime).toLocaleString());
      console.info("[ApacheGanttTimelineChart] Building ECharts option with", categories.length, "categories and", seriesData.length, "series items");

      const option: any = {
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
          formatter: (params: any) => {
            if (!params.data) return "";
            const data = params.data;
            return `
              <div style="font-weight: bold; margin-bottom: 6px; color: #fff;">${params.name}</div>
              <div style="line-height: 1.6; color: #ddd;">
                <div>Start: ${data.startStr}</div>
                <div>End: ${data.endStr}</div>
                <div>Duration: <strong>${data.value[3]} min</strong></div>
              </div>
            `;
          }
        },
        dataZoom: [
          {
            type: "slider",
            xAxisIndex: 0,
            filterMode: "weakFilter",
            height: 20,
            bottom: 0,
            start: 0,
            end: 100,
            handleIcon: "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
            handleSize: "80%",
            showDetail: false
          },
          {
            type: "inside",
            xAxisIndex: 0,
            filterMode: "weakFilter",
            start: 0,
            end: 100,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: false
          },
          {
            type: "slider",
            yAxisIndex: 0,
            zoomLock: true,
            width: 10,
            right: 10,
            top: 70,
            bottom: 40,
            start: 0,
            end: 100,
            handleSize: 0,
            showDetail: false
          },
          {
            type: "inside",
            yAxisIndex: 0,
            start: 0,
            end: 100,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: false
          }
        ],
        grid: {
          left: "25%",
          right: "5%",
          top: 50,
          bottom: 40
        },
        xAxis: {
          type: "time",
          min: chartMinTime,
          max: chartMaxTime,
          scale: true,
          axisLabel: {
            formatter: (value: number) => {
              const date = new Date(value);
              return date.getHours() + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0");
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#e8e8e8",
              type: "dashed"
            }
          }
        },
        yAxis: {
          type: "category",
          data: categories.map(c => c.name),
          axisLabel: {
            formatter: (value: string, index: number) => {
              const cat = categories[index];
              if (cat && cat.isParent) {
                return "{parent|" + value + "}";
              }
              return "{child|" + value + "}";
            },
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
          }
        },
        series: [
          {
            type: "custom",
            renderItem: (params: any, api: any) => {
              const categoryIndex = api.value(0);
              const startTime = api.value(1);
              const endTime = api.value(2);
              const duration = api.value(3);
              
              const start = api.coord([startTime, categoryIndex]);
              const end = api.coord([endTime, categoryIndex]);
              const height = api.size([0, 1])[1] * 0.6;

              // Calculate bar width and apply minimum
              let barWidth = end[0] - start[0];
              const minWidth = props.minBarWidth || 2;
              if (barWidth < minWidth) {
                barWidth = minWidth;
              }

              if (params.dataIndex === 0) {
                console.info("[ApacheGanttTimelineChart] renderItem #0 - categoryIndex:", categoryIndex, "startTime:", startTime, "endTime:", endTime, "duration:", duration);
                console.info("[ApacheGanttTimelineChart] renderItem #0 - start coord:", start, "end coord:", end, "height:", height);
                console.info("[ApacheGanttTimelineChart] renderItem #0 - calculated width:", end[0] - start[0], "applied width:", barWidth, "minWidth:", minWidth);
                console.info("[ApacheGanttTimelineChart] renderItem #0 - color:", api.visual("color"));
              }

              const rectShape = graphic.clipRectByRect(
                {
                  x: start[0],
                  y: start[1] - height / 2,
                  width: barWidth,
                  height: height
                },
                {
                  x: params.coordSys.x,
                  y: params.coordSys.y,
                  width: params.coordSys.width,
                  height: params.coordSys.height
                }
              );

              return (
                rectShape && {
                  type: "group",
                  children: [
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
                    {
                      type: "text",
                      style: {
                        text: api.value(3) + "m",
                        x: start[0] + barWidth / 2,
                        y: start[1],
                        fill: "#fff",
                        fontSize: 10,
                        fontWeight: "bold",
                        textAlign: "center",
                        textVerticalAlign: "middle"
                      }
                    }
                  ]
                }
              );
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: seriesData
          }
        ]
      };

      console.info("[ApacheGanttTimelineChart] Calling setOption on ECharts instance");
      chartInstance.current.setOption(option, { notMerge: false });
      console.info("[ApacheGanttTimelineChart] setOption complete");
      setIsLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Chart render error: ${errorMsg}`);
      console.error("ApacheGanttTimelineChart error:", err);
      setIsLoading(false);
    }
  };

  /**
   * Initialize datasource - removed limit for now to show all data.
   */
  useEffect(() => {
    if (props.itemsDatasource) {
      console.info("[ApacheGanttTimelineChart] Init effect - datasource status:", props.itemsDatasource.status, "items:", props.itemsDatasource.items?.length);
    }
  }, []); // Empty dependency - only on mount

  /**
   * Lifecycle: initialize chart and watch for prop changes.
   */
  useEffect(() => {
    renderChart();

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
   * Cleanup: dispose chart on unmount.
   */
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="apache-gantt-timeline-chart-container">
      {error && <div className="error-banner">{error}</div>}
      {isLoading && (
        <div className="progress-bar-container">
          <div className="progress-bar-label">Loading and processing data... {progress}%</div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div ref={chartRef} className="apache-gantt-chart" />
    </div>
  );
}
