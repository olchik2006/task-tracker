import { describe, it, expect } from 'vitest';
import { filterTasks, countTasks, sortTasksById } from '../utils/taskUtils.js';

const mockTasks = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Write tests', done: true },
  { id: 3, title: 'Push to GitHub', done: false }
];

describe('filterTasks', () => {
  it('should return all tasks when filter is "all"', () => {
    const result = filterTasks(mockTasks, 'all');
    expect(result.length).toBe(3);
  });

  it('should return only active tasks', () => {
    const result = filterTasks(mockTasks, 'active');
    expect(result.length).toBe(2);
    expect(result.every(t => !t.done)).toBe(true);
  });

  it('should return only done tasks', () => {
    const result = filterTasks(mockTasks, 'done');
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Write tests');
  });
});

describe('countTasks', () => {
  it('should return correct total count', () => {
    const result = countTasks(mockTasks);
    expect(result.total).toBe(3);
  });

  it('should return correct done count', () => {
    const result = countTasks(mockTasks);
    expect(result.done).toBe(1);
  });

  it('should return correct active count', () => {
    const result = countTasks(mockTasks);
    expect(result.active).toBe(2);
  });
});

describe('sortTasksById', () => {
  it('should sort tasks by id in ascending order', () => {
    const shuffled = [mockTasks[2], mockTasks[0], mockTasks[1]];
    const result = sortTasksById(shuffled);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });

  it('should not mutate the original array', () => {
    const original = [...mockTasks];
    sortTasksById(mockTasks);
    expect(mockTasks).toEqual(original);
  });
});