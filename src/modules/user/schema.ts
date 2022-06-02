import { Field, ObjectType } from '@nestjs/graphql';
import {
  AfterLoad,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notification } from '../notification/schema';
import { Party } from '../party';

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

  @OneToMany(() => Party, (party) => party.organizer)
  @Field(() => [Party])
  organizedParties: Array<Party>;

  @ManyToMany(() => Party, (party) => party.attenders)
  @JoinTable()
  @Field(() => [Party])
  attendedParties: Array<Party>;

  @ManyToMany(() => Party, (party) => party.invited)
  @JoinTable()
  @Field(() => [Party])
  invites: Array<Party>;

  @OneToMany(() => Notification, (notification) => notification.user)
  @JoinTable()
  @Field(() => [Notification])
  notifications: Array<Notification>;

  //
  // meta
  //

  @Column({ nullable: true, select: false })
  @Field({ nullable: true })
  recoveryCode?: string;

  @Column({ nullable: true, select: false })
  @Field({ nullable: true })
  refreshToken?: string;

  //
  // listeners
  //

  @AfterLoad()
  async nullChecks() {
    this.followers ??= [];
    this.following ??= [];
    this.organizedParties ??= [];
    this.attendedParties ??= [];
    this.invites ??= [];
    this.notifications ??= [];
  }
}
