import { Role } from "../roles";

/**
 * Represents a user of the Foot Patrol system.
 */
export class User {
  public id: number;
  public firstName: string;
  public lastName: string;
  public role: Role;

  public get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
