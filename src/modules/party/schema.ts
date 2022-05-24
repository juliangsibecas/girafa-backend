import { Field, ObjectType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
import {
  AfterLoad,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user';

@Entity('parties')
@ObjectType()
export class Party {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  address: string;

  @Column('date')
  @Field(() => DateResolver)
  date: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  minAge?: string;

  @Column()
  @Field()
  openBar: boolean;

  @Column()
  @Field()
  description: string;

  @ManyToMany(() => User, (user) => user.attendedParties)
  @JoinTable()
  @Field(() => [User])
  attenders: Array<User>;

  @ManyToOne(() => User, (user) => user.organizedParties)
  @Field(() => User)
  organizer: User;

  //
  // listeners
  //

  @AfterLoad()
  async nullChecks() {
    if (!this.attenders) {
      this.attenders = [];
    }
  }
}
