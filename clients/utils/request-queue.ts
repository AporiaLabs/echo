/**
 * Utility class for rate-limiting and queuing requests
 */
export class RequestQueue {
  private queue: Array<() => Promise<any>>;
  private processing: boolean;

  constructor() {
    this.queue = [];
    this.processing = false;
  }

  /**
   * Adds a request to the queue
   * @param request - Async function to execute
   * @returns Promise resolving to the request result
   */
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}
