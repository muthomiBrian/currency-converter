// Classes
class API {
  constructor(){
    this.API_URL = 'https://free.currencyconverterapi.com/api/v5/';
  }
  getCurrencies(){
    return fetch(this.API_URL+'currencies')
      .then(res => res.json());
  }
  getConversionRate(query){
    return fetch(this.API_URL+`convert?q=${query}&compact=y`)
      .then(res => res.json());
  }
  getHistorical8dayRates(){}
}


// IndexDB using idb
function openRatesDatabase(){
  // If the browser doesn't support service worker,
  // we don't care about having a database
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('ratesDatabase', 1, function(upgradeDb) {
    const store = upgradeDb.createObjectStore('rates', {
      keyPath: 'query'
    });
    store.createIndex('query','query');
  });
}
openRatesDatabase();
function openCurrenciesDatabase(){
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('currenciesDatabase', 1, function(upgradeDb) {
    const currencyStore = upgradeDb.createObjectStore('currencies', {
      keyPath: 'currencyName'
    });
  });
}


// SW - service worker
function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('https://muthomibrian.github.io/currency-converter/sw.js').then((reg) => {
    if (!navigator.serviceWorker.controller) {
      return;
    }  
    if (reg.waiting) {
      updateReady(reg.waiting);
      return;
    }
  });
}
registerServiceWorker();
function updateReady(worker) {
  const updatePending = document.getElementById('updatePending');
  updatePending.classList.remove('d-none');
  updatePending.classList.add('d-inline');
  updatePending.classList.add('text-success');
  updatePending.addEventListener('click', () => {
    worker.postMessage({skip:true});
    updatePending.classList.remove('d-inline');
    updatePending.classList.add('d-none');
  });
}
// API
const api = new API();
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
  return { getState, dispatch, subscribe };
};
const store = createStore(reducer);


// Reducer
function reducer(state = {
  type: 'INITIALIZATION',
  currencyList: {},
  sourceInput: '',
  sourceCurrency: 'USD',
  destinationInput: '',
  destinationCurrency: 'KES',
  conversionQuery: 'USD_KES',
  conversionRate: '',
  conversionDate: '',
}, action) {
  const newState = Object.assign({},state);
  switch (action.type){
  case 'ENTER_SOURCE_AMOUNT':
    newState.type = action.type;
    newState.sourceInput = action.payload.sourceInput;
    newState.destinationInput = action.payload.destinationInput;
    newState.conversionRate = action.payload.conversionRate;
    newState.conversionDate = action.payload.conversionDate;
    return newState;
  case 'CHANGE_SOURCE_CURRENCY':
    newState.type = action.type;
    newState.sourceCurrency = action.payload.sourceCurrency;
    newState.destinationInput = action.payload.destinationInput;
    newState.conversionRate = action.payload.conversionRate;
    newState.conversionDate = action.payload.conversionDate;
    return newState;
  case 'ENTER_DESTINATION_INPUT':
    newState.type = action.type;
    newState.sourceInput = action.payload.sourceInput;
    newState.destinationInput = action.payload.destinationInput;
    newState.conversionRate = action.payload.conversionRate;
    newState.conversionDate = action.payload.conversionDate;
    return newState;
  case 'CHANGE_DESTINATION_CURRENCY':
    newState.type = action.type;
    newState.destinationCurrency = action.payload.destinationCurrency;
    newState.destinationInput = action.payload.destinationInput;
    newState.conversionRate = action.payload.conversionRate;
    newState.conversionDate = action.payload.conversionDate;
    return newState;
  case 'SELECT_PAST_CONVERSION':
    return newState;
  case 'CHANGE_NOTIFICATION_SOURCE_AMOUNT':
    return newState;
  case 'CURRENCY_LIST_FETCHED':
    newState.type = action.type;
    newState.currencyList = action.payload.currencyList;
    newState.conversionDate = action.payload.conversionDate;
    return newState;
  case 'SAVE_CONVERSION':
    return newState;
  case 'SAVE_NOTIFICATION':
    return newState;
  default:
    return state;
  }
}

// UI hooks
const sourceInput = document.getElementById('sourceInput');
const sourceCurrency = document.getElementById('sourceCurrency');
const destinationInput = document.getElementById('destinationInput');
const destinationCurrency = document.getElementById('destinationCurrency');
const dateOfConversion = document.getElementById('dateOfConversion');

// Other variables
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Render
store.subscribe(render);
function currencySelect(state, currencyDefault){
  const currencyKeys = Object.keys(state.currencyList);
  const currencyListOptionsHTML = currencyKeys.reduce((html, currencyKey) => {
    return html + `<option value="${currencyKey}">${currencyKey} - ${state.currencyList[currencyKey].currencyName}</option>`;
  },'');
  return `<option value="${currencyDefault}">${currencyDefault} - ${state.currencyList[currencyDefault].currencyName}</option>` + currencyListOptionsHTML;
}
function render(){
  const state = store.getState();
  const year = state.conversionDate.getFullYear() || '';
  const day = state.conversionDate.getDate() || '';
  const month = state.conversionDate.getMonth() || '';
  const date = `${months[month]}, ${day} ${year}` || 'date undefined';
  sourceInput.value = state.sourceInput;
  sourceInput.style.minWidth = '6rem';
  sourceInput.style.width = `${state.sourceInput.toString().length}rem`;
  destinationInput.value = state.destinationInput;
  destinationInput.style.minWidth = '6rem';
  destinationInput.style.width = `${state.destinationInput.toString().length}rem`;
  dateOfConversion.innerHTML = date;
  sourceCurrency.innerHTML = currencySelect(state, state.sourceCurrency);
  destinationCurrency.innerHTML = currencySelect(state, state.destinationCurrency);
}
function renderLists(){
  const state = store.getState();
  sourceCurrency.innerHTML = currencySelect(state, state.sourceCurrency);
  destinationCurrency.innerHTML = currencySelect(state, state.destinationCurrency);
}

// Functions
function storeCurrencies(results){
  return openCurrenciesDatabase().then((db) => {
    if(!db) return;
    const tx = db.transaction('currencies','readwrite');
    const currencyStore = tx.objectStore('currencies');
    const currencyKeys = Object.keys(results);
    currencyKeys.forEach((currencyKey) => {
      currencyStore.put(results[currencyKey]);
    });
  });
}
function getStoredCurrencies(){
  return openCurrenciesDatabase().then((db) => {
    if(!db) return;
    const tx = db.transaction('currencies');
    const currencyStore = tx.objectStore('currencies');
    return currencyStore.getAll().then((currencies) => {
      const currencyObject = {};
      currencies.map((currency) => {
        return currencyObject[currency.id] = currency;
      });
      return store.dispatch({type: 'CURRENCY_LIST_FETCHED', 
        payload: {
          currencyList: currencyObject,
          conversionDate: new Date()
        } 
      });
    });
  });
}
function storeRate(rate){
  return openRatesDatabase().then((db) =>{
    if (!db) return;
    const tx = db.transaction('rates','readwrite');
    const ratesStore = tx.objectStore('rates');
    ratesStore.put(rate);
    return tx.complete;
  });
}
function conversion (rate, input, queryString){
  const rateToStore = {query: queryString, val: rate[queryString].val};
  storeRate(rateToStore);
  return rate[queryString].val * input;
}
function query(source, dest, opposite=false){
  if (!opposite){
    return `${source}_${dest}`;
  }
  return `${dest}_${source}`;
}
function getStoredRates (queryString, actionType){
  return openRatesDatabase().then((db) => {
    if (!db) return;
    const tx = db.transaction('rates');
    const rateStore = tx.objectStore('rates');
    const queryIndex = rateStore.index('query');
    return queryIndex.get(queryString).then((rate) => {
      if (!rate) return;
      const result = {[queryString]: {val: rate.val}};
      switch (actionType) {
      case 'ENTER_SOURCE_AMOUNT':
        store.dispatch({
          type: actionType,
          payload: {
            sourceInput: sourceInput.value,
            destinationInput: conversion(result, sourceInput.value, queryString).toFixed(2).toLocaleString('en-US'),
            conversionRate: result[queryString].val,
            conversionDate: new Date()
          }
        });
        break;
      case 'ENTER_DESTINATION_AMOUNT':
        store.dispatch({
          type: 'ENTER_DESTINATION_INPUT',
          payload: {
            destinationInput: destinationInput.value,
            sourceInput: conversion(result, destinationInput.value, queryString).toFixed(2).toLocaleString('en-US'),
            conversionRate: result[queryString].val,
            conversionDate: new Date()
          }
        });
        break;
      }
    });
  });
}

// Actions
window.addEventListener('load', () => {
  api
    .getCurrencies()
    .catch(error => {
      if ( !error.toString().includes('Failed to fetch')) return;
      getStoredCurrencies();
      return;
    })
    .then((result) => {
      if(!result) return;
      store.dispatch({type: 'CURRENCY_LIST_FETCHED', 
        payload: {
          currencyList: result.results,
          conversionDate: new Date()
        } });
      renderLists();
      storeCurrencies(result.results);
    });
});
document.getElementById('sourceInput')
  .addEventListener('keyup', () => {
    const queryString = query(sourceCurrency.value,destinationCurrency.value);
    if (sourceInput.value) {
      api
        .getConversionRate(query(sourceCurrency.value,destinationCurrency.value))
        .catch((error) => {
          if ( !error.toString().includes('Failed to fetch')) return;
          getStoredRates(queryString,'ENTER_SOURCE_AMOUNT');
          return;
        })
        .then((result) => {
          if(!result) return;
          store.dispatch({
            type: 'ENTER_SOURCE_AMOUNT',
            payload: {
              sourceInput: sourceInput.value,
              destinationInput: conversion(result, sourceInput.value, queryString).toFixed(2).toLocaleString('en-US'),
              conversionRate: result[queryString].val,
              conversionDate: new Date()
            }
          });
        });
    }
  });
sourceInput.addEventListener('click', () => {
  sourceInput.value = '';
});
destinationInput.addEventListener('click', () => {
  destinationInput.value = '';
});
document.getElementById('sourceCurrency')
  .addEventListener('change', () => {
    const queryString = query(sourceCurrency.value,destinationCurrency.value);
    if (sourceInput.value) {
      api
        .getConversionRate(query(sourceCurrency.value,destinationCurrency.value))
        .then((result) => {
          store.dispatch({
            type: 'CHANGE_SOURCE_CURRENCY',
            payload: {
              sourceCurrency: sourceCurrency.value,
              destinationInput: conversion(result, sourceInput.value, queryString).toFixed(2).toLocaleString(),
              conversionRate: result[queryString].val,
              conversionDate: new Date()
            }
          });
        });
    }
  });
document.getElementById('destinationInput')
  .addEventListener('keyup', () => {
    const queryString = query(sourceCurrency.value,destinationCurrency.value,true);
    if (destinationInput.value) {
      api
        .getConversionRate(query(sourceCurrency.value,destinationCurrency.value,true))
        .catch((error) => {
          if ( !error.toString().includes('Failed to fetch')) return;
          getStoredRates(queryString,'ENTER_DESTINATION_AMOUNT');
          return;
        })
        .then((result) => {
          if(!result) return;
          
          store.dispatch({
            type: 'ENTER_DESTINATION_INPUT',
            payload: {
              destinationInput: destinationInput.value,
              sourceInput: conversion(result, destinationInput.value, queryString).toFixed(2).toLocaleString('en-US'),
              conversionRate: result[queryString].val,
              conversionDate: new Date()
            }
          });
        });
    }
  });
document.getElementById('destinationCurrency')
  .addEventListener('change', () => {
    const queryString = query(sourceCurrency.value,destinationCurrency.value);
    if (sourceInput.value) {
      api
        .getConversionRate(query(sourceCurrency.value,destinationCurrency.value))
        .then((result) => {
          store.dispatch({
            type: 'CHANGE_DESTINATION_CURRENCY',
            payload: {
              destinationCurrency: destinationCurrency.value,
              destinationInput: conversion(result, sourceInput.value, queryString).toFixed(2).toLocaleString('en-US'),
              conversionRate: result[queryString].val,
              conversionDate: new Date()
            }
          });
        });
    }
  });


// Online check
const onlineStatus = document.getElementById('onlineStatus');
if (navigator.onLine) {
  onlineStatus.innerHTML = 'Online';
  onlineStatus.classList.add('text-success');
} else {
  onlineStatus.innerHTML = 'Offline';
}