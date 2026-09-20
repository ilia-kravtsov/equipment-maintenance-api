import { initEquipment } from './equipment.js';
import { initRequests } from './requests.js';

const apiKeyInput = document.querySelector('#api-key');

const createEquipmentForm = document.querySelector('#create-equipment-form');
const equipmentMessage = document.querySelector('#equipment-message');
const equipmentIdInput = document.querySelector('#equipment-id');

const weatherSection = document.querySelector('#weather-section');
const showWeatherButton = document.querySelector('#show-weather');
const weatherMessage = document.querySelector('#weather-message');
const weatherList = document.querySelector('#weather-list');

const createRequestForm = document.querySelector('#create-request-form');
const createMessage = document.querySelector('#create-message');

const filtersForm = document.querySelector('#filters-form');
const resetFiltersButton = document.querySelector('#reset-filters');
const requestsList = document.querySelector('#requests-list');
const requestsMessage = document.querySelector('#requests-message');

initEquipment({
    apiKeyInput,
    createEquipmentForm,
    equipmentMessage,
    equipmentIdInput,
    weatherSection,
    weatherMessage,
    weatherList,
    showWeatherButton,
});

initRequests({
    apiKeyInput,
    createRequestForm,
    createMessage,
    equipmentIdInput,
    filtersForm,
    resetFiltersButton,
    requestsList,
    requestsMessage,
});