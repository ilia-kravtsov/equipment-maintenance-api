let getAccessToken = () => '';

export const configureApi = (tokenProvider) => {
    getAccessToken = tokenProvider;
};

const getErrorMessage = (body) => {
    if (body?.error?.details?.length) {
        return body.error.details
            .map((detail) => `${detail.field}: ${detail.message}`)
            .join('; ');
    }

    return body?.error?.message ?? 'Произошла неизвестная ошибка';
};

export const apiRequest = async (url, options = {}) => {
    const token = getAccessToken().trim();

    if (!token) {
        throw new Error('Войдите в учётную запись');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const body = response.status === 204
        ? null
        : await response.json();

    if (response.status === 401) {
        throw new Error(
            'Сессия недействительна или срок действия токена истёк. Выйдите и войдите снова',
        );
    }

    if (response.status === 403) {
        throw new Error('Недостаточно прав для выполнения операции');
    }

    if (!response.ok) {
        throw new Error(getErrorMessage(body));
    }

    return body;
};