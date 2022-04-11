import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from "../entity/user";
import {Observable} from "rxjs";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  createUser(firstName: string, lastName: string, email: string): User {
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.firstVisit = true;


    const userEntity = this.userRepository.create(user);
    this.userRepository.save(userEntity);

    return userEntity;
  }
}
