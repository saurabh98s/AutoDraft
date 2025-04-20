'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setActiveSection } from '../../store/slices/docSlice';

interface SectionNavProps {
  sections: Record<string, {
    id: string;
    title: string;
    content: string;
  }>;
}

const SectionNav: React.FC<SectionNavProps> = ({ sections }) => {
  const dispatch = useDispatch();
  const activeSectionId = useSelector((state: RootState) => state.doc.activeSectionId);

  const handleSectionClick = (sectionId: string) => {
    dispatch(setActiveSection(sectionId));
    
    // Scroll to the section
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="section-nav">
      <ul className="space-y-1">
        {Object.values(sections).map((section) => (
          <li key={section.id}>
            <button
              onClick={() => handleSectionClick(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeSectionId === section.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SectionNav; 