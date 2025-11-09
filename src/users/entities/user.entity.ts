import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
