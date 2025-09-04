import React from "react";
import MUIDataTable, { ExpandButton } from "mui-datatables";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import LicenseTableExtension from "./LicenseTableExpansion";
// import ActiveLicenseExpansion from "components/table/ActiveLicenseExpansion";

class ActiveLicensesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  transformTableData(data) {
    let transformedData = [];
    let counter = 0;

    for (let managerContr of data) {
      transformedData.push([
        counter++,
        managerContr.managerAddress,
        managerContr.licensee,
        managerContr.licensor,
        managerContr.isActive ? "Active" : "Inactive",
      ]);
    }
    console.log("test", transformedData);
    return transformedData;
  }

  render() {
    const columns = [
      {
        name: "ID",
      },
      {
        name: "Address",
        options: {
          filter: true,
        },
      },
      {
        name: "Licensee",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "Licensor",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "Active Status",
        options: {
          filter: true,
          sort: false,
        },
      },
    ];

    const options = {
      filter: true,
      filterType: "dropdown",
      responsive: "standard",
      selectableRowsHeader: false,
      selectableRows: "none",
      expandableRows: true,
      expandableRowsHeader: false,
      expandableRowsOnClick: true,
      isRowExpandable: (dataIndex, expandedRows) => {
        //if (dataIndex === 3 || dataIndex === 4) return false;

        // Prevent expand/collapse of any row if there are 4 rows expanded already (but allow those already expanded to be collapsed)
        if (
          expandedRows.data.length > 4 &&
          expandedRows.data.filter((d) => d.dataIndex === dataIndex).length ===
            0
        )
          return false;
        return true;
      },
      // Rows that are expanded sinces loading the table. Would probably never want to start with a Row expanded in this view
      // rowsExpanded: [0, 1],
      renderExpandableRow: (rowData, rowMeta) => {
        const colSpan = rowData.length + 1;
        console.log("ROW DATA", rowData, rowMeta);
        return (
          <TableRow>
            <TableCell colSpan={colSpan}>
              <LicenseTableExtension
                {...this.props}
                rowData={rowData}
                managerAddress={rowData[1]}
              />
            </TableCell>
          </TableRow>
        );
      },
      // onRowExpansionChange: (curExpanded, allExpanded, rowsExpanded) =>
      //   console.log(curExpanded, allExpanded, rowsExpanded),
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
      <MuiThemeProvider theme={theme}>
        <MUIDataTable
          title={"Licenses"}
          data={this.transformTableData(this.props.managerData)}
          columns={columns}
          options={options}
          components={components}
        />
      </MuiThemeProvider>
    );
  }
}

export default ActiveLicensesTable;
