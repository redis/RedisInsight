import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';

export abstract class CustomTutorialRepository {
  /**
   * Create custom tutorial entity
   * @param model
   * @return CustomTutorial
   */
  abstract create(model: CustomTutorial): Promise<CustomTutorial>;

  /**
   * Create custom tutorial entity
   * @param id
   * @return CustomTutorial
   */
  abstract get(id: string): Promise<CustomTutorial>;

  /**
   * Get list of custom tutorials
   */
  abstract list(): Promise<CustomTutorial[]>;

  /**
   * Delete custom tutorial by id
   */
  abstract delete(id: string): Promise<void>;
}
