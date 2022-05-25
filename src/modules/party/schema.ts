import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
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
import { PartyAvailability } from './types';

registerEnumType(PartyAvailability, {
  name: 'PartyAvailability',
});

@Entity('parties')
@ObjectType()
export class Party {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column('text')
  @Field(() => PartyAvailability)
  availability: PartyAvailability;

  @Column()
  @Field()
  allowInivites: boolean;

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

  @ManyToMany(() => User, (user) => user.invites)
  @JoinTable()
  @Field(() => [User])
  invited: Array<User>;

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
