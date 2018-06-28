import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Action } from '../../action';
import { SocketAction } from '../actions/socket';
import { ClientStore } from '../state/reducers';

interface StateProps extends ReturnType<typeof mapStateToProps> {}
interface DispatchProps extends ReturnType<typeof mapDispatchToProps> {}

interface Props extends StateProps, DispatchProps {}

class WebSocketHandler extends React.Component<Props, {}> {
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

function mapStateToProps(state: ClientStore) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        dispatch,
        ...bindActionCreators(
            {
                open: SocketAction.open
            },
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebSocketHandler);
