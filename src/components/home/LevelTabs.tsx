import Tabs from '../ui/Tabs';
import CardGrid from './CardGrid';
import { getCoursesByLevel } from '../../mock';
import { LEVEL_LABEL, type Level } from '../../mock/types';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

export default function LevelTabs() {
  return (
    <section>
      <h2 className="mb-4 text-display-xs text-primary">Khoá học theo cấp độ</h2>
      <Tabs
        items={LEVELS.map((level) => ({
          id: level,
          label: LEVEL_LABEL[level],
          content: <CardGrid courses={getCoursesByLevel(level)} />,
        }))}
      />
    </section>
  );
}
