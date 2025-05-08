import { useNavigate } from "react-router-dom";
import BackButton from "Components/Common/BackButton/BackButton";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import StatusSettings from "./StatusSettings";
import "./StagesPage.scss";
import SideStepNavigator from "Components/Sections/SideStepNavigator";



export default function StagesPage(): JSX.Element {
    const navigate = useNavigate();

    const handleNextStep = () => {
        navigate('/event-setup-save');
    };

    return (
        <div className="SetupContainer">
            <SideStepNavigator />
            <div className="StagesFormContainer">
                <div className="FormHeader">
                    <BackButton />
                    <h2>Настройка статусов, роботов и триггеров</h2>
                </div>
                <StatusSettings/>
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