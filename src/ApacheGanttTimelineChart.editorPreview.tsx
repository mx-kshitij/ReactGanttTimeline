import { ReactElement, createElement } from "react";
import { ApacheGanttTimelineChartPreviewProps } from "../typings/ApacheGanttTimelineChartProps";

export function preview(props: ApacheGanttTimelineChartPreviewProps): ReactElement {
  // Show a simple preview message in Studio Pro
  const isConfigured = props.itemsDatasource && props.startDatetimeAttribute && props.endDatetimeAttribute && props.itemUuidAttribute;

  return (
    <div className="apache-gantt-timeline-chart-preview">
      {isConfigured ? (
        <div className="apache-gantt-preview-configured">
          <p className="apache-gantt-preview-title">📊 Apache Gantt Timeline Chart</p>
          <p className="apache-gantt-preview-subtitle">
            Data source configured. Chart will render at runtime.
          </p>
        </div>
      ) : (
        <div className="apache-gantt-preview-error">
          <p className="apache-gantt-preview-error-title">⚠️ Configuration Required</p>
          <p className="apache-gantt-preview-error-message">
            Please configure: Items datasource, Item UUID attribute, Start datetime, and End datetime.
          </p>
        </div>
      )}
    </div>
  );
}

export function getPreviewCss(): string {
  return require("./ui/ApacheGanttTimelineChart.css");
}
