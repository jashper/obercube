import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';

import { GameTickActionType } from '../server/actions/game-tick';
import { GenerateActionType } from '../server/actions/generate';
import { viewportController } from './middleware/viewport-controller';
import { webSocketController } from './middleware/web-socket-controller';
import { reducers } from './state/reducers';
import View from './view/view';

const middleware = applyMiddleware(
    webSocketController,
    viewportController
);

const composeEnhancers = composeWithDevTools({
    actionsBlacklist: [
        GameTickActionType.SYNCHRONIZE_TICK,
        GenerateActionType.GENERATE_UNITS
    ]
});

const store = createStore(reducers, composeEnhancers(middleware));

ReactDOM.render(
    <Provider store={store}>
        <View />
    </Provider>,
    document.getElementById('root')
);
