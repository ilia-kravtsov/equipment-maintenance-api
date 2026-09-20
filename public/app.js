const filtersForm = document.querySelector('#filters-form');
const resetFiltersButton = document.querySelector('#reset-filters');
const requestsList = document.querySelector('#requests-list');
const requestsMessage = document.querySelector('#requests-message');

const createRequestForm = document.querySelector('#create-request-form');
const createMessage = document.querySelector('#create-message');
const apiKeyInput = document.querySelector('#api-key');

const setMessage = (element, message, type = '') => {
    element.textContent = message;
    element.className = type
        ? `message message-${type}`
        : 'message';
};

const getErrorMessage = (body) => {
    return body?.error?.message ?? 'Произошла неизвестная ошибка';
};

const createRequestCard = (request) => {
    const card = document.createElement('article');
    card.className = 'request-card';

    const title = document.createElement('h3');
    title.className = 'request-card-title';
    title.textContent = request.title;

    const status = document.createElement('p');
    status.className = 'request-card-text';
    status.textContent = `Статус: ${request.status}`;

    const priority = document.createElement('p');
    priority.className = 'request-card-text';
    priority.textContent = `Приоритет: ${request.priority}`;

    const equipment = document.createElement('p');
    equipment.className = 'request-card-text';
    equipment.textContent = `Оборудование: ${request.equipmentId}`;

    card.append(title, status, priority, equipment);

    return card;
};

const renderRequests = (requests) => {
    requestsList.replaceChildren();

    if (requests.length === 0) {
        setMessage(requestsMessage, 'Заявки не найдены');
        return;
    }

    const fragment = document.createDocumentFragment();

    requests.forEach((request) => {
        fragment.append(createRequestCard(request));
    });

    requestsList.append(fragment);
};

const getFiltersQuery = () => {
    const formData = new FormData(filtersForm);
    const params = new URLSearchParams();

    const status = formData.get('status');
    const priority = formData.get('priority');

    if (status) {
        params.set('status', status);
    }

    if (priority) {
        params.set('priority', priority);
    }

    return params.toString();
};

const loadRequests = async () => {
    setMessage(requestsMessage, 'Загрузка...');
    requestsList.replaceChildren();

    try {
        const query = getFiltersQuery();
        const url = query
            ? `/api/requests?${query}`
            : '/api/requests';

        const response = await fetch(url);
        const body = await response.json();

        if (!response.ok) {
            throw new Error(getErrorMessage(body));
        }

        renderRequests(body.data);

        if (body.data.length > 0) {
            setMessage(
                requestsMessage,
                `Найдено заявок: ${body.meta.total}`,
            );
        }
    } catch (error) {
        setMessage(
            requestsMessage,
            error instanceof Error
                ? error.message
                : 'Не удалось загрузить заявки',
            'error',
        );
    }
};

const createRequest = async (event) => {
    event.preventDefault();

    setMessage(createMessage, 'Создание заявки...');

    const formData = new FormData(createRequestForm);

    const apiKey = formData.get('apiKey');
    const description = formData.get('description');
    const plannedAt = formData.get('plannedAt');

    const payload = {
        equipmentId: formData.get('equipmentId'),
        title: formData.get('title'),
        priority: formData.get('priority'),

        ...(description && {
            description,
        }),

        ...(plannedAt && {
            plannedAt: new Date(plannedAt).toISOString(),
        }),
    };

    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
            },
            body: JSON.stringify(payload),
        });

        const body = await response.json();

        if (!response.ok) {
            throw new Error(getErrorMessage(body));
        }

        createRequestForm.reset();

        apiKeyInput.value = apiKey;

        setMessage(
            createMessage,
            'Заявка успешно создана',
            'success',
        );

        await loadRequests();
    } catch (error) {
        setMessage(
            createMessage,
            error instanceof Error
                ? error.message
                : 'Не удалось создать заявку',
            'error',
        );
    }
};

filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void loadRequests();
});

resetFiltersButton.addEventListener('click', () => {
    filtersForm.reset();
    void loadRequests();
});

createRequestForm.addEventListener('submit', (event) => {
    void createRequest(event);
});

void loadRequests();