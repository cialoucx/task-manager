import { useState, useEffect } from 'react';

const empty = { title: '', description: '' };

export default function TaskForm({ onSubmit, initialValues, onCancel, submitLabel }) {
  const [values, setValues] = useState(initialValues || empty);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(initialValues || empty);
  }, [initialValues]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError('Give the task a title before saving.');
      return;
    }
    setError('');
    onSubmit({ title: values.title.trim(), description: values.description.trim() });
    if (!initialValues) setValues(empty);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <input
          type="text"
          placeholder="Task title…"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className="task-form__title"
          maxLength={200}
          aria-label="Task title"
        />
      </div>
      <div className="task-form__row">
        <textarea
          placeholder="Description (optional)"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className="task-form__description"
          rows={2}
          maxLength={2000}
          aria-label="Task description"
        />
      </div>
      {error && <p className="task-form__error" role="alert">{error}</p>}
      <div className="task-form__actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel || 'Add task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
