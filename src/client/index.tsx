import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import 'redux-devtools-extension/developmentOnly';

import { Action } from './actions/action';
import { reducers } from './state/reducers';
import View from './view/view';

const store = createStore((reducers as any), (window as any).__REDUX_DEVTOOLS_EXTENSION__({
    actionsBlacklist: []
}));

// hacky way to allow the viewport to dispatch further async actions; this
// is needed for allowing animations to trigger further actions such as unit cleanup
const newReducers = (state: {}, action: Action<any>) => reducers(state, action, store.dispatch);
store.replaceReducer(newReducers);

ReactDOM.render(
    <Provider store={store}>
        <View />
    </Provider>,
    document.getElementById('root')
);
