import { Field, ObjectType } from '@nestjs/graphql';
import {
  AfterLoad,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ unique: true })
  @Field()
  nickname: string;

  @Column()
  @Field()
  fullName: string;

  @Column({ select: false })
  @Field({ nullable: true })
  password?: string;

  @Column('date')
  birthdate: Date;

  @Field()
  age: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  @Field(() => [User])
  followers: Array<User>;

  @ManyToMany(() => User, (user) => user.followers)
  @Field(() => [User])
  following: Array<User>;

  //
  // meta
  //

  @Column({ nullable: true, select: false })
  @Field({ nullable: true })
  recoveryCode?: string;

  @Column({ nullable: true, select: false })
  @Field({ nullable: true })
  refreshToken: string;

  //
  // listeners
  //

  @AfterLoad()
  async nullChecks() {
    if (!this.followers) {
      this.followers = [];
    }

    if (!this.following) {
      this.following = [];
    }
  }

  @AfterLoad()
  setAge() {
    this.age = Math.floor(
      (new Date().getTime() - new Date(this.birthdate).getTime()) / 3.15576e10,
    );
  }
}
