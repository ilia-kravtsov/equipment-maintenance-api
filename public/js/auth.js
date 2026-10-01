import { configureApi } from './api.js';
import { setMessage } from './ui.js';

export const initAuth = () => {
    const loginForm = document.querySelector('#login-form');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const passwordInput = document.querySelector('#auth-password');
    const sessionPanel = document.querySelector('#session-panel');
    const sessionUser = document.querySelector('#session-user');
    const logoutButton = document.querySelector('#logout-button');
    const message = document.querySelector('#auth-message');
    const toggleModeButton = document.querySelector('#toggle-auth-mode');
    const equipmentPanel = document.querySelector('#create-equipment-panel');
    const requestPanel = document.querySelector('#create-request-panel');

    let isRegistration = false;

    toggleModeButton.addEventListener('click', () => {
        isRegistration = !isRegistration;

        loginButton.textContent = isRegistration
            ? 'Зарегистрироваться'
            : 'Войти';

        toggleModeButton.textContent = isRegistration
            ? 'Уже есть учётная запись'
            : 'Создать учётную запись';

        passwordInput.autocomplete = isRegistration
            ? 'new-password'
            : 'current-password';

        if (isRegistration) {
            passwordInput.minLength = 8;
        } else {
            passwordInput.removeAttribute('minlength');
        }

        passwordInput.value = '';
        setMessage(message, '');
    });

    let accessToken = '';

    configureApi(() => accessToken);

    const applySession = (session) => {
        accessToken = session.accessToken;

        sessionUser.textContent =
            `${session.user.email} - ${session.user.role}`;

        loginForm.hidden = true;
        sessionPanel.hidden = false;

        equipmentPanel.hidden = session.user.role !== 'admin';
        requestPanel.hidden = !['admin', 'technician'].includes(session.user.role);
        document.dispatchEvent(new Event('auth:login'));
    };

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginButton.disabled = true;
        toggleModeButton.disabled = true;

        setMessage(
            message,
            isRegistration ? 'Регистрация...' : 'Вход...',
        );

        const formData = new FormData(loginForm);

        try {
            const endpoint = isRegistration ? 'register' : 'login';

            const response = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: String(formData.get('email')).trim(),
                    password: String(formData.get('password')),
                }),
            });

            const body = await response.json();

            if (!response.ok) {
                const errorMessage = isRegistration && response.status === 409
                    ? 'Этот email уже зарегистрирован'
                    : response.status === 401
                        ? 'Неверный email или пароль'
                        : body?.error?.message ?? 'Не удалось выполнить запрос';

                throw new Error(errorMessage);
            }

            if (isRegistration) {
                toggleModeButton.disabled = false;
                toggleModeButton.click();
                setMessage(message, 'Учётная запись создана. Введите пароль и войдите', 'success');
            } else {
                applySession(body.data);
                setMessage(message, 'Вход выполнен', 'success');
            }
        } catch (error) {
            setMessage(
                message,
                error instanceof Error
                    ? error.message
                    : 'Не удалось выполнить запрос',
                'error',
            );
        } finally {
            passwordInput.value = '';
            loginButton.disabled = false;
            toggleModeButton.disabled = false;
        }
    });

    logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        setMessage(message, 'Выход...');

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Не удалось выйти. Повторите попытку.');
            }

            accessToken = '';

            window.location.reload();
        } catch (error) {
            setMessage(
                message,
                error instanceof Error
                    ? error.message
                    : 'Не удалось выйти',
                'error',
            );
        } finally {
            logoutButton.disabled = false;
        }
    });

    const restoreSession = async () => {
        loginButton.disabled = true;
        toggleModeButton.disabled = true;
        setMessage(message, 'Проверка сессии...');

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'same-origin',
            });

            if (response.status === 401) {
                setMessage(message, 'Войдите в учётную запись');
                return;
            }

            if (!response.ok) {
                throw new Error('Не удалось восстановить сессию');
            }

            const body = await response.json();

            applySession(body.data);
            setMessage(message, 'Сессия восстановлена', 'success');
        } catch (error) {
            setMessage(
                message,
                error instanceof Error
                    ? error.message
                    : 'Не удалось восстановить сессию',
                'error',
            );
        } finally {
            loginButton.disabled = false;
            toggleModeButton.disabled = false;
        }
    };

    void restoreSession();
};