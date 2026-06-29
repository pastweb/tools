import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerAsyncTask, resolveAsyncTasks, TASKS } from '../../src/ssrUtils/asyncTasks';

// Use a mutable mock value so we can toggle isServer per test
let mockIsServer = false;

vi.mock('../../src/envs', () => ({
  get isServer() {
    return mockIsServer;
  },
}));

describe('asyncTasks (registerAsyncTask / resolveAsyncTasks)', () => {
  beforeEach(() => {
    // Clear any tasks left from previous tests
    TASKS.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    TASKS.length = 0;
  });

  it('should not register tasks when not on server (isServer = false)', () => {
    mockIsServer = false;

    const task = vi.fn().mockResolvedValue('done');
    registerAsyncTask(task);

    expect(TASKS).toHaveLength(0);
    expect(task).not.toHaveBeenCalled();
  });

  it('should register tasks only when on server (isServer = true)', () => {
    mockIsServer = true;

    const task1 = vi.fn().mockResolvedValue(1);
    const task2 = vi.fn().mockResolvedValue(2);

    registerAsyncTask(task1);
    registerAsyncTask(task2);

    expect(TASKS).toHaveLength(2);
    expect(task1).not.toHaveBeenCalled();
    expect(task2).not.toHaveBeenCalled();
  });

  it('should execute registered tasks when resolveAsyncTasks is called', async () => {
    mockIsServer = true;

    const task1 = vi.fn().mockResolvedValue('result1');
    const task2 = vi.fn().mockResolvedValue('result2');

    registerAsyncTask(task1);
    registerAsyncTask(task2);

    await resolveAsyncTasks();

    expect(task1).toHaveBeenCalledTimes(1);
    expect(task2).toHaveBeenCalledTimes(1);
    expect(TASKS).toHaveLength(0);
  });

  it('should clear tasks even if some throw', async () => {
    mockIsServer = true;

    const task1 = vi.fn().mockResolvedValue('ok');
    const failing = vi.fn().mockRejectedValue(new Error('boom'));
    const task3 = vi.fn().mockResolvedValue('ok3');

    registerAsyncTask(task1);
    registerAsyncTask(failing);
    registerAsyncTask(task3);

    await resolveAsyncTasks();

    expect(task1).toHaveBeenCalled();
    expect(failing).toHaveBeenCalled();
    expect(task3).toHaveBeenCalled();
    expect(TASKS).toHaveLength(0);
  });

  it('should handle nested task registration (task registers more tasks)', async () => {
    mockIsServer = true;

    const inner1 = vi.fn().mockResolvedValue('inner1');
    const inner2 = vi.fn().mockResolvedValue('inner2');
    const outer = vi.fn().mockImplementation(async () => {
      // outer task registers two more during its execution
      registerAsyncTask(inner1);
      registerAsyncTask(inner2);
      return 'outer';
    });

    registerAsyncTask(outer);

    await resolveAsyncTasks();

    expect(outer).toHaveBeenCalledTimes(1);
    expect(inner1).toHaveBeenCalledTimes(1);
    expect(inner2).toHaveBeenCalledTimes(1);
    expect(TASKS).toHaveLength(0);
  });

  it('should support deeply nested registrations', async () => {
    mockIsServer = true;

    const level3 = vi.fn().mockResolvedValue('l3');
    const level2 = vi.fn().mockImplementation(async () => {
      registerAsyncTask(level3);
      return 'l2';
    });
    const level1 = vi.fn().mockImplementation(async () => {
      registerAsyncTask(level2);
      return 'l1';
    });

    registerAsyncTask(level1);

    await resolveAsyncTasks();

    expect(level1).toHaveBeenCalledTimes(1);
    expect(level2).toHaveBeenCalledTimes(1);
    expect(level3).toHaveBeenCalledTimes(1);
    expect(TASKS).toHaveLength(0);
  });

  it('should do nothing when no tasks are registered', async () => {
    mockIsServer = true;

    await resolveAsyncTasks();

    expect(TASKS).toHaveLength(0);
  });

  it('should allow registering after resolve (new registrations go to next call)', async () => {
    mockIsServer = true;

    const first = vi.fn().mockResolvedValue('first');
    const second = vi.fn().mockResolvedValue('second');

    registerAsyncTask(first);
    await resolveAsyncTasks();

    expect(first).toHaveBeenCalledTimes(1);
    expect(TASKS).toHaveLength(0);

    registerAsyncTask(second);
    await resolveAsyncTasks();

    expect(second).toHaveBeenCalledTimes(1);
    expect(TASKS).toHaveLength(0);
  });
});
