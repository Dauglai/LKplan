import './App.scss';
import MainPageImage from 'assets/MainPageImage.png';
import CRMIcon from 'assets/CRMIcon.svg';
import MeetPointIcon from 'assets/MeetPointIcon.svg';
import PageBuilderIcon from 'assets/PageBuilderIcon.svg';
import FeedbackIcon from 'assets/FeedbackIcon.svg';
import ManagementIcon from 'assets/ManagementIcon.svg';
import JointWorkIcon from 'assets/JointWorkIcon.svg';
import IntegrationIcon from 'assets/IntegrationIcon.svg';
import DevelopmentIcon from 'assets/DevelopmentIcon.svg';
import PersonalizationIcon from 'assets/PersonalizationIcon.svg';

function App(): JSX.Element {

	return (
		<div className="MainPageContainer">
			<div className="MainInfoContainer">
				<div className="MainInfoLeftSide">
					<h1 className="MainIfoTitle">Откройте для себя новые возможности с MeetPoint!</h1>
					<p>MeetPoint - инновационная платформа для проффесионального развития, предоставляющая
						все необходимые инструменты для эффективной работы и управления проектами.</p>
				</div>
				<img src={MainPageImage} alt="Main Page" ></img>
			</div>

			<div className="OpportunitiesInfoContainer">
				<h1 className="OpportunitiesInfoTitle">Возможности MeetPoint</h1>
				<p>MeetPoint предоставляет мощный личный кабинет для стажеров, множество функциональных возможностей.</p>
				<ul className="OpportunitiesList">
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">CRM модуль</h2>
						<img src={CRMIcon} alt="CRMIcon" />
						<p className="OpportunitiesDescription">Формирование форм, сбор заявок и управление контактами для эффективного взаимодействия.</p>
					</li>
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">Точка сборки</h2>
						<img src={MeetPointIcon} alt="MeetPointIcon" />
						<p className="OpportunitiesDescription">Удобная платформа для совместной работы и обсуждения проектных решений.</p>
					</li>
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">Конструктор страниц</h2>
						<img src={PageBuilderIcon} alt="PageBuilderIcon" />
						<p className="OpportunitiesDescription">Шаблоны для создания страниц с объявлениями о стажировке и практике с подробными описаниями условий.</p>
					</li>
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">Обратная связь и оценки</h2>
						<img src={FeedbackIcon} alt="FeedbackIcon" />
						<p className="OpportunitiesDescription">Регулярная оценка компетенций и получение рекомендаций для профессионального роста.</p>
					</li>
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">Управление проектами и задачами</h2>
						<img src={ManagementIcon} alt="ManagementIcon" />
						<p className="OpportunitiesDescription">Планирование, распределение задач и контроль сроков выполнения с помощью диаграммы Ганта и доски Канбан.</p>
					</li>
					<li className="OpportunitiesListItem">
						<h2 className="OpportunitiesTitle">Совместная работа и командное взаимодействие</h2>
						<img src={JointWorkIcon} alt="JointWorkIcon" />
						<p className="OpportunitiesDescription">Эффективное сотрудничество, организация команд, проведение планёрок и обсуждений задач для успешной реализации проектов.</p>
					</li>
				</ul>
			</div>

			<div className="AdvantagesInfoContainer">
				<h1 className="AdvantagesInfoTitle">Преимущеcтва сервиса MeetPoint</h1>
				<ul className="AdvantagesList">
					<li className="AdvantagesListItem">
						<h3 className="AdvantagesTitle">Интеграция инструментов</h3>
						<img src={IntegrationIcon} alt="IntegrationIcon" />
						<p className="AdvantagesDescription">MeetPoint объединяет совместную работу, управление проектами и CRM в одной платформе.</p>
					</li>
					<li className="AdvantagesListItem">
						<h3 className="AdvantagesTitle">Профессиональное развитие</h3>
						<img src={DevelopmentIcon} alt="DevelopmentIcon" />
						<p className="AdvantagesDescription">Платформа способствует постоянному развитию профессиональных навыков через систему оценки компетенций и обратной связи.</p>
					</li>
					<li className="AdvantagesListItem">
						<h3 className="AdvantagesTitle">Гибкость и персонализация</h3>
						<img src={PersonalizationIcon} alt="PersonalizationIcon" />
						<p className="AdvantagesDescription">MeetPoint предлагает гибкие настройки для управления проектами и командами, соответствующие потребностям</p>
					</li>
				</ul>
			</div>
		</div>
	);
}

export default App;
