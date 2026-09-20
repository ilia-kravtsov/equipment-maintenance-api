const getErrorMessage = (body) => {
    if (body?.error?.details?.length) {
        return body.error.details
            .map((detail) => `${detail.field}: ${detail.message}`)
            .join('; ');
    }

    return body?.error?.message ?? 'Произошла неизвестная ошибка';
};

export const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, options);
    const body = await response.json();

    if (!response.ok) {
        throw new Error(getErrorMessage(body));
    }

    return body;
};