import { apiRequest } from './api.js';
import {
    createRequestCard,
    setMessage,
} from './ui.js';

export const initRequests = ({
                                 apiKeyInput,
                                 createRequestForm,
                                 createMessage,
                                 equipmentIdInput,
                                 filtersForm,
                                 resetFiltersButton,
                                 requestsList,
                                 requestsMessage,
                             }) => {
    const getApiKey = () => apiKeyInput.value.trim();

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

            const body = await apiRequest(url);

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
            await apiRequest('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': getApiKey(),
                },
                body: JSON.stringify(payload),
            });

            const equipmentId = formData.get('equipmentId');

            createRequestForm.reset();
            equipmentIdInput.value = equipmentId;

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

    createRequestForm.addEventListener(
        'submit',
        (event) => {
            void createRequest(event);
        },
    );

    void loadRequests();
};