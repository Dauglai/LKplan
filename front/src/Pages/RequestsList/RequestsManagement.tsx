import { useEffect, useState } from "react";
import { useGetApplicationsQuery } from "Features/ApiSlices/applicationSlice";
import RequestsListTable from "./RequestsListTable";
import 'Styles/components/Sections/ListTableStyles.scss';
import { useGetUserQuery } from "Features/ApiSlices/userSlice";
import ListsHeaderPanel from "Components/PageComponents/ListsHeaderPanel";
import { ChangeStatusModal } from "Components/PageComponents/ChangeStatusModal";
import { Button } from "antd";
import BackButton from "Widgets/BackButton/BackButton";
import UniversalInput from "Components/Common/UniversalInput";

export default function RequestsManagement(): JSX.Element {
  const { data: requests = [], isLoading } = useGetApplicationsQuery();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Список заявок - MeetPoint";
  }, []);

  const handleSearch = (value: string) => setSearch(value.toLowerCase());

  const filteredRequests = requests.filter((request) => {
    const { user } = request;
    const fullName = `${user.surname} ${user.name} ${user.patronymic}`.toLowerCase();
    return fullName.includes(search);
  });

  if (isLoading || isUserLoading) return <div>Загрузка...</div>;

  return (
    <div className="RequestsContainer ListTableContainer">
      <header className="ListsHeaderPanel HeaderPanel">
        <div className="LeftHeaderPanel">
          <BackButton />
          <h2 className="HeaderPanelTitle">Список заявок</h2>
        </div>

        <div className="RightHeaderPanel">
            <UniversalInput
                value={search}
                onChange={handleSearch}
                type="text"
                placeholder="Поиск по ФИО"
                withPlaceholder={true}
            />
            <Button
                type="primary"
                onClick={() => setIsChangeStatusModalOpen(true)}
                disabled={selectedIds.length === 0}
            >
                Изменить статус выбранных
            </Button>
        </div>
      </header>

      <RequestsListTable
        requests={filteredRequests}
        role={user?.role ?? "student"} // или другой дефолт
        onSelectionChange={setSelectedIds}
      />

      {isChangeStatusModalOpen && (
        <ChangeStatusModal
          open={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}
  