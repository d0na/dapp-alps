import React from "react";
import { ResponsivePie } from "@nivo/pie";

let dataTemplate = [
  {
    id: "go",
    label: "go",
    value: 15,
    color: "hsl(34, 70%, 50%)",
  }
];

function transformData(managerData) {
  let transformedData = [];
  if (managerData.length != 0) {
    for (const data of managerData) {
      let roy = 0;
      for (let i = 0; i < data.royaltyData.length - 2; i = i + 3) {
        if (data.royaltyData[i + 2] === 0) {
          roy += data.royaltyData[i];
        }
      }
      transformedData.push({
        id: data.managerAddress,
        label: data.managerAddress,
        value: roy,
      });
    }
  }
  return transformedData;
}

export const RoyaltiesPaymentPie = ({ data /* see data tab */ }) => (
  <ResponsivePie
    data={transformData(data)}
    margin={{ top: 10, right: 80, bottom: 40, left: 80 }}
    innerRadius={0.5}
    padAngle={0.7}
    cornerRadius={3}
    activeOuterRadiusOffset={8}
    borderWidth={1}
    borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#333333"
    arcLinkLabelsThickness={2}
    arcLinkLabelsColor={{ from: "color" }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
    defs={[
      {
        id: "dots",
        type: "patternDots",
        background: "inherit",
        color: "rgba(255, 255, 255, 0.3)",
        size: 4,
        padding: 1,
        stagger: true,
      },
      {
        id: "lines",
        type: "patternLines",
        background: "inherit",
        color: "rgba(255, 255, 255, 0.3)",
        rotation: -45,
        lineWidth: 6,
        spacing: 10,
      },
    ]}
    fill={[
      {
        match: {
          id: "ruby",
        },
        id: "dots",
      },
      {
        match: {
          id: "c",
        },
        id: "dots",
      },
      {
        match: {
          id: "go",
        },
        id: "dots",
      },
      {
        match: {
          id: "python",
        },
        id: "dots",
      },
      {
        match: {
          id: "scala",
        },
        id: "lines",
      },
      {
        match: {
          id: "lisp",
        },
        id: "lines",
      },
      {
        match: {
          id: "elixir",
        },
        id: "lines",
      },
      {
        match: {
          id: "javascript",
        },
        id: "lines",
      },
    ]}
    legends={[]}
  />
);
