import React from "react";
import { Card, CardBody, CardHeader, CardTitle, Table } from "reactstrap";

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
    const data = this.transformDataTable(this.props.managerData);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h4">Royalties History</CardTitle>
        </CardHeader>
        <CardBody>
          <Table responsive striped>
            <thead>
              <tr>
                <th>ID</th>
                <th>Associated Smart License</th>
                <th>Royalty Value</th>
                <th>Issue Date</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>
                    <span className={`badge ${row[4] === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {row[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default RoyaltiesTable;
