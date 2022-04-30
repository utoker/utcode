import 'bulmaswatch/superhero/bulmaswatch.min.css';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import CodeCell from './components/code-cell';
import { store } from './state';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <CodeCell />
      </div>
    </Provider>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
