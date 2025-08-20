import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lock, PlayCircle } from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  package_access: string;
}
interface Lesson {
  id: string;
  title: string;
  required_package: string[];
}
interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}
interface Module {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface LmsSidebarProps {
  modules: Module[];
  user: UserSession;
  activeLessonId: string | null;
  onLessonClick: (lessonId: string) => void;
}

const LmsSidebar: React.FC<LmsSidebarProps> = ({ modules, user, activeLessonId, onLessonClick }) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r h-full overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-4 px-2">Materi Pembelajaran</h2>
      <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="w-full">
        {modules.map((module, index) => (
          <div key={module.id} className="mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase px-2 mb-2">Modul {index + 1}</p>
            <h3 className="text-lg font-bold px-2 mb-2">{module.title}</h3>
            {module.chapters.map((chapter) => (
              <AccordionItem key={chapter.id} value={chapter.id} className="border-none">
                <AccordionTrigger className="text-base font-medium px-2 hover:bg-gray-100 rounded-md">
                  {chapter.title}
                </AccordionTrigger>
                <AccordionContent className="pl-4 mt-2">
                  <ul className="space-y-1">
                    {chapter.lessons.map(lesson => {
                      const hasAccess = user.email === 'admin@bibooster.com' || lesson.required_package?.includes(user.package_access);
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => hasAccess && onLessonClick(lesson.id)}
                            disabled={!hasAccess}
                            className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors ${
                              activeLessonId === lesson.id
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'hover:bg-gray-100 text-gray-700'
                            } ${!hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
                          >
                            {hasAccess ? (
                                <PlayCircle size={18} className="flex-shrink-0" />
                            ) : (
                                <Lock size={18} className="flex-shrink-0 text-gray-400" />
                            )}
                            <span>{lesson.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </aside>
  );
};

export default LmsSidebar;