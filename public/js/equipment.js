import { apiRequest } from './api.js';
import {
    createWeatherCard,
    setMessage,
} from './ui.js';

export const initEquipment = ({
                                  apiKeyInput,
                                  createEquipmentForm,
                                  equipmentMessage,
                                  equipmentIdInput,
                                  weatherSection,
                                  weatherMessage,
                                  weatherList,
                                  showWeatherButton,
                              }) => {
    let currentEquipmentId = null;

    const getApiKey = () => apiKeyInput.value.trim();

    const renderWeather = (forecast) => {
        weatherList.replaceChildren();

        const fragment = document.createDocumentFragment();

        forecast.forEach((day) => {
            fragment.append(createWeatherCard(day));
        });

        weatherList.append(fragment);
    };

    const loadWeather = async () => {
        if (!currentEquipmentId) {
            setMessage(
                weatherMessage,
                'Сначала создайте оборудование',
                'error',
            );
            return;
        }

        setMessage(weatherMessage, 'Загрузка прогноза...');
        weatherList.replaceChildren();

        try {
            const body = await apiRequest(
                `/api/equipment/${currentEquipmentId}/weather`,
            );

            renderWeather(body.data.days);

            setMessage(
                weatherMessage,
                'Прогноз успешно загружен',
            );
        } catch (error) {
            setMessage(
                weatherMessage,
                error instanceof Error
                    ? error.message
                    : 'Не удалось загрузить прогноз',
                'error',
            );
        }
    };

    const createEquipment = async (event) => {
        event.preventDefault();

        setMessage(
            equipmentMessage,
            'Создание оборудования...',
        );

        const formData = new FormData(createEquipmentForm);

        const payload = {
            name: formData.get('name'),
            type: formData.get('type'),
            serialNumber: formData.get('serialNumber'),
            location: {
                lat: Number(formData.get('lat')),
                lon: Number(formData.get('lon')),
            },
            status: formData.get('status'),
            installedAt: formData.get('installedAt'),
        };

        try {
            const body = await apiRequest('/api/equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': getApiKey(),
                },
                body: JSON.stringify(payload),
            });

            currentEquipmentId = body.data.id;
            equipmentIdInput.value = currentEquipmentId;

            weatherList.replaceChildren();
            setMessage(weatherMessage, '');

            weatherSection.classList.remove(
                'weather-section-hidden',
            );

            createEquipmentForm.reset();

            setMessage(
                equipmentMessage,
                `Оборудование создано. ID: ${currentEquipmentId}`,
                'success',
            );

            equipmentIdInput.focus();
        } catch (error) {
            setMessage(
                equipmentMessage,
                error instanceof Error
                    ? error.message
                    : 'Не удалось создать оборудование',
                'error',
            );
        }
    };

    createEquipmentForm.addEventListener(
        'submit',
        (event) => {
            void createEquipment(event);
        },
    );

    showWeatherButton.addEventListener('click', () => {
        void loadWeather();
    });
};