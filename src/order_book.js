import React from 'react';
import { useTable } from 'react-table'
export default class OrderBook extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            last_sequence_no: null,
            product_id: null,
            type: null,
            symbol: null,
            timestamp: null,
            buy: [],
            sell: []
        }
    }

    componentDidMount() {
        let self = this
        let socket = new WebSocket("wss://api.delta.exchange:2096", ['soap', 'xmpp']);

        socket.onopen = function (e) {
            console.log("[open] Connection established");
            console.log("Sending to server");
            let payload = { "type": "subscribe", "payload": { "channels": [{ "name": "l2_orderbook", "symbols": ["BTCUSD"] }] } }
            socket.send(JSON.stringify(payload));
        };

        socket.onmessage = function (event) {
            let resultData = JSON.parse(event.data)
            self.setState({
                last_sequence_no: resultData["last_sequence_no"],
                product_id: resultData["product_id"],
                type: resultData["type"],
                symbol: resultData["symbol"],
                timestamp: resultData["timestamp"],
                buy: resultData["buy"],
                sell: resultData["sell"]
            })
            console.clear()
            console.log(event.data)
        };

        socket.onclose = function (event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[close] Connection died');
            }
        };

        socket.onerror = function (error) {
            console.log(`[error] ${error.message}`);
        };
    }

    render() {
        function Table({ columns, data }) {

            const {
                getTableProps,
                getTableBodyProps,
                headerGroups,
                rows,
                prepareRow,
            } = useTable({
                columns,
                data,
            })
            return (
                <table style={{ width: '100%' }} {...getTableProps()}>
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(
                            (row, i) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        })}
                                    </tr>
                                )
                            }
                        )}
                    </tbody>
                </table>
            )
        }
        return (
            <div>
                <lable style={{ fontSize: '16px' }}>
                    Last Sequence #: {this.state.last_sequence_no},
             Product Id: {this.state.product_id},
            Type: {this.state.type},
            Symbol: {this.state.type},
            Timestamp: {this.state.timestamp}
                </lable>
                <div style={{ width: '100%' }}>
                    <div style={{ width: '50%', float: 'left', fontSize: '14px' }}>
                        {this.state.buy && <Table
                            data={this.state.buy}
                            columns={[{
                                Header: 'Buy',
                                columns: [
                                    {
                                        Header: "Price",
                                        accessor: "limit_price",
                                    },
                                    {
                                        Header: "Size",
                                        accessor: "size",
                                    }
                                ],
                            }
                            ]}
                        />}
                    </div>
                    <div style={{ width: '50%', float: 'right', fontSize: '14px' }}>
                        {this.state.sell && <Table
                            data={this.state.buy}
                            columns={[{
                                Header: 'Sell',
                                columns: [
                                    {
                                        Header: "Price",
                                        accessor: "limit_price",
                                    },
                                    {
                                        Header: "Size",
                                        accessor: "size",
                                    }
                                ],
                            }
                            ]}
                        />}
                    </div>
                </div>
            </div>
        );
    }
};