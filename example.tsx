import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const HierarchicalGanttChart = () => {
  const chartRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '2024-04-23', to: '2024-04-23' });

  // Sample data structure: parent-child hierarchy with time-based activities
  const alarmData = [
    {
      parent: 'System 1 - Transfer Alarms',
      zone: 0,
      events: [
        { start: '2024-04-23 02:00:00', end: '2024-04-23 03:30:00', state: 'warning' },
        { start: '2024-04-23 05:00:00', end: '2024-04-23 06:15:00', state: 'critical' }
      ],
      children: [
        {
          name: '773 - Alarm: P40200 Sensor 01 - Wrong State - Occupied!',
          zone: 0,
          events: [
            { start: '2024-04-23 01:05:00', end: '2024-04-23 01:58:00', state: 'critical' },
            { start: '2024-04-23 03:15:00', end: '2024-04-23 03:37:00', state: 'critical' },
            { start: '2024-04-23 07:10:00', end: '2024-04-23 07:22:00', state: 'warning' }
          ]
        },
        {
          name: '928 - Alarm: P72200 Sensor 01 - Wrong State - Occupied!',
          zone: 1,
          events: [
            { start: '2024-04-23 02:39:00', end: '2024-04-23 02:49:00', state: 'critical' }
          ]
        },
        {
          name: '898 - Alarm: P72100 Transfer Timeout Recving Unit - From Previous Element',
          zone: 2,
          events: [
            { start: '2024-04-23 01:18:00', end: '2024-04-23 01:35:00', state: 'warning' },
            { start: '2024-04-23 01:35:00', end: '2024-04-23 01:45:00', state: 'info' },
            { start: '2024-04-23 04:20:00', end: '2024-04-23 04:29:00', state: 'warning' },
            { start: '2024-04-23 08:12:00', end: '2024-04-23 08:51:00', state: 'critical' }
          ]
        }
      ]
    },
    {
      parent: 'System 2 - Info Messages',
      zone: 3,
      events: [
        { start: '2024-04-23 01:00:00', end: '2024-04-23 02:30:00', state: 'info' }
      ],
      children: [
        {
          name: '855 - Info: P70400 Transfer is blocked by partner element',
          zone: 3,
          events: [
            { start: '2024-04-23 00:04:00', end: '2024-04-23 00:14:00', state: 'info' },
            { start: '2024-04-23 00:37:00', end: '2024-04-23 01:04:00', state: 'info' },
            { start: '2024-04-23 06:15:00', end: '2024-04-23 06:28:00', state: 'info' },
            { start: '2024-04-23 06:51:00', end: '2024-04-23 07:09:00', state: 'warning' }
          ]
        }
      ]
    },
    {
      parent: 'System 3 - Transfer Timeout',
      zone: 4,
      events: [
        { start: '2024-04-23 00:30:00', end: '2024-04-23 01:00:00', state: 'critical' },
        { start: '2024-04-23 03:00:00', end: '2024-04-23 04:30:00', state: 'warning' }
      ],
      children: [
        {
          name: '554 - Alarm: P30300 Transfer Timeout Descrambler - Row Split Conveyor',
          zone: 4,
          events: [
            { start: '2024-04-23 01:28:00', end: '2024-04-23 02:39:00', state: 'critical' },
            { start: '2024-04-23 02:39:00', end: '2024-04-23 03:06:00', state: 'warning' },
            { start: '2024-04-23 03:43:00', end: '2024-04-23 04:05:00', state: 'warning' },
            { start: '2024-04-23 04:15:00', end: '2024-04-23 04:17:00', state: 'info' }
          ]
        },
        {
          name: '602 - Alarm: P30310 Transfer Search Timeout Cross Conveyer sensor 02',
          zone: 5,
          events: [
            { start: '2024-04-23 01:22:00', end: '2024-04-23 02:06:00', state: 'critical' },
            { start: '2024-04-23 02:08:00', end: '2024-04-23 02:26:00', state: 'warning' },
            { start: '2024-04-23 05:12:00', end: '2024-04-23 05:20:00', state: 'warning' },
            { start: '2024-04-23 08:08:00', end: '2024-04-23 08:20:00', state: 'warning' },
            { start: '2024-04-23 09:33:00', end: '2024-04-23 09:57:00', state: 'critical' }
          ]
        },
        {
          name: '601 - Alarm: P30310 Transfer Search Timeout Cross Conveyer sensor 01',
          zone: 6,
          events: [
            { start: '2024-04-23 01:22:00', end: '2024-04-23 02:06:00', state: 'critical' },
            { start: '2024-04-23 02:25:00', end: '2024-04-23 02:35:00', state: 'warning' },
            { start: '2024-04-23 05:08:00', end: '2024-04-23 05:18:00', state: 'warning' },
            { start: '2024-04-23 09:33:00', end: '2024-04-23 09:57:00', state: 'critical' }
          ]
        }
      ]
    },
    {
      parent: 'System 4 - Conveyor Alarms',
      zone: 7,
      events: [
        { start: '2024-04-23 00:00:00', end: '2024-04-23 00:45:00', state: 'info' },
        { start: '2024-04-23 07:00:00', end: '2024-04-23 08:30:00', state: 'critical' }
      ],
      children: [
        {
          name: '812 - Alarm: P70100 Transfer Timeout Recving Unit - From Upper Previous Elem',
          zone: 7,
          events: [
            { start: '2024-04-23 00:55:00', end: '2024-04-23 01:56:00', state: 'critical' },
            { start: '2024-04-23 04:18:00', end: '2024-04-23 05:10:00', state: 'warning' },
            { start: '2024-04-23 05:18:00', end: '2024-04-23 05:43:00', state: 'warning' },
            { start: '2024-04-23 06:09:00', end: '2024-04-23 06:40:00', state: 'critical' }
          ]
        },
        {
          name: '641 - Alarm: P30400 Fault on Item Over Edge In SafeRun',
          zone: 0,
          events: [
            { start: '2024-04-23 02:33:00', end: '2024-04-23 03:12:00', state: 'critical' },
            { start: '2024-04-23 03:57:00', end: '2024-04-23 04:34:00', state: 'warning' },
            { start: '2024-04-23 05:15:00', end: '2024-04-23 05:32:00', state: 'warning' },
            { start: '2024-04-23 06:09:00', end: '2024-04-23 06:22:00', state: 'info' }
          ]
        }
      ]
    }
  ];

  const stateColors = {
    critical: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',
    resolved: '#52c41a'
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    // Filter data based on selected zone
    const filteredData = alarmData.map(parent => ({
      ...parent,
      children: selectedZone === 'all' 
        ? parent.children 
        : parent.children.filter(child => child.zone === parseInt(selectedZone))
    })).filter(parent => {
      // Keep parent if it has matching zone or has children
      if (selectedZone === 'all') return true;
      return parent.zone === parseInt(selectedZone) || parent.children.length > 0;
    });    // Prepare data for ECharts
    const categories = [];
    const seriesData = [];
    let rowIndex = 0;

    filteredData.forEach((parent, parentIdx) => {
      // Add parent row
      categories.push({
        name: parent.parent,
        isParent: true
      });

      // Add parent events if they exist
      if (parent.events && parent.events.length > 0) {
        parent.events.forEach((event, eventIdx) => {
          const startTime = new Date(event.start).getTime();
          const endTime = new Date(event.end).getTime();
          const duration = Math.round((endTime - startTime) / 60000); // duration in minutes

          seriesData.push({
            name: parent.parent,
            value: [
              rowIndex,
              startTime,
              endTime,
              duration
            ],
            itemStyle: {
              color: stateColors[event.state]
            },
            state: event.state,
            startStr: event.start,
            endStr: event.end
          });
        });
      }

      rowIndex++;

      // Add children rows and their events
      parent.children.forEach((child, childIdx) => {
        categories.push({
          name: child.name,
          isParent: false
        });

        child.events.forEach((event, eventIdx) => {
          const startTime = new Date(event.start).getTime();
          const endTime = new Date(event.end).getTime();
          const duration = Math.round((endTime - startTime) / 60000); // duration in minutes

          seriesData.push({
            name: child.name,
            value: [
              rowIndex,
              startTime,
              endTime,
              duration
            ],
            itemStyle: {
              color: stateColors[event.state]
            },
            state: event.state,
            startStr: event.start,
            endStr: event.end
          });
        });

        rowIndex++;
      });
    });

    const option = {
      tooltip: {
        formatter: function (params) {
          const data = params.data;
          return `
            <strong>${params.name}</strong><br/>
            Start: ${data.startStr}<br/>
            End: ${data.endStr}<br/>
            Duration: ${data.value[3]} minutes<br/>
            State: <span style="color: ${data.itemStyle.color}">${data.state}</span>
          `;
        }
      },
      grid: {
        left: '25%',
        right: '5%',
        top: 70,
        bottom: 40
      },
      xAxis: {
        type: 'time',
        min: new Date(dateRange.from + ' 00:00:00').getTime(),
        max: new Date(dateRange.to + ' 23:59:59').getTime(),
        axisLabel: {
          formatter: function (value) {
            const date = new Date(value);
            return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e8e8e8',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: categories.map(c => c.name),
        axisLabel: {
          formatter: function (value, index) {
            const cat = categories[index];
            if (cat && cat.isParent) {
              return '{parent|' + value + '}';
            }
            return '{child|' + value + '}';
          },
          rich: {
            parent: {
              fontWeight: 'bold',
              fontSize: 13,
              color: '#1890ff',
              backgroundColor: '#e6f7ff',
              padding: [4, 8],
              borderRadius: 4
            },
            child: {
              fontSize: 11,
              color: '#595959',
              padding: [2, 8, 2, 20]
            }
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          type: 'custom',
          renderItem: function (params, api) {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(1), categoryIndex]);
            const end = api.coord([api.value(2), categoryIndex]);
            const height = api.size([0, 1])[1] * 0.6;

            const rectShape = echarts.graphic.clipRectByRect(
              {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
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
                type: 'group',
                children: [
                  {
                    type: 'rect',
                    transition: ['shape'],
                    shape: rectShape,
                    style: api.style({
                      fill: api.visual('color')
                    })
                  },
                  {
                    type: 'text',
                    style: {
                      text: api.value(3) + 'm',
                      x: start[0] + (end[0] - start[0]) / 2,
                      y: start[1],
                      fill: '#fff',
                      fontSize: 10,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textVerticalAlign: 'middle'
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

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [selectedZone, dateRange]);

  return (
    <div className="w-full h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Zone Filter:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-4 py-1.5 text-sm rounded ${selectedZone === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All Zones
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone.toString())}
                className={`px-3 py-1.5 text-sm rounded ${selectedZone === zone.toString()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Zone {zone}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: stateColors.critical }}></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: stateColors.warning }}></span>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: stateColors.info }}></span>
            <span>Info</span>
          </div>
        </div>
        </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alarm Timeline</h2>
        <div ref={chartRef} style={{ width: '100%', height: '700px' }} />
      </div>
    </div>
  );
};export default HierarchicalGanttChart;