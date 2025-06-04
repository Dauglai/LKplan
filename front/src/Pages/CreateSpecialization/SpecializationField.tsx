import CreateSpecializationModal from 'Pages/CreateSpecialization/CreateSpecializationModal';
import PlusIcon from 'assets/icons/plus.svg?react';
import { useState } from 'react';
import SpecializationSelector from 'Components/Selectors/SpecializationSelector';
import "./SpecializationField.scss";


export default function SpecializationField({ 
  selectedSpecializations, 
  onChange 
}: {
  selectedSpecializations: number[];
  onChange: (ids: number[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="SpecializationField">
      <div className="SpecializationSelectorWrapper">
        <SpecializationSelector
          selectedSpecializations={selectedSpecializations}
          onChange={onChange}
        />
        <button 
          type="button" 
          className="AddSpecializationBtn"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon width="16" height="16" />
        </button>
      </div>
      
      <CreateSpecializationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpecializationCreated={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}