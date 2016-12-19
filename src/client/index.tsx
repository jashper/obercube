import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import { reducers } from './state/reducers';
import View from './view/view';

const store = createStore(reducers, composeWithDevTools());

ReactDOM.render(
	<Provider store={store}>
		<View />
	</Provider>,
	document.getElementById('root')
);
