import { CoffeeItem } from './components/CoffeeItem';
import { MqttProvider } from './contexts/MqttContext';

function App() {
  return (
    <div style={{"display": "flex", "flexDirection": "row", "flexWrap": "wrap", "justifyContent": "center"}} >
      <MqttProvider>
        <CoffeeItem />
      </MqttProvider>
    </div>
  );
}

export default App;
