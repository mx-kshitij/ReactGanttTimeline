import { ReactElement, createElement } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { formatTimeLabel } from "../utils/chartHelpers";

export interface DateRangeFilterProps {
  minTime: number;
  maxTime: number;
  currentRange: { min: number; max: number };
  timeFormat: string;
  onRangeChange: (range: { min: number; max: number }) => void;
}

/**
 * Date Range Filter Component
 * 
 * Provides dual-handle range slider for date range filtering on the Gantt chart.
 * Filters data by start and end timestamps.
 */
export const DateRangeFilter = (props: DateRangeFilterProps): ReactElement => {
  const { minTime, maxTime, currentRange, timeFormat, onRangeChange } = props;

  const handleRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      onRangeChange({ min: value[0], max: value[1] });
    }
  };

  const handleReset = () => {
    onRangeChange({ min: minTime, max: maxTime });
  };

  return (
    <div className="gantt-date-filter">
      <div className="gantt-date-filter-header">
        <span className="gantt-date-filter-title">Filter Date Range</span>
        <button className="gantt-date-filter-reset" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="gantt-date-filter-controls">
        <span className="gantt-date-filter-value">
          {formatTimeLabel(currentRange.min, timeFormat)}
        </span>
        <div className="gantt-date-filter-slider-container">
          <Slider
            range
            min={minTime}
            max={maxTime}
            value={[currentRange.min, currentRange.max]}
            onChange={handleRangeChange}
            className="gantt-date-filter-range-slider"
          />
        </div>
        <span className="gantt-date-filter-value">
          {formatTimeLabel(currentRange.max, timeFormat)}
        </span>
      </div>
    </div>
  );
};
