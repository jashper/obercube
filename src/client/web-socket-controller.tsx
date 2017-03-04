import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StoreRecords } from './state/reducers';
import { Action, Dispatch } from '../action';
import { SocketAction } from './actions/socket';

interface StateProps {}

interface DispatchProps {
    open(socket: WebSocket): void;
    dispatch: Dispatch;
}

interface Props extends StateProps, DispatchProps {}

class WebSocketController extends React.Component<Props, {}> {
    private socket: WebSocket;

    componentDidMount() {
        this.socket = new WebSocket('ws://localhost:8081');

        this.socket.onopen = () => this.props.open(this.socket);

        this.socket.onmessage = (ev: MessageEvent) => {
            const action = JSON.parse(ev.data) as Action<any>;
            action.fromServer = true;
            this.props.dispatch(action);
        };
    }

    render() {
        return null;
    }
}

function mapStateToProps(state: StoreRecords) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        open: bindActionCreators(SocketAction.open, dispatch),
        dispatch
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebSocketController as any);
