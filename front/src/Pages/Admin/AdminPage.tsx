import SpecializationManagement from "./SpecializationManagement";
import StatusAppManagement from "./StatusAppManagement";
import UserManagement from "./UserManagement";
import TeamManagement from "./TeamManagement";
import EventManagement from "./EventManagement";
import DirectionManagement from "./DirectionManagement";
import ProjectManagement from "./ProjectManager";
import ApplicationManagement from "./ApplicationManagement";
import "./AdminPage.scss";

export default function AdminPage () : JSX.Element {

    return (
        <div className="adminPage">
            <SpecializationManagement />
            <StatusAppManagement />
            <UserManagement />
            <TeamManagement />
            <EventManagement />
            <DirectionManagement />
            <ProjectManagement />
            <ApplicationManagement />
        </div>
    )
}