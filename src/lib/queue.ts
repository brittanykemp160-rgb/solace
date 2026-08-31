// Async task queue with concurrency control

type Task<T> = () => Promise<T>;

export class Queue {
  private running = 0;
  private queue: Array<() => void> = [];
  private concurrency: number;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  async add<T>(task: Task<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      return await task();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }
}
