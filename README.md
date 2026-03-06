# cofferestoran-demo

Restaurant website with interactive table booking system and visual seating map. Built with HTML, CSS and JavaScript.

## Auto Git Sync (VS Code)

Проект настроен на автоматическое сохранение правок в GitHub при открытии папки в VS Code:

- Фоновая задача: `.vscode/tasks.json` (`Auto Git Sync`)
- Скрипт слежения: `scripts/auto-git-sync.ps1`
- Логика: при изменении файлов делает `git add -A`, `git commit`, `git push origin main`

### Важно

- Нужны рабочие git-учетные данные на компьютере.
- Если push временно не прошел (сеть/авторизация), скрипт продолжит работу и отправит следующие правки.
- Чтобы остановить авто-синхронизацию, завершите задачу `Auto Git Sync` в VS Code.
