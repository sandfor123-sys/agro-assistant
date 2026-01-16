'use client';

import { List } from 'lucide-react';

export default function TaskScrollButton() {
  const scrollToTasks = () => {
    const tasksSection = document.getElementById('weekly-tasks-section');
    if (tasksSection) {
      tasksSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <button
      onClick={scrollToTasks}
      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold flex items-center gap-2"
    >
      <List size={16} />
      Voir les tâches
    </button>
  );
}
