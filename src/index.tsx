import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const ref = useRef<any>();

  useEffect(() => {
    startService();
  }, []);

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
    console.log(ref.current);
  };
  const onClick = () => {
    console.log(input);
  };
  return (
    <>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
