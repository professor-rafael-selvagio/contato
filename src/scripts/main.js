/**
 * Prof. Esp. Rafael de Sena Selvagio — Script Principal
 * Funcionalidades: Alternância de Tema Claro/Escuro, Filtragem de projetos,
 * Envio AJAX com Formspree, Validação em tempo real e Feedback Modal.
 */

// -------------------------------------------------------------
// 0. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
// -------------------------------------------------------------
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    function applyTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        if (themeMeta) {
            themeMeta.setAttribute('content', theme === 'dark' ? '#06090e' : '#f8fafc');
        }
        if (colorSchemeMeta) {
            colorSchemeMeta.setAttribute('content', theme);
        }
        if (themeToggleBtn) {
            const label = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
            themeToggleBtn.setAttribute('aria-label', label);
            themeToggleBtn.setAttribute('title', label);
        }
        if (save) {
            try {
                localStorage.setItem('portfolio-theme', theme);
            } catch (e) {}
        }
    }

    // Identifica o tema inicial
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('portfolio-theme');
    } catch (e) {}

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme, false);

    // Escuta clique no botão de alternância
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.add('theme-transitioning');
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme, true);
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    // Escuta mudança de preferência do sistema operacional (caso o usuário não tenha definido manualmente)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        try {
            if (!localStorage.getItem('portfolio-theme')) {
                applyTheme(e.matches ? 'dark' : 'light', false);
            }
        } catch (err) {}
    });
}

// Inicializa o gerenciador de tema
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// -------------------------------------------------------------
// 1. FILTRAGEM DINÂMICA DE PROJETOS POR CATEGORIA
// -------------------------------------------------------------
function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card-item');
    const buttons = document.querySelectorAll('.filter-chip');

    // Atualiza botões ativos e atributos de acessibilidade
    buttons.forEach(btn => {
        const isActive = btn.getAttribute('data-filter') === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Anima e filtra os cartões de forma fluida
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const matches = (category === 'all' || cardCategory === category);

        if (matches) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            });
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            setTimeout(() => {
                if (card.style.opacity === '0') {
                    card.style.display = 'none';
                }
            }, 240);
        }
    });
}

// -------------------------------------------------------------
// 2. CONFIGURAÇÃO DA URL DE RETORNO DO FORMSPREE (_next)
// -------------------------------------------------------------
const currentUrl = window.location.href.split('?')[0]; 
const nextField = document.getElementById('next-field');
if (nextField) {
    nextField.value = currentUrl + '?success=true';
}

// -------------------------------------------------------------
// 3. VERIFICAÇÃO DO PARÂMETRO ?success=true AO CARREGAR
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        openModal();
    }
});

// -------------------------------------------------------------
// 4. FUNÇÕES DO MODAL DE FEEDBACK
// -------------------------------------------------------------
function openModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    // Remove ?success=true da barra de endereço de forma limpa
    const cleanUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, document.title, cleanUrl);
}

// Fechar modal ao clicar fora da caixa de diálogo ou com tecla ESC
const successModal = document.getElementById('success-modal');
if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target.id === 'success-modal') {
            closeModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// -------------------------------------------------------------
// 5. TRATAMENTO DE VALIDAÇÃO VISUAL E ENVIO DO FORMULÁRIO
// Suporta AJAX com Fetch (experiência instantânea) e fallback padrão
// -------------------------------------------------------------
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

const groupName = document.getElementById('group-name');
const groupEmail = document.getElementById('group-email');
const groupMessage = document.getElementById('group-message');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(input, group, condition) {
    if (!condition) {
        group.classList.add('has-error');
        group.classList.remove('is-valid');
        return false;
    } else {
        group.classList.remove('has-error');
        group.classList.add('is-valid');
        return true;
    }
}

// Validação ao digitar/sair do campo
if (nameInput && groupName) {
    nameInput.addEventListener('input', () => {
        if (groupName.classList.contains('has-error')) {
            validateField(nameInput, groupName, nameInput.value.trim().length > 1);
        }
    });
}

if (emailInput && groupEmail) {
    emailInput.addEventListener('input', () => {
        if (groupEmail.classList.contains('has-error')) {
            validateField(emailInput, groupEmail, isValidEmail(emailInput.value.trim()));
        }
    });
}

if (messageInput && groupMessage) {
    messageInput.addEventListener('input', () => {
        if (groupMessage.classList.contains('has-error')) {
            validateField(messageInput, groupMessage, messageInput.value.trim().length > 3);
        }
    });
}

// Evento de envio com AJAX para UX ultra-rápida e estados visuais completos
if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isNameValid = validateField(nameInput, groupName, nameInput.value.trim().length > 1);
        const isEmailValid = validateField(emailInput, groupEmail, isValidEmail(emailInput.value.trim()));
        const isMessageValid = validateField(messageInput, groupMessage, messageInput.value.trim().length > 3);

        if (!isNameValid || !isEmailValid || !isMessageValid) {
            // Rola suavemente até o primeiro campo com erro
            const firstError = document.querySelector('.form-field-group.has-error input, .form-field-group.has-error textarea');
            if (firstError) firstError.focus();
            return;
        }

        // Estado visual de Loading
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Limpa formulário e classes de validação
                contactForm.reset();
                groupName.classList.remove('is-valid');
                groupEmail.classList.remove('is-valid');
                groupMessage.classList.remove('is-valid');
                openModal();
            } else {
                // Fallback para envio padrão caso o endpoint retorne restrição
                contactForm.submit();
            }
        } catch (err) {
            // Se o fetch falhar (ex: rede offline), submete de forma tradicional
            contactForm.submit();
        } finally {
            submitBtn.classList.remove('is-loading');
            submitBtn.disabled = false;
        }
    });
}

