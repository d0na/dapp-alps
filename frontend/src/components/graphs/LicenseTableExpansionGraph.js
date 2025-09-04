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

function transformData(managerData, managerAddress) {
  let transformedData = [];
    // console.log("transformdata var", managerData, managerAddress)

  if (managerData.length != 0) {
    for (let k = 0; k < managerData.length; k++) {
      if (managerData[k].managerAddress === managerAddress) {
        transformedData.push({
          id: managerData[k].managerAddress,
          data: [],
        });

        for (let i = 0; i < managerData[k].royaltyData.length - 2; i = i + 3) {
          // let month = months[new Date(managerData[k].royaltyData[i + 1] *1000).getMonth()];
          transformedData[0].data.push({
            x: new Date(managerData[k].royaltyData[i + 1] * 1000), //.toISOString().slice(0,10),
            y: managerData[k].royaltyData[i],
          });
        }
        transformedData[0].data.sort((a, b) => a.x - b.x);
        for (let i = 0; i < transformedData[0].data.length; i++) {
          transformedData[0].data[i].x = transformedData[0].data[i].x
            .toISOString()
            .slice(0, 10);
        }
      }
    }
  }
//   console.log("transf data", transformedData);
  return transformedData;
}
export const LicenseTableExtensionGraph = ({
  data,
  managerAddress /* see data tab */,
}) => (
  <ResponsiveLine
    data={transformData(data, managerAddress)}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    // xScale={{ type: "point" }}
    xScale={{
      type: "time",
      format: "%Y-%m-%d",
    }}
    xFormat="time:%Y-%m-%d"
    yScale={{
      type: "linear",
      min: "0",
      max: "auto",
      stacked: true,
      reverse: false,
    }}
    axisTop={null}
    axisRight={null}
    enableArea={true}
    axisBottom={{
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
      legendOffset: -40,
      legendPosition: "middle",
    }}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabelYOffset={-12}
    useMesh={true}
    // legends={[
    //   {
    //     anchor: "bottom-right",
    //     direction: "column",
    //     justify: false,
    //     translateX: 100,
    //     translateY: 0,
    //     itemsSpacing: 0,
    //     itemDirection: "left-to-right",
    //     itemWidth: 80,
    //     itemHeight: 20,
    //     itemOpacity: 0.75,
    //     symbolSize: 12,
    //     symbolShape: "circle",
    //     symbolBorderColor: "rgba(0, 0, 0, .5)",
    //     effects: [
    //       {
    //         on: "hover",
    //         style: {
    //           itemBackground: "rgba(0, 0, 0, .03)",
    //           itemOpacity: 1,
    //         },
    //       },
    //     ],
    //   },
    // ]}
  />
);
