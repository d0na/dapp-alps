import React from "react";
import MUIDataTable, { ExpandButton } from "mui-datatables";

import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

class RoyaltiesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
    };
  }

  transformDataTable(data) {
    let transformedData = [];
    let key = 1;

    for (let managerContr of data) {
      for (let i = 0; i < managerContr.royaltyData.length - 2; i = i + 3) {
        transformedData.push([
          key++,
          managerContr.managerAddress,
          managerContr.royaltyData[i],
          new Date(managerContr.royaltyData[i + 1] * 1000)
            .toISOString()
            .slice(0, 10),
          managerContr.royaltyData[i + 2] === 0 ? "Unpaid" : "Paid",
        ]);
      }
    }
    // console.log("TABLE transform", data, transformedData);
    return transformedData;
  }

  render() {
    const columns = [
      {
        name: "ID",
        options: {
          filter: false,
        },
      },
      {
        name: "Associated Smart License",
        options: {
          filter: true,
          label: "Smart License",
        },
      },
      {
        name: "Royalty Value",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "Issue Date",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "Payment Status",
        options: {
          filter: true,
          sort: false,
        },
      },
    ];

    const columns_aux = [
      "ID",

      "Associated Smart License",

      "Royalty Value",

      "Issue Date",

      "Payment Status",
    ];

    const options = {
      filter: true,
      filterType: "dropdown",
      responsive: "standard",
      selectableRowsHeader: false,
      selectableRows: "none",
    };

    const theme = createTheme({
      overrides: {
        MUIDataTableSelectCell: {
          expandDisabled: {
            // Soft hide the button.
            visibility: "hidden",
          },
        },
      },
    });

    const components = {
      ExpandButton: function (props) {
        // If needed, remove the expand "arrow" from the table rows
        //if (props.dataIndex === 3 || props.dataIndex === 4) return <div style={{width:'24px'}} />;
        return <ExpandButton {...props} />;
      },
    };

    return (
      //   <MuiThemeProvider theme={theme}>
      <MUIDataTable
        title={"Royalties History"}
        data={this.transformDataTable(this.props.managerData)}
        columns={columns_aux}
        //   options={options}
        //   components={components}
      />
      //   </MuiThemeProvider>
    );
  }
}

export default RoyaltiesTable;
