import SpecializationManagement from "./SpecializationManagement";
import StatusAppManagement from "./StatusAppManagement";
import UserManagement from "./UserManagement";
import TeamManagement from "./TeamManagement";
import "./AdminPage.scss";

export default function AdminPage () : JSX.Element {

    return (
        <div className="adminPage">
            <SpecializationManagement />
            <StatusAppManagement />
            <UserManagement />
            <TeamManagement />
        </div>
    )
}