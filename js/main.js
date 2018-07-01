// Chart js
function chart8dayHistory(history, query) {
  const dataArray = [];
  const keys = Object.keys(history[query]);
  keys.forEach((key) => {
    const historicalRate = history[query][key];
    return dataArray.push({
      x: key,
      y: historicalRate
    });
  });
  return dataArray;
}
const ctx = document.getElementById('8day-history').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'line',
  data: {
    label: ['USD_KES'],
    datasets: [{
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(33, 33, 33, 0.2)',
      ],
      borderColor: [
        'rgba(133,133,132,1)',
      ],
      borderWidth: 1
    }]
  },
  options: {
    legend: {
      display: false,
    },
    scales: {
      yAxes: false
    }
  }
});
// SW - service worker
function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    if (!navigator.serviceWorker.controller) {
      return;
    }  
  });
}
registerServiceWorker();

// Store
const createStore = (reducer) => {
  let state;
  let listeners = [];

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  dispatch({});
  return { getState, dispatch, subscribe }
};
const store = createStore(reducer);
// Reducer
function reducer(state = {
  type: 'INITIALIZATION',
  sourceInput: null,
  sourceCurrency: 'USD',
  destinationInput: null,
  destinationCurrency: 'KES',
  conversionQuery: 'USD_KES',
  conversionRate: null,
  pastConversions: [],
  historicalRates: [],
  notificationSourceInput: null,
  notificationSourceCurrency: 'USD',
  notificationDestinationInput: null,
  notificationDestinationCurrency: 'KES',
  currencyNotifications:[],
  online: true
}, action) {
  switch (action.type){
  default:
    return state;
  }
}


// Actions
//TODO: Implement application actions.
// idb
//TODO: Implement the index db for the application
// Online check
const onlineStatus = document.getElementById('onlineStatus');
if (navigator.onLine) {
  onlineStatus.innerHTML = 'Online';
  onlineStatus.classList.add('text-success');
} else {
  onlineStatus.innerHTML = 'Offline';
}