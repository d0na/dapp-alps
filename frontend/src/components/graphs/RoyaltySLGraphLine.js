import React from "react";
import { ResponsiveLine } from "@nivo/line";

let dataTemplate = [
  {
    id: "japan",
    color: "hsl(259, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 1,
      },
      {
        x: "helicopter",
        y: 297,
      },
    ],
  },
];

function transformData(managerData) {
  let transformedData = [];
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (managerData.length != 0) {
    for (let k = 0; k < managerData.length; k++) {
      transformedData.push({
        id: managerData[k].managerAddress,
        data: [],
      });

      for (let i = 0; i < managerData[k].royaltyData.length - 2; i = i + 3) {
        // let month = months[new Date(managerData[k].royaltyData[i + 1] *1000).getMonth()];
        transformedData[k].data.push({
          x: new Date(managerData[k].royaltyData[i + 1] * 1000), //.toISOString().slice(0,10),
          y: managerData[k].royaltyData[i],
        });
      }
      transformedData[k].data.sort((a, b) => a.x - b.x);
      for (let i = 0; i < transformedData[k].data.length; i++) {
        transformedData[k].data[i].x = transformedData[k].data[i].x;
          // .toISOString()
          // .slice(0, 10);
      }
    }
  }
  console.log("gr data", transformedData);
  return transformedData;
}
export const RoyaltySlGraphLine = ({ data /* see data tab */ }) => (
  <ResponsiveLine
    data={transformData(data)}
    margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
    // xScale={{ type: "point" }}
    colors={{ scheme: 'dark2' }}
    xScale={{
      type: "time",
      format: "%Y-%m-%d",
    }}
    xFormat="time:%Y-%m-%d"
    yScale={{
      type: "linear",
      min: "0",
      max: "auto",
      stacked: false,
      reverse: false,
    }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      orient:'bottom',
      format: "%b %d",
      legend: "Royalty Issue Date",
      legendOffset: 36,
      legendPosition: "middle",
    }}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Royalty Value (in $)",
      legendOffset: -45,
      legendPosition: "middle",
    }}
    // enableArea={true}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabelYOffset={-12}
    useMesh={true}
    legends={[
      {
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: "left-to-right",
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: "circle",
        symbolBorderColor: "rgba(0, 0, 0, .5)",
        effects: [
          {
            on: "hover",
            style: {
              itemBackground: "rgba(0, 0, 0, .03)",
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
  />
);
