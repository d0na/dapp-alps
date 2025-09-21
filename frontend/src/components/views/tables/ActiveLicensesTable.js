import React, { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle, Table, Button, Collapse } from "reactstrap";
import LicenseTableExtension from "./LicenseTableExpansion";
// import ActiveLicenseExpansion from "components/table/ActiveLicenseExpansion";

const ActiveLicensesTable = (props) => {
  const [expandedRows, setExpandedRows] = useState({});

  const transformTableData = (data) => {
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
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const data = transformTableData(props.managerData);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Active Licenses</CardTitle>
      </CardHeader>
      <CardBody>
        <Table responsive striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Address</th>
              <th>Licensee</th>
              <th>Licensor</th>
              <th>Active Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>
                    <span className={`badge ${row[4] === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                      {row[4]}
                    </span>
                  </td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => toggleRow(index)}
                    >
                      {expandedRows[index] ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <Collapse isOpen={expandedRows[index]}>
                      <div style={{ padding: '15px', backgroundColor: '#f8f9fa' }}>
                        <LicenseTableExtension
                          {...props}
                          rowData={row}
                          managerAddress={row[1]}
                        />
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default ActiveLicensesTable;
