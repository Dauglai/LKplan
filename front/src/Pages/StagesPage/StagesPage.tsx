import { useNavigate } from "react-router-dom";
import BackButton from "Components/Common/BackButton/BackButton";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import StatusSettings from "./StatusSettings";
import "./StagesPage.scss";
import SideStepNavigator from "Components/Sections/SideStepNavigator";



/**
 * Страница настройки статусов мероприятия в процессе создания события.
 * Позволяет настроить статусы перед переходом к финальному сохранению мероприятия.
 * Включает навигацию по шагам создания и кнопку перехода к следующему шагу.
 * 
 * @component
 * @example
 * // Пример использования в роутинге:
 * <Route path="/event-setup-stages" element={<StagesPage />} />
 *
 * @returns {JSX.Element} Страница настройки статусов с навигацией и управлением
 */
export default function StagesPage(): JSX.Element {
    const navigate = useNavigate(); // Хук для навигации между страницами

    /**
     * Обработчик перехода к следующему шагу создания мероприятия
     */
    const handleNextStep = () => {
        navigate('/event-setup-save');
    };

    return (
        <div className="SetupContainer">
            <SideStepNavigator /> {/* Компонент боковой навигации по шагам */}
            <div className="StagesFormContainer">
                <div className="FormHeader">
                    <BackButton /> {/* Кнопка возврата назад */}
                    <h2>Настройка статусов</h2> {/* Заголовок страницы */}
                </div>
                <StatusSettings/> {/* Основной компонент настройки статусов */}
                <div className="buttons">
                    <button
                        className="primary-btn"
                        type="button"
                        onClick={handleNextStep}
                        >
                        Далее
                        <ChevronRightIcon width="24" height="24" strokeWidth="1" />
                    </button>
                </div>
            </div>
        </div>
    )
}