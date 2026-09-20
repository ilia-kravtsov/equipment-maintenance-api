export const setMessage = (element, message, type = '') => {
    element.textContent = message;
    element.className = type
        ? `message message-${type}`
        : 'message';
};

const createTextElement = (className, text) => {
    const element = document.createElement('p');
    element.className = className;
    element.textContent = text;

    return element;
};

export const createRequestCard = (request) => {
    const card = document.createElement('article');
    card.className = 'request-card';

    const title = document.createElement('h3');
    title.className = 'request-card-title';
    title.textContent = request.title;

    const status = createTextElement(
        'request-card-text',
        `Статус: ${request.status}`,
    );

    const priority = createTextElement(
        'request-card-text',
        `Приоритет: ${request.priority}`,
    );

    const equipment = createTextElement(
        'request-card-text',
        `Оборудование: ${request.equipmentId}`,
    );

    card.append(title, status, priority, equipment);

    return card;
};

export const createWeatherCard = (forecast) => {
    const card = document.createElement('article');
    card.className = 'weather-card';

    const title = document.createElement('h3');
    title.className = 'weather-card-title';
    title.textContent = new Date(forecast.date).toLocaleDateString(
        'ru-RU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    );

    const temperatureMax = createTextElement(
        'weather-card-text',
        `Максимальная температура: ${forecast.temperatureMax} °C`,
    );

    const temperatureMin = createTextElement(
        'weather-card-text',
        `Минимальная температура: ${forecast.temperatureMin} °C`,
    );

    const precipitation = createTextElement(
        'weather-card-text',
        `Осадки: ${forecast.precipitation} мм`,
    );

    const wind = createTextElement(
        'weather-card-text',
        `Максимальный ветер: ${forecast.windSpeedMax} км/ч`,
    );

    const suitability = createTextElement(
        forecast.suitableForOutdoorWork
            ? 'weather-suitability weather-suitability-success'
            : 'weather-suitability weather-suitability-warning',
        forecast.suitableForOutdoorWork
            ? 'Работы на открытом воздухе: разрешены'
            : 'Работы на открытом воздухе: не рекомендуются',
    );

    card.append(
        title,
        temperatureMax,
        temperatureMin,
        precipitation,
        wind,
        suitability,
    );

    return card;
};