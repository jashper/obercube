import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import 'redux-devtools-extension/developmentOnly';

import { reducers } from './state/reducers';
import View from './view/view';

const store = createStore(reducers, (window as any).__REDUX_DEVTOOLS_EXTENSION__({
    actionsBlacklist: []
}));

ReactDOM.render(
    <Provider store={store}>
        <View />
    </Provider>,
    document.getElementById('root')
);
