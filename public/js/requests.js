import { apiRequest } from './api.js';
import {
    createRequestCard,
    setMessage,
} from './ui.js';

export const initRequests = ({
                                 createRequestForm,
                                 createMessage,
                                 equipmentIdInput,
                                 filtersForm,
                                 resetFiltersButton,
                                 requestsList,
                                 requestsMessage,
                             }) => {
    const previousButton = document.querySelector('#requests-prev');
    const nextButton = document.querySelector('#requests-next');
    const pageLabel = document.querySelector('#requests-page');

    const pageSize = 20;
    let currentPage = 1;
    let totalPages = 0;
    let loadVersion = 0;
    let activeFilters = '';

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

    const loadRequests = async (page = 1) => {
        const version = ++loadVersion;

        if (page === 1) {
            activeFilters = getFiltersQuery();
        }

        previousButton.disabled = true;
        nextButton.disabled = true;
        pageLabel.textContent = '';
        setMessage(requestsMessage, 'Загрузка...');
        requestsList.replaceChildren();

        try {
            const params = new URLSearchParams(activeFilters);
            params.set('page', String(page));
            params.set('limit', String(pageSize));
            params.set('sortBy', 'createdAt');
            params.set('order', 'desc');

            const body = await apiRequest(`/api/requests?${params}`);

            if (version !== loadVersion) {
                return;
            }

            totalPages = Math.ceil(body.meta.total / pageSize);

            if (totalPages > 0 && page > totalPages) {
                await loadRequests(totalPages);
                return;
            }

            currentPage = body.meta.page;
            renderRequests(body.data);

            if (body.meta.total > 0) {
                setMessage(
                    requestsMessage,
                    `Найдено заявок: ${body.meta.total}`,
                );
                pageLabel.textContent =
                    `Страница ${currentPage} из ${totalPages}`;
            } else {
                pageLabel.textContent = 'Нет страниц';
            }

            previousButton.disabled = currentPage <= 1 || totalPages === 0;
            nextButton.disabled = currentPage >= totalPages;
        } catch (error) {
            if (version !== loadVersion) {
                return;
            }

            setMessage(
                requestsMessage,
                error instanceof Error
                    ? error.message
                    : 'Не удалось загрузить заявки',
                'error',
            );
        }
    };

    previousButton.addEventListener('click', () => {
        if (currentPage > 1) {
            void loadRequests(currentPage - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            void loadRequests(currentPage + 1);
        }
    });

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

    document.addEventListener('auth:login', () => {
        void loadRequests();
    });

    setMessage(
        requestsMessage,
        'Войдите в учётную запись для загрузки заявок',
    );
};