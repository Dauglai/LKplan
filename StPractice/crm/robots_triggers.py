# Импорт необходимых модулей
import httpx  # Асинхронный HTTP-клиент
from django.db import transaction  # Для работы с транзакциями БД
from asgiref.sync import sync_to_async  # Преобразование синхронных методов в асинхронные
from django.utils import timezone  # Работа с датой и временем
from .models import Application, Status, FunctionOrder  # Импорт моделей приложения
import json  # Работа с JSON-файлами

# Асинхронные обертки для ORM-запросов
async_get = sync_to_async(Application.objects.get, thread_sensitive=True)  # Асинхронное получение объекта
async_save = sync_to_async(Application.save, thread_sensitive=True)  # Асинхронное сохранение объекта


async def move_application_status(application_id: int, new_status_name: str):
    """Асинхронно изменяет статус заявки и запускает связанные действия"""
    try:
        # Атомарная транзакция для обеспечения целостности данных
        async with transaction.atomic():
            # Получение объекта заявки
            application = await async_get(id=application_id)
            # Получение нового статуса
            new_status = await sync_to_async(Status.objects.get)(name=new_status_name)

            # Обновление статуса заявки
            application.status = new_status
            await async_save(application)

            # Запуск обработки связанных функций
            await process_status_functions(application)
            return True, "Статус успешно изменен"

    except Status.DoesNotExist:
        # Обработка отсутствия статуса
        return False, f"Статус {new_status_name} не найден"
    except Exception as e:
        # Общая обработка ошибок
        return False, f"Ошибка: {str(e)}"


async def send_telegram_notification(application_id: int, config: dict):
    """Асинхронная отправка сообщения через Telegram Bot API"""
    try:
        # Создание асинхронного HTTP-клиента
        async with httpx.AsyncClient() as client:
            # Получение объекта заявки
            application = await async_get(id=application_id)
            # Формирование сообщения из шаблона
            message = config.get('message', 'Статус изменен: {status}').format(
                status=application.status.name
            )

            # Отправка запроса к Telegram API
            url = f"https://api.telegram.org/bot{config['bot_token']}/sendMessage"
            response = await client.post(
                url,
                json={
                    "chat_id": config['chat_id'],
                    "text": message,
                    "parse_mode": "HTML"
                }
            )
            # Проверка статуса ответа
            response.raise_for_status()
            return True, "Уведомление отправлено"

    except Exception as e:
        # Обработка ошибок отправки
        return False, f"Ошибка отправки: {str(e)}"


async def process_status_functions(application):
    """Обработка цепочки функций, связанных с текущим статусом"""
    # Получение списка функций, отсортированных по позиции
    functions = await sync_to_async(list)(
        FunctionOrder.objects.filter(
            status_order__status=application.status
        ).order_by('position').select_related('robot', 'trigger')
    )

    # Последовательное выполнение функций
    for function in functions:
        if function.type_function == "robot":
            await execute_robot(function, application)
        elif function.type_function == "trigger":
            await check_trigger(function, application)


async def execute_robot(function_order, application):
    """Выполнение действия, связанного с роботом"""
    try:
        # Загрузка конфигурации из JSON
        config = json.loads(function_order.config)

        # Определение типа действия робота
        if function_order.robot.action_type == "move_status":
            # Вызов функции изменения статуса
            result, message = await move_application_status(
                application.id,
                config['target_status']
            )
        elif function_order.robot.action_type == "notification":
            # Вызов функции отправки уведомления
            result, message = await send_telegram_notification(
                application.id,
                config
            )

    except Exception as e:
        # Обработка ошибок выполнения
        result, message = False, f"Ошибка выполнения: {str(e)}"


async def check_trigger(function_order, application):
    """Проверка условий триггера"""
    try:
        # Загрузка конфигурации триггера
        config = json.loads(function_order.config)

        # Определение обработчика для типа триггера
        handler = {
            "time_expiration": check_time_trigger,
            "status_check": check_status_trigger,
            "field_comparison": check_field_trigger
        }.get(function_order.trigger.trigger_type)

        # Проверка условия триггера
        condition_met, _ = await handler(application, config)

        if condition_met:
            # Запуск связанных действий при выполнении условия
            for action in await sync_to_async(list)(function_order.trigger.actions.all()):
                await execute_robot(action, application)

    except Exception as e:
        # Подавление ошибок проверки триггера
        pass


async def check_time_trigger(application, config):
    """Проверка временного условия"""
    # Расчет временного интервала
    delta = timezone.timedelta(**{config['interval']: config['value']})
    # Получение значения поля из заявки
    target_field = getattr(application, config.get('field', 'updated_at'))
    # Проверка истечения времени
    return timezone.now() > target_field + delta


async def check_status_trigger(application, config):
    """Проверка текущего статуса"""
    return application.status.name == config['status']


async def check_field_trigger(application, config):
    """Сравнение значения поля заявки"""
    # Получение значения поля
    field_value = getattr(application, config['field'])
    # Определение оператора сравнения
    operator = {
        '>': lambda a, b: a > b,
        '<': lambda a, b: a < b,
        '==': lambda a, b: a == b,
        '!=': lambda a, b: a != b
    }[config['operator']]
    # Выполнение сравнения
    return operator(field_value, config['value'])
