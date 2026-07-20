import { useState } from 'react';
import { FileText, Link2, ThumbsUp } from 'lucide-react';
import Tabs from '../ui/Tabs';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { getCommentsByLesson } from '../../mock';
import type { Lesson } from '../../mock/types';
import { cn } from '../../lib/cn';

function NotesTab({ lessonId }: { lessonId: string }) {
  const [note, setNote] = useState('');

  return (
    <div className="space-y-3">
      <label htmlFor={'note-' + lessonId} className="text-sm font-semibold text-ink-900">
        Ghi chú của bạn
      </label>
      <textarea
        id={'note-' + lessonId}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={6}
        placeholder="Ghi lại ý chính của bài học..."
        className="w-full rounded-btn border border-line bg-surface p-3 text-sm outline-none focus:border-brand-500"
      />
      <p className="text-xs text-ink-400">Ghi chú chỉ lưu tạm trong phiên làm việc này.</p>
    </div>
  );
}

function CommentsTab({ lessonId }: { lessonId: string }) {
  const comments = getCommentsByLesson(lessonId);

  if (comments.length === 0) {
    return <p className="text-sm text-ink-500">Chưa có bình luận nào cho bài học này.</p>;
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <article key={comment.id} className="flex gap-3">
          <Avatar name={comment.authorName} src={comment.authorAvatar} size="sm" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">{comment.authorName}</p>
            <p className="mt-1 text-sm text-ink-700">{comment.text}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-ink-500">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              {comment.likes}
            </span>
          </div>
        </article>
      ))}
      <Button variant="secondary" className="w-full" disabled>
        Viết bình luận (bản demo)
      </Button>
    </div>
  );
}

function ResourcesTab({ lesson }: { lesson: Lesson }) {
  if (lesson.resources.length === 0) {
    return <p className="text-sm text-ink-500">Bài học này chưa có tài liệu đính kèm.</p>;
  }

  return (
    <ul className="space-y-2">
      {lesson.resources.map((resource) => (
        <li key={resource.id}>
          <a
            href={resource.url}
            className="flex items-center gap-3 rounded-btn border border-line px-3 py-2 text-sm text-ink-700 hover:bg-surface-muted"
          >
            {resource.kind === 'link' ? (
              <Link2 className="h-4 w-4 text-ink-400" aria-hidden="true" />
            ) : (
              <FileText className="h-4 w-4 text-ink-400" aria-hidden="true" />
            )}
            {resource.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function LessonPanel({ lesson, className }: { lesson: Lesson; className?: string }) {
  return (
    <section className={cn('bg-surface p-4', className)}>
      <Tabs
        key={lesson.id}
        items={[
          { id: 'notes', label: 'Ghi chú', content: <NotesTab lessonId={lesson.id} /> },
          { id: 'comments', label: 'Bình luận', content: <CommentsTab lessonId={lesson.id} /> },
          { id: 'resources', label: 'Tài liệu', content: <ResourcesTab lesson={lesson} /> },
        ]}
      />
    </section>
  );
}
