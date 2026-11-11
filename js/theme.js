(function () {
    'use strict';
    var key = 'birl-theme';
    var root = document.documentElement;
    function apply(theme) {
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
        var button = document.getElementById('theme-toggle');
        if (button) {
            var light = theme === 'light';
            button.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
            button.setAttribute('title', light ? 'Ativar modo escuro' : 'Ativar modo claro');
            button.setAttribute('aria-pressed', String(light));
            button.querySelector('i').className = light ? 'fa fa-moon-o' : 'fa fa-sun-o';
        }
        document.dispatchEvent(new CustomEvent('birl-theme-change', {detail: theme}));
    }
    var saved;
    try { saved = window.localStorage.getItem(key); } catch (error) { /* Storage can be disabled. */ }
    apply(saved === 'light' ? 'light' : 'dark');
    document.addEventListener('DOMContentLoaded', function () {
        apply(root.getAttribute('data-theme'));
        document.getElementById('theme-toggle').addEventListener('click', function () {
            var theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            apply(theme);
            try { window.localStorage.setItem(key, theme); } catch (error) { /* Keep the toggle usable. */ }
        });
    });
    window.addEventListener('storage', function (event) {
        if (event.key === key) apply(event.newValue === 'light' ? 'light' : 'dark');
    });
}());
